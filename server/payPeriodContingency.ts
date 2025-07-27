import { db } from './db';
import { jobAssignments, jobs, employees, p4pConfigs } from '@shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getCurrentPayPeriod } from '@shared/payPeriodUtils';

/**
 * Pay Period Contingency System - Projects Only
 * 
 * When multi-day PROJECTS (landscaping, cleanups) span across pay periods:
 * 1. Employees receive hourly pay for work done until project completion
 * 2. Once project is completed, full P4P calculation is applied retroactively
 * 3. One-day jobs (mowing routes) are not affected - they complete same day
 * 4. Only applies to jobs with category "multi_day" that cross pay period boundaries
 */

export class PayPeriodContingencyService {
  
  /**
   * Check if a PROJECT spans multiple pay periods
   * Only applies to multi-day projects (landscaping, cleanups), not one-day jobs
   */
  static async checkProjectSpansPayPeriods(jobId: string): Promise<boolean> {
    const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (!job.length) return false;
    
    const jobData = job[0];
    
    // Only check multi-day projects
    if (jobData.category !== 'multi_day') return false;
    
    if (!jobData.startDate || !jobData.endDate) return false;
    
    const startPeriod = getCurrentPayPeriod(jobData.startDate);
    const endPeriod = getCurrentPayPeriod(jobData.endDate);
    
    return startPeriod.start.getTime() !== endPeriod.start.getTime();
  }
  
  /**
   * Process hourly payments for multi-period PROJECTS only
   */
  static async processProjectHourlyPayments(jobId: string): Promise<void> {
    const spansPayPeriods = await this.checkProjectSpansPayPeriods(jobId);
    
    if (!spansPayPeriods) return;
    
    console.log(`Project ${jobId} spans pay periods - applying contingency payments`);
    
    // Mark project as spanning pay periods
    await db.update(jobs)
      .set({ spansPayPeriods: true })
      .where(eq(jobs.id, jobId));
    
    // Get all assignments for this job
    const assignments = await db
      .select()
      .from(jobAssignments)
      .where(eq(jobAssignments.jobId, jobId));
    
    // Get base hourly rates for calculations
    const p4pConfig = await db.select().from(p4pConfigs).limit(1);
    const minimumHourlyRate = parseFloat(p4pConfig[0]?.minimumHourlyRate || '23.00');
    
    // Update assignments to use hourly payment until completion
    for (const assignment of assignments) {
      const hoursWorked = parseFloat(assignment.hoursWorked || '0');
      if (hoursWorked > 0) {
        // Calculate hourly payment
        const hourlyPay = hoursWorked * minimumHourlyRate;
        
        await db.update(jobAssignments)
          .set({
            performancePay: hourlyPay.toFixed(2),
            isHourlyPayment: true,
            payPeriodType: getCurrentPayPeriod(new Date()).type
          })
          .where(eq(jobAssignments.id, assignment.id));
      }
    }
  }
  
  /**
   * Calculate final P4P when project is completed
   */
  static async calculateFinalP4P(jobId: string): Promise<void> {
    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);
    
    if (!job.length || job[0].status !== 'completed') return;
    
    const jobData = job[0];
    
    // Get all assignments for this job
    const assignments = await db
      .select()
      .from(jobAssignments)
      .where(eq(jobAssignments.jobId, jobId));
    
    if (!assignments.length) return;
    
    // Get P4P configuration
    const p4pConfig = await db
      .select()
      .from(p4pConfigs)
      .where(eq(p4pConfigs.jobType, jobData.jobType))
      .limit(1);
    
    if (!p4pConfig.length) return;
    
    const config = p4pConfig[0];
    const laborRevenue = parseFloat(jobData.laborRevenue || '0');
    const laborRevenuePercentage = parseFloat(config.laborRevenuePercentage || '33') / 100;
    const minimumHourlyRate = parseFloat(config.minimumHourlyRate || '23.00');
    
    // Calculate total P4P pool
    let totalP4PPool = laborRevenue * laborRevenuePercentage;
    
    // Apply seasonal bonus if applicable
    if (jobData.isSeasonalBonus) {
      const seasonalBonus = parseFloat(config.seasonalBonus || '7') / 100;
      totalP4PPool = laborRevenue * (laborRevenuePercentage + seasonalBonus);
    }
    
    // Apply large job bonus if applicable
    if (jobData.isLargejob) {
      const budgetedHours = parseFloat(jobData.budgetedHours || '0');
      const largejobBonus = budgetedHours * parseFloat(config.largejobBonusPerHour || '1.50');
      totalP4PPool += largejobBonus;
    }
    
    // Calculate total hours worked
    const totalHours = assignments.reduce((sum, assignment) => {
      return sum + parseFloat(assignment.hoursWorked || '0');
    }, 0);
    
    if (totalHours === 0) return;
    
    // Distribute P4P among team members based on hours worked
    for (const assignment of assignments) {
      const hoursWorked = parseFloat(assignment.hoursWorked || '0');
      if (hoursWorked > 0) {
        const hourlyPortion = hoursWorked / totalHours;
        let finalP4P = totalP4PPool * hourlyPortion;
        
        // Apply training bonus if applicable
        if (assignment.isTraining) {
          const trainingBonus = hoursWorked * parseFloat(config.trainingBonusPerHour || '4.00');
          finalP4P += trainingBonus;
        }
        
        // Ensure minimum wage protection
        const minimumPay = hoursWorked * minimumHourlyRate;
        finalP4P = Math.max(finalP4P, minimumPay);
        
        // Calculate adjustment from previous hourly payments
        const previousHourlyPay = parseFloat(assignment.performancePay || '0');
        const adjustment = finalP4P - previousHourlyPay;
        
        // Update assignment with final P4P calculation
        await db.update(jobAssignments)
          .set({
            performancePay: finalP4P.toFixed(2),
            isHourlyPayment: false // Mark as final P4P calculation
          })
          .where(eq(jobAssignments.id, assignment.id));
        
        console.log(`Project ${jobId} - Final P4P for ${assignment.employeeId}: $${finalP4P.toFixed(2)} (adjustment: $${adjustment.toFixed(2)})`);
      }
    }
  }
  
  /**
   * Get pay period summary for an employee
   */
  static async getPayPeriodSummary(employeeId: string, periodStart: Date, periodEnd: Date) {
    const assignments = await db
      .select()
      .from(jobAssignments)
      .where(
        and(
          eq(jobAssignments.employeeId, employeeId),
          gte(jobAssignments.createdAt, periodStart),
          lte(jobAssignments.createdAt, periodEnd)
        )
      );
    
    const totalHours = assignments.reduce((sum, assignment) => {
      return sum + parseFloat(assignment.hoursWorked || '0');
    }, 0);
    
    const totalPay = assignments.reduce((sum, assignment) => {
      return sum + parseFloat(assignment.performancePay || '0');
    }, 0);
    
    const hourlyAssignments = assignments.filter(a => a.isHourlyPayment);
    const p4pAssignments = assignments.filter(a => !a.isHourlyPayment);
    
    return {
      totalHours,
      totalPay,
      hourlyPay: hourlyAssignments.reduce((sum, a) => sum + parseFloat(a.performancePay || '0'), 0),
      performancePay: p4pAssignments.reduce((sum, a) => sum + parseFloat(a.performancePay || '0'), 0),
      assignmentCount: assignments.length,
      pendingP4PJobs: hourlyAssignments.length
    };
  }
}

export default PayPeriodContingencyService;