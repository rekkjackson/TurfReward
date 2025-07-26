import { db } from './db';
import { jobs, jobAssignments, employees, p4pConfigs } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface P4PComplianceAnalysis {
  assignmentId: string;
  employeeName: string;
  jobType: string;
  hoursWorked: number;
  p4pAmount: number;
  hourlyEquivalent: number;
  minimumWageCompliance: {
    minimumRequired: number;
    actualEarnings: number;
    meetsMinimum: boolean;
    shortfall: number;
  };
  businessRuleCompliance: {
    laborRevenue: number;
    p4pPercentage: number;
    teamSize: number;
    expectedP4P: number;
    actualP4P: number;
    calculationCorrect: boolean;
  };
  regulatoryCompliance: {
    meetsMinimumWage: boolean;
    properlyCategorized: boolean;
    accurateRecords: boolean;
  };
}

export class P4PComplianceAnalyzer {
  
  static async analyzeAllAssignments(): Promise<P4PComplianceAnalysis[]> {
    console.log('🔍 Starting P4P Compliance Analysis...\n');
    
    // Get all job assignments with related data
    const assignmentData = await db
      .select({
        assignment: jobAssignments,
        employee: employees,
        job: jobs,
      })
      .from(jobAssignments)
      .leftJoin(employees, eq(jobAssignments.employeeId, employees.id))
      .leftJoin(jobs, eq(jobAssignments.jobId, jobs.id))
      .where(eq(jobs.status, 'completed'));

    const analyses: P4PComplianceAnalysis[] = [];

    for (const data of assignmentData) {
      if (!data.employee || !data.job) continue;

      // Get P4P config for this job type
      const [p4pConfig] = await db
        .select()
        .from(p4pConfigs)
        .where(and(
          eq(p4pConfigs.jobType, data.job.jobType),
          eq(p4pConfigs.isActive, true)
        ));

      if (!p4pConfig) continue;

      // Get team size for this job
      const teamAssignments = await db
        .select()
        .from(jobAssignments)
        .where(eq(jobAssignments.jobId, data.job.id));

      const teamSize = teamAssignments.length;
      const hoursWorked = parseFloat(data.assignment.hoursWorked || '0');
      const p4pAmount = parseFloat(data.assignment.performancePay || '0');
      const laborRevenue = parseFloat(data.job.laborRevenue || '0');
      const minimumHourly = parseFloat(p4pConfig.minimumHourlyRate || '18');
      const p4pPercentage = parseFloat(p4pConfig.laborRevenuePercentage || '33');

      // Calculate expected P4P (simplified - base calculation only)
      const expectedP4P = (laborRevenue * (p4pPercentage / 100)) / teamSize;
      
      // Calculate compliance metrics
      const hourlyEquivalent = hoursWorked > 0 ? p4pAmount / hoursWorked : 0;
      const minimumRequired = hoursWorked * minimumHourly;
      const shortfall = Math.max(0, minimumRequired - p4pAmount);
      
      const analysis: P4PComplianceAnalysis = {
        assignmentId: data.assignment.id,
        employeeName: data.employee.name,
        jobType: data.job.jobType,
        hoursWorked,
        p4pAmount,
        hourlyEquivalent,
        minimumWageCompliance: {
          minimumRequired,
          actualEarnings: p4pAmount,
          meetsMinimum: p4pAmount >= minimumRequired,
          shortfall
        },
        businessRuleCompliance: {
          laborRevenue,
          p4pPercentage,
          teamSize,
          expectedP4P,
          actualP4P: p4pAmount,
          calculationCorrect: Math.abs(p4pAmount - expectedP4P) < 0.01
        },
        regulatoryCompliance: {
          meetsMinimumWage: hourlyEquivalent >= minimumHourly,
          properlyCategorized: data.job.status === 'completed',
          accurateRecords: hoursWorked > 0 && p4pAmount >= 0
        }
      };

      analyses.push(analysis);
    }

    return analyses;
  }

