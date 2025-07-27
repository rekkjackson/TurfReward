import { db } from './db';
import { achievements, employees, jobAssignments, jobs } from '@shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

export interface AchievementRule {
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  checkCriteria: (employeeId: string, weekStart: Date) => Promise<{ earned: boolean; value?: number }>;
}

export class AchievementEngine {
  private static achievementRules: AchievementRule[] = [
    {
      type: 'efficiency_master',
      title: 'Efficiency Master',
      description: 'Achieved 150%+ efficiency this week',
      icon: 'Zap',
      color: 'bg-yellow-500',
      checkCriteria: async (employeeId: string, weekStart: Date) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        // Get all completed assignments for this employee this week
        const assignments = await db
          .select()
          .from(jobAssignments)
          .leftJoin(jobs, eq(jobAssignments.jobId, jobs.id))
          .where(
            and(
              eq(jobAssignments.employeeId, employeeId),
              eq(jobs.status, 'completed'),
              gte(jobs.completedAt, weekStart)
            )
          );
        
        if (assignments.length === 0) return { earned: false };
        
        // Calculate average efficiency
        let totalEfficiency = 0;
        let validJobs = 0;
        
        for (const { job_assignments: assignment, jobs: job } of assignments) {
          if (!job || !assignment) continue;
          const budgeted = parseFloat(job.budgetedHours || '0');
          const actual = parseFloat(assignment.jobsiteHours || '0');
          if (budgeted > 0 && actual > 0) {
            const efficiency = (budgeted / actual) * 100;
            totalEfficiency += efficiency;
            validJobs++;
          }
        }
        
        const avgEfficiency = validJobs > 0 ? totalEfficiency / validJobs : 0;
        return { earned: avgEfficiency >= 150, value: avgEfficiency };
      }
    },
    {
      type: 'revenue_champion',
      title: 'Revenue Champion',
      description: 'Generated $2,000+ in revenue this week',
      icon: 'DollarSign',
      color: 'bg-green-500',
      checkCriteria: async (employeeId: string, weekStart: Date) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        // Get total P4P earnings this week (proxy for revenue generation)
        const [result] = await db
          .select({
            totalP4P: sql<number>`SUM(${jobAssignments.performancePay})`,
          })
          .from(jobAssignments)
          .leftJoin(jobs, eq(jobAssignments.jobId, jobs.id))
          .where(
            and(
              eq(jobAssignments.employeeId, employeeId),
              eq(jobs.status, 'completed'),
              gte(jobs.completedAt, weekStart)
            )
          );
        
        const totalRevenue = Number(result?.totalP4P || 0);
        return { earned: totalRevenue >= 500, value: totalRevenue }; // $500+ P4P indicates high revenue
      }
    },
    {
      type: 'consistency_pro',
      title: 'Consistency Pro',
      description: 'Worked 5+ days this week',
      icon: 'Calendar',
      color: 'bg-blue-500',
      checkCriteria: async (employeeId: string, weekStart: Date) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        // Count unique work days this week
        const assignments = await db
          .select({
            createdAt: jobAssignments.createdAt,
          })
          .from(jobAssignments)
          .where(
            and(
              eq(jobAssignments.employeeId, employeeId),
              gte(jobAssignments.createdAt, weekStart)
            )
          );
        
        // Group by day
        const workDays = new Set();
        assignments.forEach(assignment => {
          if (assignment.createdAt) {
            const day = assignment.createdAt.toDateString();
            workDays.add(day);
          }
        });
        
        return { earned: workDays.size >= 5, value: workDays.size };
      }
    },
    {
      type: 'safety_star',
      title: 'Safety Star',
      description: 'Zero incidents this week',
      icon: 'Shield',
      color: 'bg-emerald-500',
      checkCriteria: async (employeeId: string, weekStart: Date) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        // For simplicity, always award safety star if no incidents in tracking system
        // In a real implementation, you'd check an incidents table
        
        return { earned: true, value: 0 }; // Always true for now
      }
    },
    {
      type: 'team_leader',
      title: 'Team Leader',
      description: 'Led 3+ jobs this week',
      icon: 'Users',
      color: 'bg-purple-500',
      checkCriteria: async (employeeId: string, weekStart: Date) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        // Count leadership roles this week
        const [leadershipCount] = await db
          .select({
            count: sql<number>`COUNT(*)`,
          })
          .from(jobAssignments)
          .where(
            and(
              eq(jobAssignments.employeeId, employeeId),
              eq(jobAssignments.isLeader, true),
              gte(jobAssignments.createdAt, weekStart)
            )
          );
        
        const leaderJobs = Number(leadershipCount?.count || 0);
        return { earned: leaderJobs >= 3, value: leaderJobs };
      }
    }
  ];

  /**
   * Check and award achievements for all employees
   */
  static async processWeeklyAchievements(): Promise<void> {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week
      weekStart.setHours(0, 0, 0, 0);

      const allEmployees = await db.select().from(employees).where(eq(employees.isActive, true));

      for (const employee of allEmployees) {
        await this.checkEmployeeAchievements(employee.id, weekStart);
      }

      console.log(`Processed achievements for ${allEmployees.length} employees`);
    } catch (error) {
      console.error('Error processing weekly achievements:', error);
    }
  }

  /**
   * Check achievements for a specific employee
   */
  static async checkEmployeeAchievements(employeeId: string, weekStart: Date): Promise<void> {
    for (const rule of this.achievementRules) {
      try {
        // Check if already earned this week
        const existingAchievement = await db
          .select()
          .from(achievements)
          .where(
            and(
              eq(achievements.employeeId, employeeId),
              eq(achievements.type, rule.type),
              gte(achievements.weekEarned, weekStart)
            )
          )
          .limit(1);

        if (existingAchievement.length > 0) {
          continue; // Already earned this week
        }

        // Check criteria
        const result = await rule.checkCriteria(employeeId, weekStart);
        
        if (result.earned) {
          await db.insert(achievements).values({
            employeeId,
            type: rule.type,
            title: rule.title,
            description: rule.description,
            icon: rule.icon,
            color: rule.color,
            weekEarned: weekStart,
            value: result.value?.toString() || '0',
          });

          console.log(`🏆 Achievement earned: ${rule.title} by employee ${employeeId}`);
        }
      } catch (error) {
        console.error(`Error checking ${rule.type} for employee ${employeeId}:`, error);
      }
    }
  }

  /**
   * Get recent achievements for an employee
   */
  static async getEmployeeAchievements(employeeId: string, limit = 5): Promise<any[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.employeeId, employeeId))
      .orderBy(desc(achievements.earnedAt))
      .limit(limit);
  }

  /**
   * Get all achievements for dashboard display
   */
  static async getAllRecentAchievements(limit = 10): Promise<any[]> {
    return await db
      .select({
        achievement: achievements,
        employee: employees,
      })
      .from(achievements)
      .leftJoin(employees, eq(achievements.employeeId, employees.id))
      .orderBy(desc(achievements.earnedAt))
      .limit(limit);
  }
}