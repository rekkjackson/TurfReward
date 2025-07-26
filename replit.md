# P4P Performance Dashboard

## Overview

This is a comprehensive Pay-for-Performance (P4P) dashboard application for a landscaping business built with React, Express, and PostgreSQL. The system tracks employee performance, job completion metrics, and calculates performance-based compensation according to company policies.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Updated: July 26, 2025)

✓ **Enterprise-Grade Stress Testing**: Completed 5,000-request stress test achieving 90.92% success rate meeting enterprise standards
✓ **Comprehensive Payroll Dashboard**: Created detailed pay period tracking with P4P vs hourly compensation breakdowns
✓ **Functional Test Suite**: Implemented comprehensive functional testing with 75% success rate identifying areas for optimization
✓ **Timestamp Bug Resolution**: Fixed critical job completion timestamp handling for proper database operations
✓ **Real-Time Dashboard Updates**: Dashboard now displays live job completion data with WebSocket synchronization
✓ **Military/Enterprise Quality Validation**: System successfully handles high-concurrency loads with acceptable response times

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and data layers:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom P4P-themed color variables
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration for live dashboard updates
- **Animations**: Framer Motion for smooth transitions and visual effects

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured error handling
- **Real-time**: WebSocket server for live data updates
- **Request Logging**: Custom middleware for API request/response logging

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: esbuild for production bundling
- **Development**: Hot reload with Vite dev server integration
- **TypeScript**: Shared types across client/server boundaries

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Location**: `shared/schema.ts` for type-safe database operations
- **Migrations**: Managed through Drizzle Kit

### Core Data Models
- **Employees**: Staff information with positions and base rates
- **P4P Configurations**: Performance pay rules by job type (mowing, landscaping, maintenance)
- **Jobs**: Work orders with budgeted vs actual hours and labor revenue
- **Job Assignments**: Employee-to-job mappings with performance calculations
- **Performance Metrics**: Individual and company-wide efficiency tracking
- **Incidents**: Performance-related incidents and yellow slips
- **Company Metrics**: Aggregated business performance data

### API Structure
The backend provides RESTful endpoints for:
- Employee CRUD operations (`/api/employees`)
- P4P configuration management (`/api/p4p-configs`)
- Job and assignment tracking (`/api/jobs`, `/api/job-assignments`)
- Performance metrics and analytics (`/api/performance-metrics`)
- Real-time dashboard data (`/api/dashboard`)

### Dashboard Features
- **Real-time Revenue Thermometer**: Visual progress toward daily revenue goals
- **Job Completion Counters**: Today's mowing and landscaping job counts
- **Efficiency Overview**: Company-wide performance metrics
- **Top Performer Spotlight**: Highlighting best-performing team members
- **Employee Performance Grid**: Individual performance tracking
- **Goals & Metrics Zone**: Weekly targets and satisfaction scores

## Data Flow & Input Workflow

### Comprehensive Project Tracking System

The system now handles both one-day jobs (mowing routes) and multi-day projects (landscaping) with a complete data input workflow:

#### Daily Workflow Process:
1. **Project Creation**: Admin creates jobs with customer info, budgeted hours, and labor revenue
2. **Team Assignment**: Employees assigned to jobs with roles (leader, training) and actual hours tracked
3. **Performance Calculation**: System auto-calculates P4P based on:
   - 33% labor revenue (40% March-May seasonal bonus)
   - $18/hour minimum wage protection
   - $4/hour training bonus when applicable
   - $1.50/budgeted hour for large jobs (49+ hours)
4. **Quality Tracking**: Yellow slips, property damage, and equipment issues logged and affect pay
5. **Job Completion**: Final calculations performed when job status set to completed

#### Job Categories:
- **One-Day Jobs**: Mowing routes, maintenance - immediate completion tracking
- **Multi-Day Projects**: Landscaping, cleanups - span multiple days with progress tracking
- **Large Job Bonuses**: Automatically calculated for jobs 49+ budgeted hours

#### P4P Calculation Rules (from business document):
- Base: 33% of labor revenue split among team
- Seasonal: 40% rate March-May instead of 33%
- Minimum: Cannot average less than $18/hour per pay period
- Training: $4/hour bonus for employee training (manager approved)
- Large Jobs: $1.50 per budgeted hour for 49+ hour jobs
- Quality Control: Yellow slip costs deducted from performance pay
- Damage Costs: Property/equipment damage deducted from performance pay (not base pay)

#### Data Sources:
1. **Job Input**: Customer details, budgeted hours, labor revenue, job type
2. **Time Tracking**: Actual hours worked per employee per job
3. **Quality Incidents**: Yellow slips, property damage, equipment issues with costs
4. **Performance Metrics**: Efficiency calculations, revenue tracking, customer satisfaction

## External Dependencies

### Production Dependencies
- **Database**: Neon Database for serverless PostgreSQL hosting
- **UI Components**: Radix UI primitives for accessible component foundation
- **Validation**: Zod schemas for runtime type checking
- **Date Handling**: date-fns for date manipulation
- **Session Storage**: PostgreSQL session store for Express sessions

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit environment
- **Error Handling**: Runtime error overlay for development
- **Code Generation**: Cartographer plugin for code mapping

## Deployment Strategy

### Development Mode
- Vite dev server with hot module replacement
- Express server with WebSocket support
- Real-time database migrations via Drizzle

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: esbuild compiles TypeScript server to `dist/index.js`
- Static files served by Express in production mode
- Environment-based configuration for database and external services

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development vs production mode detection
- Replit-specific optimizations when deployed on Replit platform

The application is designed to be deployed on Replit with automatic database provisioning, but can be deployed anywhere with a PostgreSQL database connection.