import { db } from './db';
import { jobs, jobAssignments, p4pConfigs, employees, incidents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface P4PCalculationResult {
  assignmentId: string;
  performancePay: number;
  hourlyEquivalent: number;
  details: {
    laborRevenue: number;
    revenuePercentage: number;
    teamSize: number;
    jobsiteHours: number;
    baseCalculation: number;
    trainingBonus: number;
    largejobBonus: number;
    seasonalBonus: number;
    minimumWageGap: number;
    incidentDeductions: number;
    estimateReviewBonuses: number;
  };
}

export class P4PCalculationEngine {
  
  /**
   * Calculate P4P for a specific job assignment based on business rules
   */
  static async calculateP4PForAssignment(assignmentId: string): Promise<P4PCalculationResult | null> {
    try {
      // Get assignment details with job and employee info
      const [assignment] = await db
        .select({
          assignment: jobAssignments,
          job: jobs,
          employee: employees
        })
        .from(jobAssignments)
        .leftJoin(jobs, eq(jobAssignments.jobId, jobs.id))
        .leftJoin(employees, eq(jobAssignments.employeeId, employees.id))
        .where(eq(jobAssignments.id, assignmentId));

      if (!assignment || !assignment.job || !assignment.employee) {
        console.error(`Assignment not found or missing data: ${assignmentId}`);
        return null;
      }

      // CRITICAL: Only calculate P4P for completed jobs
      if (assignment.job.status !== 'completed') {
        console.log(`Job ${assignment.job.id} not completed yet - no P4P calculation`);
        return {
          assignmentId,
          performancePay: 0,
          hourlyEquivalent: 0,
          details: {
            laborRevenue: 0,
            revenuePercentage: 0,
            teamSize: 0,
            jobsiteHours: 0,
            baseCalculation: 0,
            trainingBonus: 0,
            largejobBonus: 0,
            seasonalBonus: 0,
            minimumWageGap: 0,
            incidentDeductions: 0,
            estimateReviewBonuses: 0,
          }
        };
      }

      // Get P4P configuration for this job type
      const [p4pConfig] = await db
        .select()
        .from(p4pConfigs)
        .where(and(
          eq(p4pConfigs.jobType, assignment.job.jobType),
          eq(p4pConfigs.isActive, true)
        ));

      if (!p4pConfig) {
        console.error(`No P4P config found for job type: ${assignment.job.jobType}`);
        return null;
      }

      // Get all team members for this job
      const teamAssignments = await db
        .select()
        .from(jobAssignments)
        .where(eq(jobAssignments.jobId, assignment.job.id));

      const teamSize = teamAssignments.length;
      const totalHours = parseFloat(assignment.assignment.hoursWorked || '0'); // For base pay calculations
      const jobsiteHours = parseFloat(assignment.assignment.jobsiteHours || '0'); // For P4P calculations
      const laborRevenue = parseFloat(assignment.job.laborRevenue || '0');
      const budgetedHours = parseFloat(assignment.job.budgetedHours || '0');

      if (jobsiteHours === 0) {
        console.warn(`No jobsite hours worked for assignment: ${assignmentId}`);
        return null;
      }

      // Calculate base P4P using business rules
      const revenuePercentage = parseFloat(p4pConfig.laborRevenuePercentage || '33') / 100;
      
      // Debug logging (can be removed in production)
      // console.log(`P4P Calculation Debug for ${assignmentId}:`);
      // console.log(`  Labor Revenue: $${laborRevenue}`);
      // console.log(`  Revenue Percentage: ${revenuePercentage * 100}%`);
      // console.log(`  Team Size: ${teamSize}`);
      // console.log(`  Hours Worked: ${hoursWorked}`);
      
      // Base calculation: % of labor revenue split among team
      const baseCalculation = (laborRevenue * revenuePercentage) / teamSize;
      console.log(`  Base Calculation: $${baseCalculation.toFixed(2)}`);
      
      // Training bonus: $4/hour if isTraining = true (based on jobsite hours)
      const trainingBonus = assignment.assignment.isTraining ? 
        (jobsiteHours * parseFloat(p4pConfig.trainingBonusPerHour || '4')) : 0;
      
      // Large job bonus: $1.50/budgeted hour for 49+ hour jobs
      const largejobBonus = budgetedHours >= parseFloat(p4pConfig.largejobBonusThreshold?.toString() || '49') ?
        (budgetedHours * parseFloat(p4pConfig.largejobBonusPerHour || '1.5')) / teamSize : 0;
      
      // Seasonal bonus: March-May gets 40% instead of 33%
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const isSeasonalPeriod = currentMonth >= 3 && currentMonth <= 5; // March-May
      const seasonalBonus = isSeasonalPeriod && assignment.job.isSeasonalBonus ? 
        (laborRevenue * 0.07) / teamSize : 0; // 7% additional (40% - 33%)
      
      // Get incident adjustments for this employee
      const employeeIncidents = await db
        .select()
        .from(incidents)
        .where(eq(incidents.employeeId, assignment.employee.id));
      
      // Calculate incident deductions (yellow slips, property damage, equipment damage)
      const incidentDeductions = employeeIncidents
        .filter(i => ['yellow_slip', 'property_damage', 'equipment_damage'].includes(i.type))
        .reduce((sum, incident) => sum + parseFloat(incident.cost || '0'), 0);
      
      // Calculate bonuses for estimates and reviews ($25 each)
      const estimateReviewBonuses = employeeIncidents
        .filter(i => ['customer_review', 'estimate_completed'].includes(i.type))
        .length * 25; // $25 bonus per estimate/review
      
      // Total P4P with incident adjustments
      let totalP4P = baseCalculation + trainingBonus + largejobBonus + seasonalBonus + estimateReviewBonuses - incidentDeductions;
      
      // Minimum wage protection: Use employee's individual base hourly rate (based on total hours for base pay)
      const employeeBaseRate = parseFloat(assignment.employee.baseHourlyRate || '18.00');
      const minimumPay = totalHours * employeeBaseRate;
      const minimumWageGap = Math.max(0, minimumPay - totalP4P);
      
      console.log(`  Employee Base Rate: $${employeeBaseRate}/hour`);
      console.log(`  Minimum Pay (${totalHours}h × $${employeeBaseRate}): $${minimumPay.toFixed(2)}`);
      
      // Final P4P amount (minimum wage is handled separately in payroll)
      const finalP4P = totalP4P;
      const hourlyEquivalent = finalP4P / jobsiteHours; // P4P efficiency based on productive hours

      return {
        assignmentId,
        performancePay: finalP4P,
        hourlyEquivalent,
        details: {
          laborRevenue,
          revenuePercentage: revenuePercentage * 100,
          teamSize,
          jobsiteHours,
          baseCalculation,
          trainingBonus,
          largejobBonus,
          seasonalBonus,
          minimumWageGap,
          incidentDeductions,
          estimateReviewBonuses
        }
      };

    } catch (error) {
      console.error(`Error calculating P4P for assignment ${assignmentId}:`, error);
      return null;
    }
  }

  /**
   * Calculate P4P for all assignments on a completed job
   */
  static async calculateP4PForJob(jobId: string): Promise<P4PCalculationResult[]> {
    try {
      // Get all assignments for this job
      const assignments = await db
        .select()
        .from(jobAssignments)
        .where(eq(jobAssignments.jobId, jobId));

      const results: P4PCalculationResult[] = [];

      for (const assignment of assignments) {
        const result = await this.calculateP4PForAssignment(assignment.id);
        if (result) {
          results.push(result);
          
          // Update the assignment with calculated P4P
          await db
            .update(jobAssignments)
            .set({ 
              performancePay: result.performancePay.toString()
            })
            .where(eq(jobAssignments.id, assignment.id));
        }
      }

      return results;
    } catch (error) {
      console.error(`Error calculating P4P for job ${jobId}:`, error);
      return [];
    }
  }

  /**
   * Recalculate P4P for all completed jobs
   */
  static async recalculateAllP4P(): Promise<void> {
    try {
      console.log('Starting P4P recalculation for all completed jobs...');
      
      // Get all completed jobs
      const completedJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.status, 'completed'));

      console.log(`Found ${completedJobs.length} completed jobs`);
      
      let totalCalculations = 0;
      
      for (const job of completedJobs) {
        const results = await this.calculateP4PForJob(job.id);
        totalCalculations += results.length;
        
        console.log(`Calculated P4P for job ${job.customerName}: ${results.length} assignments`);
        results.forEach(result => {
          console.log(`  - Assignment ${result.assignmentId}: $${result.performancePay.toFixed(2)} (${result.hourlyEquivalent.toFixed(2)}/hr)`);
        });
      }
      
      console.log(`P4P recalculation complete: ${totalCalculations} assignments processed`);
      
    } catch (error) {
      console.error('Error in P4P recalculation:', error);
      throw error;
    }
  }
}