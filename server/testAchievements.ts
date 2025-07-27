import { db } from './db';
import { jobs, jobAssignments, employees } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function createTestDataForAchievements() {
  console.log('🧪 Creating test data for achievement demonstration...');
  
  try {
    // Get employee IDs
    const allEmployees = await db.select().from(employees).where(eq(employees.isActive, true));
    const derek = allEmployees.find(e => e.name === 'Derek Jackson');
    const christine = allEmployees.find(e => e.name === 'Christine Johnstone');
    
    if (!derek || !christine) {
      console.error('Required employees not found');
      return;
    }

    // Get recent jobs
    const recentJobs = await db.select().from(jobs).limit(10);
    
    if (recentJobs.length < 3) {
      console.error('Not enough jobs to create test assignments');
      return;
    }

    const job1 = recentJobs[recentJobs.length - 3]; // High value job
    const job2 = recentJobs[recentJobs.length - 2]; // Efficiency job
    const job3 = recentJobs[recentJobs.length - 1]; // Leadership job

    // Create assignments for Profit King achievement (Derek earns $3200 * 0.33 = $1056)
    await db.insert(jobAssignments).values({
      employeeId: derek.id,
      jobId: job1.id,
      hoursWorked: '8',
      jobsiteHours: '8',
      isLeader: true,
      performancePay: '1056.00', // This should trigger Profit King
    });

    // Create assignment for Super Efficient achievement (10 budgeted, 4 actual = 250% efficiency)
    await db.insert(jobAssignments).values({
      employeeId: derek.id,
      jobId: job2.id,
      hoursWorked: '4',
      jobsiteHours: '4',
      isLeader: false,
      performancePay: '264.00',
    });

    // Create assignment for Team Captain achievement
    await db.insert(jobAssignments).values({
      employeeId: christine.id,
      jobId: job3.id,
      hoursWorked: '6',
      jobsiteHours: '6',
      isLeader: true, // This counts toward leadership
      performancePay: '396.00',
    });

    console.log('✅ Test data created successfully!');
    console.log('📊 Expected achievements:');
    console.log('  - Derek: Profit King ($1056 P4P)');
    console.log('  - Derek: Super Efficient (250% efficiency)');
    console.log('  - Christine: Team Captain (leadership role)');
    
    return true;
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    return false;
  }
}

export async function createMultipleDaysWork() {
  console.log('📅 Creating multi-day work for Marathon Worker achievement...');
  
  try {
    const allEmployees = await db.select().from(employees).where(eq(employees.isActive, true));
    const derek = allEmployees.find(e => e.name === 'Derek Jackson');
    
    if (!derek) {
      console.error('Derek Jackson not found');
      return false;
    }

    // Create 6 jobs on different days this week for Marathon Worker
    const today = new Date();
    const daysOfWeek = [];
    
    for (let i = 0; i < 6; i++) {
      const workDay = new Date(today);
      workDay.setDate(today.getDate() - i);
      daysOfWeek.push(workDay);
    }

    for (let i = 0; i < 6; i++) {
      const workDay = daysOfWeek[i];
      
      // Create job for this day
      const [newJob] = await db.insert(jobs).values({
        customerName: `Daily Work ${i + 1}`,
        address: `${100 + i} Marathon St`,
        jobType: 'mowing',
        budgetedHours: '4',
        laborRevenue: '320',
        status: 'completed',
        completedAt: workDay.toISOString(),
      }).returning();

      // Create assignment
      await db.insert(jobAssignments).values({
        employeeId: derek.id,
        jobId: newJob.id,
        hoursWorked: '4',
        jobsiteHours: '4',
        isLeader: false,
        performancePay: '105.60',
      });
    }

    console.log('✅ Created 6 days of work for Derek - Marathon Worker achievement ready!');
    return true;
  } catch (error) {
    console.error('❌ Error creating multi-day work:', error);
    return false;
  }
}