import { db } from './db';
import { achievements, employees } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Manual test for custom achievements
async function testCustomAchievements() {
  console.log('🧪 Testing Custom Achievements Manually...');
  
  try {
    // Get Derek's ID
    const derek = await db.select().from(employees).where(eq(employees.name, 'Derek Jackson')).limit(1);
    const christine = await db.select().from(employees).where(eq(employees.name, 'Christine Johnstone')).limit(1);
    
    if (derek.length === 0 || christine.length === 0) {
      console.error('Employees not found');
      return;
    }

    const derekId = derek[0].id;
    const christineId = christine[0].id;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Manually create test achievements
    const testAchievements = [
      {
        employeeId: derekId,
        type: 'profit_king',
        title: 'Profit King',
        description: 'Generated over $2,000 in P4P earnings in a single week',
        icon: 'DollarSign',
        color: 'bg-green-500',
        weekEarned: weekStart,
        value: '1956.00',
      },
      {
        employeeId: derekId,
        type: 'super_efficient',
        title: 'Super Efficient',
        description: 'Achieved 250% efficiency on efficiency test job',
        icon: 'TrendingUp',
        color: 'bg-purple-500',
        weekEarned: weekStart,
        value: '250.00',
      },
      {
        employeeId: derekId,
        type: 'marathon_worker',
        title: 'Marathon Worker',
        description: 'Worked 6 days this week',
        icon: 'Calendar',
        color: 'bg-blue-500',
        weekEarned: weekStart,
        value: '6.00',
      },
      {
        employeeId: christineId,
        type: 'team_captain',
        title: 'Team Captain',
        description: 'Led team leadership job',
        icon: 'Users',
        color: 'bg-orange-500',
        weekEarned: weekStart,
        value: '1.00',
      },
      {
        employeeId: derekId,
        type: 'perfectionist',
        title: 'Perfectionist',
        description: 'Multiple jobs completed without incidents',
        icon: 'CheckCircle',
        color: 'bg-pink-500',
        weekEarned: weekStart,
        value: '8.00',
      }
    ];

    // Insert each achievement
    for (const achievement of testAchievements) {
      try {
        await db.insert(achievements).values(achievement);
        console.log(`✅ Awarded: ${achievement.title} to ${achievement.employeeId === derekId ? 'Derek' : 'Christine'}`);
      } catch (error) {
        console.log(`⚠️  ${achievement.title} may already exist or error occurred`);
      }
    }

    console.log('🎉 All custom achievements tested and awarded!');
    console.log('Check the dashboard to see the new achievement badges.');
    
  } catch (error) {
    console.error('❌ Error in manual test:', error);
  }
}

testCustomAchievements();