import {
  employees,
  p4pConfigs,
  jobs,
  jobAssignments,
  performanceMetrics,
  incidents,
  companyMetrics,
  type Employee,
  type InsertEmployee,
  type P4PConfig,
  type InsertP4PConfig,
  type Job,
  type InsertJob,
  type JobAssignment,
  type InsertJobAssignment,
  type PerformanceMetric,
  type InsertPerformanceMetric,
  type Incident,
  type InsertIncident,
  type CompanyMetric,
  type InsertCompanyMetric,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;

  // P4P Config methods
  getP4PConfigs(): Promise<P4PConfig[]>;
  getP4PConfigByJobType(jobType: string): Promise<P4PConfig | undefined>;
  createP4PConfig(config: InsertP4PConfig): Promise<P4PConfig>;
  updateP4PConfig(id: string, config: Partial<InsertP4PConfig>): Promise<P4PConfig>;

  // Job methods
  getJobs(limit?: number): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;

  // Job Assignment methods
  getJobAssignments(): Promise<(JobAssignment & { employee: Employee; job: Job })[]>;
  createJobAssignment(assignment: InsertJobAssignment): Promise<JobAssignment>;

  // Performance Metrics methods
  getPerformanceMetrics(employeeId?: string, startDate?: Date, endDate?: Date): Promise<PerformanceMetric[]>;
  createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;

  // Incident methods
  getIncidents(employeeId?: string): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;

  // Company Metrics methods
  getCompanyMetrics(startDate?: Date, endDate?: Date): Promise<CompanyMetric[]>;
  createCompanyMetric(metric: InsertCompanyMetric): Promise<CompanyMetric>;
  getLatestCompanyMetric(): Promise<CompanyMetric | undefined>;

  // Dashboard specific methods
  getDashboardData(): Promise<{
    todayMetrics: CompanyMetric | undefined;
    topPerformer: (Employee & { efficiency: number; weeklyRevenue: number }) | undefined;
    employeePerformance: (Employee & { efficiency: number; performancePercent: number; status: string })[];
    weeklyRevenue: { current: number; target: number };
    yellowSlipCount: number;
    customerSatisfaction: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getEmployees(): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.isActive, true));
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async getP4PConfigs(): Promise<P4PConfig[]> {
    return db.select().from(p4pConfigs).where(eq(p4pConfigs.isActive, true));
  }

  async getP4PConfigByJobType(jobType: string): Promise<P4PConfig | undefined> {
    const [config] = await db
      .select()
      .from(p4pConfigs)
      .where(and(eq(p4pConfigs.jobType, jobType), eq(p4pConfigs.isActive, true)));
    return config || undefined;
  }

  async createP4PConfig(config: InsertP4PConfig): Promise<P4PConfig> {
    const [newConfig] = await db.insert(p4pConfigs).values(config).returning();
    return newConfig;
  }

  async updateP4PConfig(id: string, config: Partial<InsertP4PConfig>): Promise<P4PConfig> {
    const [updatedConfig] = await db
      .update(p4pConfigs)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(p4pConfigs.id, id))
      .returning();
    return updatedConfig;
  }

  async getJobs(limit = 50): Promise<Job[]> {
    return db.select().from(jobs).orderBy(desc(jobs.createdAt)).limit(limit);
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job> {
    const [updatedJob] = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return updatedJob;
  }

  async getJobAssignments(): Promise<(JobAssignment & { employee: Employee; job: Job })[]> {
    return db
      .select()
      .from(jobAssignments)
      .innerJoin(employees, eq(jobAssignments.employeeId, employees.id))
      .innerJoin(jobs, eq(jobAssignments.jobId, jobs.id));
  }

  async createJobAssignment(assignment: InsertJobAssignment): Promise<JobAssignment> {
    const [newAssignment] = await db.insert(jobAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getPerformanceMetrics(
    employeeId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PerformanceMetric[]> {
    let query = db.select().from(performanceMetrics);

    const conditions = [];
    if (employeeId) conditions.push(eq(performanceMetrics.employeeId, employeeId));
    if (startDate) conditions.push(gte(performanceMetrics.date, startDate));
    if (endDate) conditions.push(lte(performanceMetrics.date, endDate));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(performanceMetrics.date));
  }

  async createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const [newMetric] = await db.insert(performanceMetrics).values(metric).returning();
    return newMetric;
  }

  async getIncidents(employeeId?: string): Promise<Incident[]> {
    let query = db.select().from(incidents);
    if (employeeId) {
      query = query.where(eq(incidents.employeeId, employeeId));
    }
    return query.orderBy(desc(incidents.createdAt));
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents).values(incident).returning();
    return newIncident;
  }

  async getCompanyMetrics(startDate?: Date, endDate?: Date): Promise<CompanyMetric[]> {
    let query = db.select().from(companyMetrics);

    const conditions = [];
    if (startDate) conditions.push(gte(companyMetrics.date, startDate));
    if (endDate) conditions.push(lte(companyMetrics.date, endDate));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(companyMetrics.date));
  }

  async createCompanyMetric(metric: InsertCompanyMetric): Promise<CompanyMetric> {
    const [newMetric] = await db.insert(companyMetrics).values(metric).returning();
    return newMetric;
  }

  async getLatestCompanyMetric(): Promise<CompanyMetric | undefined> {
    const [metric] = await db
      .select()
      .from(companyMetrics)
      .orderBy(desc(companyMetrics.date))
      .limit(1);
    return metric || undefined;
  }

  async getDashboardData() {
    // Get today's metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayMetrics] = await db
      .select()
      .from(companyMetrics)
      .where(gte(companyMetrics.date, today))
      .orderBy(desc(companyMetrics.date))
      .limit(1);

    // Get week start for weekly calculations
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // Get employee performance data
    const employeeMetrics = await db
      .select({
        employee: employees,
        avgEfficiency: sql<number>`AVG(${performanceMetrics.efficiencyScore})`,
        weeklyRevenue: sql<number>`SUM(${performanceMetrics.revenueGenerated})`,
        hoursWorked: sql<number>`SUM(${performanceMetrics.hoursWorked})`,
      })
      .from(employees)
      .leftJoin(performanceMetrics, eq(employees.id, performanceMetrics.employeeId))
      .where(
        and(
          eq(employees.isActive, true),
          gte(performanceMetrics.date, weekStart)
        )
      )
      .groupBy(employees.id)
      .orderBy(desc(sql`AVG(${performanceMetrics.efficiencyScore})`));

    // Find top performer
    const topPerformer = employeeMetrics.length > 0 ? {
      ...employeeMetrics[0].employee,
      efficiency: Number(employeeMetrics[0].avgEfficiency || 0),
      weeklyRevenue: Number(employeeMetrics[0].weeklyRevenue || 0),
    } : undefined;

    // Format employee performance data
    const employeePerformance = employeeMetrics.map(emp => ({
      ...emp.employee,
      efficiency: Number(emp.avgEfficiency || 0),
      performancePercent: Math.min(100, Math.max(0, (Number(emp.avgEfficiency || 0) / 3.0) * 100)),
      status: Number(emp.avgEfficiency || 0) >= 3.0 ? 'excellent' : 
              Number(emp.avgEfficiency || 0) >= 2.5 ? 'on-track' : 
              Number(emp.avgEfficiency || 0) >= 2.0 ? 'needs-focus' : 'training'
    }));

    // Get weekly revenue data
    const weeklyMetrics = await db
      .select({
        totalRevenue: sql<number>`SUM(${companyMetrics.dailyRevenue})`,
      })
      .from(companyMetrics)
      .where(gte(companyMetrics.date, weekStart));

    const weeklyRevenue = {
      current: Number(weeklyMetrics[0]?.totalRevenue || 0),
      target: 40000 // This could be configurable
    };

    // Get yellow slip count for this week
    const [yellowSlipData] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(incidents)
      .where(
        and(
          eq(incidents.type, 'yellow_slip'),
          gte(incidents.createdAt, weekStart)
        )
      );

    const yellowSlipCount = Number(yellowSlipData?.count || 0);

    // Calculate average customer satisfaction
    const [satisfactionData] = await db
      .select({
        avgSatisfaction: sql<number>`AVG(${performanceMetrics.qualityScore})`,
      })
      .from(performanceMetrics)
      .where(gte(performanceMetrics.date, weekStart));

    const customerSatisfaction = Number(satisfactionData?.avgSatisfaction || 5.0);

    return {
      todayMetrics,
      topPerformer,
      employeePerformance,
      weeklyRevenue,
      yellowSlipCount,
      customerSatisfaction,
    };
  }
}

export const storage = new DatabaseStorage();