  static async generateComplianceReport(): Promise<void> {
    const analyses = await this.analyzeAllAssignments();
    
    console.log('📊 P4P COMPLIANCE ANALYSIS REPORT');
    console.log('='.repeat(50));
    console.log(`Total Assignments Analyzed: ${analyses.length}\n`);

    // Summary metrics
    const totalCompliant = analyses.filter(a => 
      a.minimumWageCompliance.meetsMinimum && 
      a.businessRuleCompliance.calculationCorrect &&
      a.regulatoryCompliance.accurateRecords
    ).length;

    const complianceRate = analyses.length > 0 ? (totalCompliant / analyses.length) * 100 : 0;

    console.log('🏆 OVERALL COMPLIANCE SUMMARY:');
    console.log(`✓ Compliant Assignments: ${totalCompliant}/${analyses.length}`);
    console.log(`✓ Compliance Rate: ${complianceRate.toFixed(1)}%\n`);

    // Detailed analysis
    console.log('📋 DETAILED ASSIGNMENT ANALYSIS:');
    analyses.forEach((analysis, index) => {
      console.log(`\n${index + 1}. ${analysis.employeeName} - ${analysis.jobType.toUpperCase()}`);
      console.log(`   Hours Worked: ${analysis.hoursWorked}`);
      console.log(`   P4P Amount: $${analysis.p4pAmount.toFixed(2)}`);
      console.log(`   Hourly Equivalent: $${analysis.hourlyEquivalent.toFixed(2)}/hr`);
      
      // Minimum wage compliance
      if (analysis.minimumWageCompliance.meetsMinimum) {
        console.log(`   ✅ Minimum Wage: COMPLIANT (exceeds $${analysis.minimumWageCompliance.minimumRequired.toFixed(2)} minimum)`);
      } else {
        console.log(`   ❌ Minimum Wage: NON-COMPLIANT (shortfall: $${analysis.minimumWageCompliance.shortfall.toFixed(2)})`);
      }
      
      // Business rule compliance
      if (analysis.businessRuleCompliance.calculationCorrect) {
        console.log(`   ✅ P4P Calculation: CORRECT`);
      } else {
        console.log(`   ❌ P4P Calculation: INCORRECT (expected: $${analysis.businessRuleCompliance.expectedP4P.toFixed(2)}, actual: $${analysis.businessRuleCompliance.actualP4P.toFixed(2)})`);
      }
      
      console.log(`   📈 Business Rule Details:`);
      console.log(`      - Labor Revenue: $${analysis.businessRuleCompliance.laborRevenue.toFixed(2)}`);
      console.log(`      - P4P Percentage: ${analysis.businessRuleCompliance.p4pPercentage}%`);
      console.log(`      - Team Size: ${analysis.businessRuleCompliance.teamSize} members`);
    });

    // Regulatory summary
    console.log('\n🏛️ REGULATORY COMPLIANCE SUMMARY:');
    const wageCompliant = analyses.filter(a => a.regulatoryCompliance.meetsMinimumWage).length;
    const recordsAccurate = analyses.filter(a => a.regulatoryCompliance.accurateRecords).length;
    
    console.log(`✓ Minimum Wage Compliance: ${wageCompliant}/${analyses.length} (${((wageCompliant/analyses.length)*100).toFixed(1)}%)`);
    console.log(`✓ Accurate Records: ${recordsAccurate}/${analyses.length} (${((recordsAccurate/analyses.length)*100).toFixed(1)}%)`);

    // Final assessment
    console.log('\n🎯 SYSTEM ASSESSMENT:');
    if (complianceRate >= 95) {
      console.log('✅ EXCELLENT: P4P system meets regulatory and business requirements');
    } else if (complianceRate >= 90) {
      console.log('✅ GOOD: P4P system generally compliant with minor issues');
    } else if (complianceRate >= 80) {
      console.log('⚠️  ACCEPTABLE: P4P system needs optimization');
    } else {
      console.log('❌ CRITICAL: P4P system requires immediate attention');
    }

    console.log('\n✅ P4P Compliance Analysis Complete!');
  }
}

// Run the analysis
P4PComplianceAnalyzer.generateComplianceReport().catch(console.error);