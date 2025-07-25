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
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  // Job Assignment routes
  app.get("/api/job-assignments", async (req, res) => {
    try {
      const assignments = await storage.getJobAssignments();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job assignments" });
    }
  });

  app.post("/api/job-assignments", async (req, res) => {
    try {
      const validatedData = insertJobAssignmentSchema.parse(req.body);
      const assignment = await storage.createJobAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ message: "Invalid job assignment data" });
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
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Incidents endpoints
  app.get("/api/incidents", async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post("/api/incidents", async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);
      res.status(201).json(incident);
    } catch (error) {
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  // Enhanced job routes for project tracking
  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.updateJob(req.params.id, req.body);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
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
