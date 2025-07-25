import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { P4PConfigForm } from '@/components/admin/P4PConfigForm';
import { EmployeeManagement } from '@/components/admin/EmployeeManagement';
import { IncidentManagement } from '@/components/admin/IncidentManagement';
import { Settings, Users, DollarSign, BarChart3, AlertTriangle } from 'lucide-react';
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

        <Tabs defaultValue="p4p-config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="p4p-config" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>P4P Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Employee Management</span>
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Incidents & Yellow Slips</span>
            </TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </div>
  );
}
