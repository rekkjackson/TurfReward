import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import {
  insertEmployeeSchema,
  insertP4PConfigSchema,
  insertJobSchema,
  insertJobAssignmentSchema,
  insertPerformanceMetricSchema,
  insertIncidentSchema,
  insertCompanyMetricSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const partialData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(req.params.id, partialData);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee update data" });
    }
  });

  // P4P Config routes
  app.get("/api/p4p-configs", async (req, res) => {
    try {
      const configs = await storage.getP4PConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch P4P configurations" });
    }
  });

  app.post("/api/p4p-configs", async (req, res) => {
    try {
      const validatedData = insertP4PConfigSchema.parse(req.body);
      const config = await storage.createP4PConfig(validatedData);
      res.status(201).json(config);
    } catch (error) {
      res.status(400).json({ message: "Invalid P4P configuration data" });
    }
  });

  app.patch("/api/p4p-configs/:id", async (req, res) => {
    try {
      const partialData = insertP4PConfigSchema.partial().parse(req.body);
      const config = await storage.updateP4PConfig(req.params.id, partialData);
      res.json(config);
    } catch (error) {
      res.status(400).json({ message: "Invalid P4P configuration update data" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const jobs = await storage.getJobs(limit);
      res.json(jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      console.log('Received job data:', req.body);
      const validatedData = insertJobSchema.parse(req.body);
      console.log('Validated job data:', validatedData);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      console.error('Job creation error:', error);
      res.status(400).json({ 
        message: "Invalid job data", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      console.log('Updating job:', req.params.id, req.body);
      
      // Handle date conversion at the route level
      const updateData = { ...req.body };
      if (updateData.completedAt && typeof updateData.completedAt === 'string') {
        updateData.completedAt = new Date(updateData.completedAt);
      }
      if (updateData.status === 'completed' && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }
      
      const job = await storage.updateJob(req.params.id, updateData);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // If job was just completed, calculate P4P for all assignments
      if (updateData.status === 'completed') {
        console.log(`Job ${req.params.id} completed - calculating P4P for all assignments`);
        try {
          const assignments = await storage.getJobAssignments();
          const jobAssignments = assignments.filter(a => a.jobId === req.params.id);
          
          const { P4PCalculationEngine } = await import('./p4pCalculations');
          
          for (const assignment of jobAssignments) {
            const p4pResult = await P4PCalculationEngine.calculateP4PForAssignment(assignment.id);
            if (p4pResult && p4pResult.performancePay > 0) {
              await storage.updateJobAssignment(assignment.id, {
                performancePay: p4pResult.performancePay.toFixed(2)
              });
              console.log(`P4P calculated: $${p4pResult.performancePay.toFixed(2)} for assignment ${assignment.id}`);
            }
          }
        } catch (p4pError) {
          console.error('P4P calculation failed for completed job:', p4pError);
        }
      }

      res.json(job);
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const success = await storage.deleteJob(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Job Assignment routes
  app.get("/api/job-assignments", async (req, res) => {
    try {
      const assignments = await storage.getJobAssignments();
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching job assignments:', error);
      res.status(500).json({ message: "Failed to fetch job assignments", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/job-assignments", async (req, res) => {
    try {
      console.log('Received job assignment data:', req.body);
      const validatedData = insertJobAssignmentSchema.parse(req.body);
      console.log('Validated job assignment data:', validatedData);
      const assignment = await storage.createJobAssignment(validatedData);
      
      // Note: P4P calculation will happen when job is marked as completed
      console.log(`Job assignment created - P4P will be calculated when job is completed`);
      
      res.status(201).json(assignment);
    } catch (error) {
      console.error('Error creating job assignment:', error);
      res.status(400).json({ 
        message: "Invalid job assignment data", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // P4P Calculation route
  app.post("/api/p4p-calculate", async (req, res) => {
    try {
      const { assignmentId } = req.body;
      if (!assignmentId) {
        return res.status(400).json({ message: "Assignment ID required" });
      }

      const { P4PCalculationEngine } = await import('./p4pCalculations');
      const p4pResult = await P4PCalculationEngine.calculateP4PForAssignment(assignmentId);
      
      if (!p4pResult) {
        return res.status(404).json({ message: "Could not calculate P4P for this assignment" });
      }

      // Update assignment with calculated P4P
      await storage.updateJobAssignment(assignmentId, {
        performancePay: p4pResult.performancePay.toFixed(2)
      });

      console.log(`P4P calculated: $${p4pResult.performancePay.toFixed(2)} for assignment ${assignmentId}`);
      res.json(p4pResult);
    } catch (error) {
      console.error('P4P calculation error:', error);
      res.status(500).json({ message: "P4P calculation failed" });
    }
  });

  app.patch("/api/job-assignments/:id", async (req, res) => {
    try {
      const assignment = await storage.updateJobAssignment(req.params.id, req.body);
      if (!assignment) {
        return res.status(404).json({ message: "Job assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error('Error updating job assignment:', error);
      res.status(500).json({ message: "Failed to update job assignment" });
    }
  });

  app.delete("/api/job-assignments/:id", async (req, res) => {
    try {
      const success = await storage.deleteJobAssignment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Job assignment not found" });
      }
      res.json({ message: "Job assignment deleted successfully" });
    } catch (error) {
      console.error('Error deleting job assignment:', error);
      res.status(500).json({ message: "Failed to delete job assignment" });
    }
  });

  // Performance Metrics routes
  app.get("/api/performance-metrics", async (req, res) => {
    try {
      const employeeId = req.query.employeeId as string | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const metrics = await storage.getPerformanceMetrics(employeeId, startDate, endDate);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  app.post("/api/performance-metrics", async (req, res) => {
    try {
      const validatedData = insertPerformanceMetricSchema.parse(req.body);
      const metric = await storage.createPerformanceMetric(validatedData);
      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ message: "Invalid performance metric data" });
    }
  });

  // Incident routes
  app.get("/api/incidents", async (req, res) => {
    try {
      const employeeId = req.query.employeeId as string | undefined;
      const incidents = await storage.getIncidents(employeeId);
      res.json(incidents);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post("/api/incidents", async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);
      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({ message: "Invalid incident data" });
    }
  });

  app.delete("/api/incidents/:id", async (req, res) => {
    try {
      const success = await storage.deleteIncident(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Incident not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting incident:', error);
      res.status(500).json({ message: "Failed to delete incident" });
    }
  });

  // Company Metrics routes
  app.get("/api/company-metrics", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const metrics = await storage.getCompanyMetrics(startDate, endDate);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company metrics" });
    }
  });

  app.get("/api/company-metrics/latest", async (req, res) => {
    try {
      const metric = await storage.getLatestCompanyMetric();
      if (!metric) {
        return res.status(404).json({ message: "No company metrics found" });
      }
      res.json(metric);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest company metrics" });
    }
  });

  app.post("/api/company-metrics", async (req, res) => {
    try {
      const validatedData = insertCompanyMetricSchema.parse(req.body);
      const metric = await storage.createCompanyMetric(validatedData);
      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ message: "Invalid company metric data" });
    }
  });

  // Dashboard data route
  app.get("/api/dashboard", async (req, res) => {
    try {
      const dashboardData = await storage.getDashboardData();
      res.json(dashboardData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Pay period information route
  app.get("/api/pay-period/current", async (req, res) => {
    try {
      const { PayPeriodService } = await import("./payPeriodService");
      const payPeriodSummary = PayPeriodService.getCurrentPeriodSummary();
      res.json(payPeriodSummary);
    } catch (error) {
      console.error('Failed to fetch pay period data:', error);
      res.status(500).json({ message: "Failed to fetch pay period data" });
    }
  });



  // Job routes for project tracking
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const result = insertJobSchema.safeParse(req.body);
      if (!result.success) {
        console.error('Validation errors:', result.error.errors);
        return res.status(400).json({ 
          message: "Invalid job data", 
          errors: result.error.errors 
        });
      }
      const job = await storage.createJob(result.data);
      
      // Broadcast dashboard update after job creation
      try {
        const dashboardData = await storage.getDashboardData();
        broadcastUpdate({ type: 'dashboard_update', data: dashboardData });
      } catch (broadcastError) {
        console.error('Failed to broadcast dashboard update after job creation:', broadcastError);
      }
      
      res.status(201).json(job);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      // Fix timestamp fields - ensure they're Date objects or remove invalid timestamps
      const updateData = { ...req.body };
      
      // Handle completedAt - set to current time if status is completed
      if (updateData.status === 'completed' && !updateData.completedAt) {
        updateData.completedAt = new Date();
      } else if (updateData.completedAt && typeof updateData.completedAt === 'string') {
        try {
          updateData.completedAt = new Date(updateData.completedAt);
          // Validate the date
          if (isNaN(updateData.completedAt.getTime())) {
            updateData.completedAt = new Date();
          }
        } catch (error) {
          updateData.completedAt = new Date();
        }
      }
      
      // Remove other timestamp fields from updates (let DB handle them)
      delete updateData.createdAt;
      delete updateData.updatedAt;
      
      const job = await storage.updateJob(req.params.id, updateData);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Calculate P4P when job is marked as completed
      if (updateData.status === 'completed') {
        try {
          const { P4PCalculationEngine } = await import('./p4pCalculations');
          console.log(`Job ${job.customerName} marked complete - calculating P4P...`);
          const p4pResults = await P4PCalculationEngine.calculateP4PForJob(req.params.id);
          console.log(`P4P calculated for ${p4pResults.length} assignments`);
        } catch (p4pError) {
          console.error('P4P calculation error:', p4pError);
          // Don't fail the job update if P4P calculation fails
        }
      }
      
      // Broadcast dashboard update after job update
      try {
        const dashboardData = await storage.getDashboardData();
        broadcastUpdate({ type: 'dashboard_update', data: dashboardData });
      } catch (broadcastError) {
        console.error('Failed to broadcast dashboard update after job update:', broadcastError);
      }
      
      res.json(job);
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteJob(id);
      if (!success) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Broadcast dashboard update after job deletion
      try {
        const dashboardData = await storage.getDashboardData();
        broadcastUpdate({ type: 'dashboard_update', data: dashboardData });
      } catch (broadcastError) {
        console.error('Failed to broadcast dashboard update after job deletion:', broadcastError);
      }
      
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const broadcastUpdate = (data: any) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    // Send initial dashboard data
    storage.getDashboardData().then(data => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'dashboard_update', data }));
      }
    });
  });

  // Broadcast updates every 30 seconds
  setInterval(async () => {
    try {
      const dashboardData = await storage.getDashboardData();
      broadcastUpdate({ type: 'dashboard_update', data: dashboardData });
    } catch (error) {
      console.error('Failed to broadcast dashboard update:', error);
    }
  }, 30000);

  return httpServer;
}
