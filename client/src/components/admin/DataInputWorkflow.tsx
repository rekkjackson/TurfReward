import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle,
  PlayCircle,
  PauseCircle,
  AlertTriangle
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

export function DataInputWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [location, setLocation] = useLocation();

  const workflowSteps = [
    {
      title: "1. Create Job/Project",
      description: "Set up mowing routes or landscaping projects with budgeted hours and revenue",
      status: "completed",
      action: "Go to Projects tab",
      link: "projects"
    },
    {
      title: "2. Assign Team Members",
      description: "Add employees to jobs with roles (leader, training) and track actual hours worked",
      status: "in_progress",
      action: "Go to Job Tracking tab",
      link: "assignments"
    },
    {
      title: "3. Track Performance",
      description: "System auto-calculates P4P based on efficiency, bonuses, and company policies",
      status: "pending",
      action: "View Dashboard",
      link: "/"
    },
    {
      title: "4. Record Quality Issues",
      description: "Log yellow slips, property damage, and equipment issues that affect pay",
      status: "pending", 
      action: "Go to Incidents tab",
      link: "incidents"
    },
  ];

  const jobTypes = [
    {
      type: "Mowing Routes",
      category: "One-Day Jobs",
      description: "Daily mowing routes with 33% labor revenue (40% March-May)",
      payStructure: "33% of labor revenue, $23/hr minimum, seasonal bonuses",
      examples: ["Residential Route 5", "Commercial Properties", "HOA Communities"],
    },
    {
      type: "Landscaping Projects", 
      category: "Multi-Day Projects",
      description: "Large landscaping jobs with potential large job bonuses",
      payStructure: "33% of labor revenue, $1.50/budgeted hour if 49+ hours, $23/hr minimum",
      examples: ["New Installation", "Landscape Renovation", "Commercial Design"],
    },
    {
      type: "Maintenance & Cleanups",
      category: "Variable Duration",
      description: "Property maintenance and seasonal cleanup work",
      payStructure: "33% of labor revenue, training bonuses when applicable",
      examples: ["Spring Cleanup", "Fall Leaf Removal", "Property Maintenance"],
    },
  ];

  const p4pRules = [
    {
      rule: "Base Pay Structure",
      details: "33% of labor revenue split among team (40% March-May seasonal bonus)",
    },
    {
      rule: "Minimum Wage Protection",
      details: "Pay cannot average less than $23/hour per pay period",
    },
    {
      rule: "Training Bonus",
      details: "$4/hour added when training new employees (manager approved)",
    },
    {
      rule: "Large Job Bonus",
      details: "$1.50 per budgeted hour for jobs 49+ hours (office manager allocates)",
    },
    {
      rule: "Yellow Slip Policy",
      details: "Quality rework required, costs deducted from performance pay",
    },
    {
      rule: "Damage Costs",
      details: "Property/equipment damage costs deducted from performance pay (not base pay)",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Data Input & Project Workflow</h2>
        <p className="text-muted-foreground">
          Complete workflow for tracking projects, assigning teams, and calculating P4P based on your business document
        </p>
      </div>

      <Tabs defaultValue="workflow" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow">Daily Workflow</TabsTrigger>
          <TabsTrigger value="job-types">Job Types</TabsTrigger>
          <TabsTrigger value="p4p-rules">P4P Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Data Input Workflow</CardTitle>
              <CardDescription>
                Follow this process for accurate P4P tracking and calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      step.status === 'completed' ? 'border-success bg-success/10' :
                      step.status === 'in_progress' ? 'border-primary bg-primary/10' :
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {step.status === 'completed' && <CheckCircle className="w-5 h-5 text-success" />}
                        {step.status === 'in_progress' && <PlayCircle className="w-5 h-5 text-primary" />}
                        {step.status === 'pending' && <PauseCircle className="w-5 h-5 text-gray-400" />}
                        <div>
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      {step.link === '/' ? (
                        <Link href="/">
                          <Button 
                            variant={step.status === 'in_progress' ? 'default' : 'outline'}
                            size="sm"
                          >
                            {step.action}
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          variant={step.status === 'in_progress' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            // Navigate to the correct admin tab
                            const adminUrl = `/admin`;
                            setLocation(adminUrl);
                            // Use setTimeout to allow navigation, then trigger tab change
                            setTimeout(() => {
                              const tabTrigger = document.querySelector(`[value="${step.link}"]`) as HTMLElement;
                              if (tabTrigger) {
                                tabTrigger.click();
                              }
                            }, 100);
                          }}
                        >
                          {step.action}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Quick Start Guide:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Create new job in Projects tab with customer info and budgeted hours</li>
                  <li>2. Assign team members in Job Tracking tab as work progresses</li>
                  <li>3. Record actual hours worked for automatic P4P calculation</li>
                  <li>4. Log any quality issues or damage in Incidents tab</li>
                  <li>5. Complete job when finished to finalize all calculations</li>
                </ol>
                <div className="mt-4 p-3 bg-green-100 rounded border-l-4 border-green-500">
                  <p className="text-sm text-green-800">
                    ✅ <strong>Test data cleared!</strong> System ready for fresh data input.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job-types" className="space-y-4">
          {jobTypes.map((jobType, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>{jobType.type}</span>
                    </CardTitle>
                    <CardDescription>{jobType.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{jobType.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Pay Structure:</h4>
                    <p className="text-sm text-muted-foreground">{jobType.payStructure}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Examples:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {jobType.examples.map((example, i) => (
                        <li key={i}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="p4p-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Pay-for-Performance Rules</span>
              </CardTitle>
              <CardDescription>
                Based on your landscaping business P4P document - these rules are automatically applied
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {p4pRules.map((rule, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">{rule.rule}</h4>
                        <p className="text-sm text-muted-foreground">{rule.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Important Notes:</h4>
                    <ul className="text-sm text-amber-700 mt-1 space-y-1">
                      <li>• Multi-day jobs spanning pay periods: hours paid at base rate until completion</li>
                      <li>• Equipment maintenance time requires manager approval (paid at $23/hr base)</li>
                      <li>• $50 bonus for new customer referrals, $10 gift card for existing customer estimates</li>
                      <li>• Quarterly profit sharing: 10% of profits to full-time field team members</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}