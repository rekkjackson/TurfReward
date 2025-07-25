# P4P Performance Dashboard

## Overview

This is a comprehensive Pay-for-Performance (P4P) dashboard application for a landscaping business built with React, Express, and PostgreSQL. The system tracks employee performance, job completion metrics, and calculates performance-based compensation according to company policies.

## User Preferences

Preferred communication style: Simple, everyday language.

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

## Data Flow

1. **Data Entry**: Jobs and performance data entered through admin interface
2. **Calculation Engine**: P4P configurations determine performance pay
3. **Real-time Updates**: WebSocket broadcasts changes to connected dashboards
4. **Performance Tracking**: Metrics calculated and stored for reporting
5. **Visual Display**: Dashboard components render live performance data

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