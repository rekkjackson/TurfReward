import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(),
  photo: text("photo"),
  isActive: boolean("is_active").default(true),
  baseHourlyRate: decimal("base_hourly_rate", { precision: 10, scale: 2 }).default("18.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const p4pConfigs = pgTable("p4p_configs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobType: text("job_type").notNull(), // 'mowing', 'landscaping', 'maintenance'
  laborRevenuePercentage: decimal("labor_revenue_percentage", { precision: 5, scale: 2 }).notNull(),
  seasonalBonus: decimal("seasonal_bonus", { precision: 5, scale: 2 }).default("0.00"), // March-May bonus
  minimumHourlyRate: decimal("minimum_hourly_rate", { precision: 10, scale: 2 }).default("23.00"),
  trainingBonusPerHour: decimal("training_bonus_per_hour", { precision: 10, scale: 2 }).default("4.00"),
  largejobBonusThreshold: integer("largejob_bonus_threshold").default(49), // hours
  largejobBonusPerHour: decimal("largejob_bonus_per_hour", { precision: 10, scale: 2 }).default("1.50"),
  dailyRevenueGoal: decimal("daily_revenue_goal", { precision: 10, scale: 2 }).default("6500.00"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobNumber: text("job_number").unique(),
  jobType: text("job_type").notNull(), // 'mowing', 'landscaping', 'maintenance', 'cleanup'
  category: text("category").notNull().default("one_day"), // 'one_day', 'multi_day'
  customerName: text("customer_name"),
  customerAddress: text("customer_address"),
  customerPhone: text("customer_phone"),
  budgetedHours: decimal("budgeted_hours", { precision: 10, scale: 2 }).notNull(),
  actualHours: decimal("actual_hours", { precision: 10, scale: 2 }),
  laborRevenue: decimal("labor_revenue", { precision: 10, scale: 2 }).notNull(),
  materialsCost: decimal("materials_cost", { precision: 10, scale: 2 }).default("0.00"),
  totalJobValue: decimal("total_job_value", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'yellow_slip', 'on_hold'
  priority: text("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  estimatedDuration: integer("estimated_duration_days").default(1),
  isLargejob: boolean("is_largejob").default(false), // 49+ budgeted hours
  isSeasonalBonus: boolean("is_seasonal_bonus").default(false), // March-May 40% vs 33%
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobAssignments = pgTable("job_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: uuid("job_id").references(() => jobs.id).notNull(),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  hoursWorked: decimal("hours_worked", { precision: 10, scale: 2 }),
  isLeader: boolean("is_leader").default(false),
  isTraining: boolean("is_training").default(false),
  performancePay: decimal("performance_pay", { precision: 10, scale: 2 }).default("0.00"),
  payPeriodStart: timestamp("pay_period_start"),
  payPeriodEnd: timestamp("pay_period_end"),
  payPeriodType: text("pay_period_type", { enum: ['11-25', '26-10'] }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  date: timestamp("date").notNull(),
  payPeriodStart: timestamp("pay_period_start").notNull(),
  payPeriodEnd: timestamp("pay_period_end").notNull(),
  payPeriodType: text("pay_period_type", { enum: ['11-25', '26-10'] }).notNull(),
  efficiencyScore: decimal("efficiency_score", { precision: 5, scale: 2 }),
  revenueGenerated: decimal("revenue_generated", { precision: 10, scale: 2 }).default("0.00"),
  hoursWorked: decimal("hours_worked", { precision: 10, scale: 2 }).default("0.00"),
  yellowSlipCount: integer("yellow_slip_count").default(0),
  qualityScore: decimal("quality_score", { precision: 3, scale: 1 }).default("5.0"), // out of 5
  customerReferrals: integer("customer_referrals").default(0),
});

export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  jobId: uuid("job_id").references(() => jobs.id),
  type: text("type").notNull(), // 'yellow_slip', 'property_damage', 'quality_issue'
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companyMetrics = pgTable("company_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  dailyRevenue: decimal("daily_revenue", { precision: 10, scale: 2 }).default("0.00"),
  dailyRevenueGoal: decimal("daily_revenue_goal", { precision: 10, scale: 2 }).default("6500.00"),
  jobsCompleted: integer("jobs_completed").default(0),
  mowingJobsCompleted: integer("mowing_jobs_completed").default(0),
  landscapingJobsCompleted: integer("landscaping_jobs_completed").default(0),
  overallEfficiency: decimal("overall_efficiency", { precision: 5, scale: 2 }).default("0.00"),
  mowingAverageEfficiency: decimal("mowing_average_efficiency", { precision: 5, scale: 2 }).default("0.00"),
  averageQualityScore: decimal("average_quality_score", { precision: 3, scale: 1 }).default("5.0"),
  weatherCondition: text("weather_condition").default("Sunny"),
  weatherTemperature: integer("weather_temperature").default(72),
});

// Relations
export const employeesRelations = relations(employees, ({ many }) => ({
  jobAssignments: many(jobAssignments),
  performanceMetrics: many(performanceMetrics),
  incidents: many(incidents),
}));

export const jobsRelations = relations(jobs, ({ many }) => ({
  jobAssignments: many(jobAssignments),
  incidents: many(incidents),
}));

export const jobAssignmentsRelations = relations(jobAssignments, ({ one }) => ({
  job: one(jobs, {
    fields: [jobAssignments.jobId],
    references: [jobs.id],
  }),
  employee: one(employees, {
    fields: [jobAssignments.employeeId],
    references: [employees.id],
  }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  employee: one(employees, {
    fields: [performanceMetrics.employeeId],
    references: [employees.id],
  }),
}));

// Insert schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertP4PConfigSchema = createInsertSchema(p4pConfigs).omit({
  id: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
}).extend({
  // Make customer fields optional for maintenance and internal jobs
  customerName: z.string().optional().or(z.literal('')),
  customerAddress: z.string().optional().or(z.literal('')),
  customerPhone: z.string().optional().or(z.literal('')),
}).transform((data) => {
  // Convert empty strings to null for optional fields
  return {
    ...data,
    customerName: data.customerName === '' ? null : data.customerName,
    customerAddress: data.customerAddress === '' ? null : data.customerAddress,
    customerPhone: data.customerPhone === '' ? null : data.customerPhone,
  };
});

export const insertJobAssignmentSchema = createInsertSchema(jobAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyMetricSchema = createInsertSchema(companyMetrics).omit({
  id: true,
});

// Types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type P4PConfig = typeof p4pConfigs.$inferSelect;  
export type InsertP4PConfig = z.infer<typeof insertP4PConfigSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type JobAssignment = typeof jobAssignments.$inferSelect;
export type InsertJobAssignment = z.infer<typeof insertJobAssignmentSchema>;

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

export type CompanyMetric = typeof companyMetrics.$inferSelect;
export type InsertCompanyMetric = z.infer<typeof insertCompanyMetricSchema>;
