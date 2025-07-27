import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { P4PConfigForm } from '@/components/admin/P4PConfigForm';
import { EmployeeManagement } from '@/components/admin/EmployeeManagement';
import { IncidentManagement } from '@/components/admin/IncidentManagement';
import { AchievementManagement } from '@/components/admin/AchievementManagement';
import { ProjectTracking } from '@/components/admin/ProjectTracking';
import { JobAssignmentForm } from '@/components/admin/JobAssignmentForm';
import { DataInputWorkflow } from '@/components/admin/DataInputWorkflow';
import { PayrollDashboard } from '@/components/admin/PayrollDashboard';
import { AccountantPayrollReport } from '@/components/admin/AccountantPayrollReport';
import { Settings, Users, DollarSign, BarChart3, AlertTriangle, Calendar, Briefcase, Calculator } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">P4P System Administration</h1>
            <p className="text-muted-foreground">
              Configure pay-for-performance settings and manage team members
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="workflow" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Workflow</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Job Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Payroll</span>
            </TabsTrigger>
            <TabsTrigger value="accountant" className="flex items-center space-x-2">
              <Calculator className="w-4 h-4" />
              <span>Accountant</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Incidents</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="p4p-config" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>P4P Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-6">
            <DataInputWorkflow />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Project & Job Management</span>
                </CardTitle>
                <CardDescription>
                  Create and manage mowing routes, landscaping projects, and maintenance jobs.
                  Track budgeted vs actual hours for accurate P4P calculations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectTracking />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Job Assignment & Time Tracking</span>
                </CardTitle>
                <CardDescription>
                  Assign employees to jobs and track actual hours worked.
                  System automatically calculates P4P based on efficiency, bonuses, and company policies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobAssignmentForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="p4p-config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Pay-for-Performance Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure rates, bonuses, and policies based on your landscaping business P4P document.
                  These settings control how team members are compensated based on performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <P4PConfigForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <PayrollDashboard />
          </TabsContent>

          <TabsContent value="accountant" className="space-y-6">
            <AccountantPayrollReport />
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Incident & Yellow Slip Tracking</span>
                </CardTitle>
                <CardDescription>
                  Track quality issues, property damage, and yellow slips for P4P calculations.
                  These incidents affect performance pay and profit sharing eligibility.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
