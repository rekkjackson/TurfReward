import { db } from './db';
import { 
  employees, 
  p4pConfigs, 
  jobs, 
  jobAssignments, 
  performanceMetrics, 
  incidents, 
  companyMetrics 
} from '@shared/schema';

export async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');

    // Create employees
    const empData = [
      { name: 'Mike Rodriguez', position: 'Crew Leader', baseHourlyRate: '22.00' },
      { name: 'Sarah Johnson', position: 'Lead Landscaper', baseHourlyRate: '20.00' },
      { name: 'Tom Wilson', position: 'Landscaper', baseHourlyRate: '18.00' },
      { name: 'Lisa Chen', position: 'Maintenance', baseHourlyRate: '19.00' },
      { name: 'David Martinez', position: 'New Hire', baseHourlyRate: '18.00' },
    ];

    const createdEmployees = await db.insert(employees).values(empData).returning();
    console.log(`Created ${createdEmployees.length} employees`);

    // Create P4P configurations
    const p4pData = [
      {
        jobType: 'mowing',
        laborRevenuePercentage: '33.00',
        seasonalBonus: '7.00',
        minimumHourlyRate: '18.00',
        trainingBonusPerHour: '4.00',
        largejobBonusThreshold: 49,
        largejobBonusPerHour: '1.50',
        isActive: true,
      },
      {
        jobType: 'landscaping',
        laborRevenuePercentage: '33.00',
        seasonalBonus: '0.00',
        minimumHourlyRate: '18.00',
        trainingBonusPerHour: '4.00',
        largejobBonusThreshold: 49,
        largejobBonusPerHour: '1.50',
        isActive: true,
      },
    ];

    await db.insert(p4pConfigs).values(p4pData);
    console.log('Created P4P configurations');

    // Create sample jobs
    const jobData = [
      {
        jobType: 'mowing',
        customerName: 'Green Valley Subdivision',
        budgetedHours: '8.00',
        actualHours: '6.50',
        laborRevenue: '2400.00',
        status: 'completed',
        completedAt: new Date(),
      },
      {
        jobType: 'landscaping',
        customerName: 'Downtown Office Complex',
        budgetedHours: '24.00',
        actualHours: '28.00',
        laborRevenue: '8500.00',
        status: 'completed',
        completedAt: new Date(),
      },
      {
        jobType: 'mowing',
        customerName: 'Residential Route 5',
        budgetedHours: '12.00',
        actualHours: '10.00',
        laborRevenue: '3200.00',
        status: 'yellow_slip',
        completedAt: new Date(),
      },
    ];

    const createdJobs = await db.insert(jobs).values(jobData).returning();
    console.log(`Created ${createdJobs.length} jobs`);

    // Create performance metrics for employees
    const performanceData = [];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < createdEmployees.length; i++) {
      const employee = createdEmployees[i];
      performanceData.push({
        employeeId: employee.id,
        date: weekStart,
        efficiencyScore: (2.5 + Math.random() * 1.5).toFixed(2), // Random efficiency between 2.5-4.0
        revenueGenerated: ((Math.random() * 5000) + 2000).toFixed(2), // Random revenue
        hoursWorked: ((Math.random() * 30) + 20).toFixed(2), // Random hours
        yellowSlipCount: Math.floor(Math.random() * 3), // 0-2 yellow slips
        qualityScore: (4.0 + Math.random() * 1.0).toFixed(1), // Quality score 4.0-5.0
        customerReferrals: Math.floor(Math.random() * 3), // 0-2 referrals
      });
    }

    await db.insert(performanceMetrics).values(performanceData);
    console.log(`Created ${performanceData.length} performance metrics`);

    // Create some incidents (yellow slips, damage cases)
    const incidentData = [
      {
        employeeId: createdEmployees[2].id, // Tom Wilson
        jobId: createdJobs[2].id, // Route 5 with yellow slip
        type: 'yellow_slip',
        description: 'Missed trimming around mailboxes on Maple Street. Customer called to complain.',
        cost: '150.00',
        resolved: false,
      },
      {
        employeeId: createdEmployees[4].id, // David Martinez (New Hire)
        type: 'property_damage',
        description: 'Accidentally damaged sprinkler head while edging. Homeowner reported issue.',
        cost: '85.00',
        resolved: true,
      },
      {
        employeeId: createdEmployees[1].id, // Sarah Johnson
        type: 'equipment_damage',
        description: 'Mower blade hit concrete barrier, needs replacement.',
        cost: '220.00',
        resolved: false,
      },
    ];

    await db.insert(incidents).values(incidentData);
    console.log(`Created ${incidentData.length} incidents`);

    // Create today's company metrics
    const companyData = {
      date: today,
      dailyRevenue: '4850.00',
      dailyRevenueGoal: '6500.00',
      jobsCompleted: 15,
      mowingJobsCompleted: 12,
      landscapingJobsCompleted: 3,
      overallEfficiency: '78.50',
      mowingAverageEfficiency: '3.20',
      averageQualityScore: '4.6',
      weatherCondition: 'Partly Cloudy',
      weatherTemperature: 75,
    };

    await db.insert(companyMetrics).values(companyData);
    console.log('Created company metrics');

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}