import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Users, 
  Calculator,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { type Employee, type JobAssignment, type Job } from '@shared/schema';
import { getCurrentPayPeriod, getPayPeriodBounds } from '@shared/payPeriodUtils';

interface PayrollSummary {
  employeeId: string;
  employee: Employee;
  totalHours: number;
  p4pHours: number;
  hourlyHours: number;
  totalP4P: number;
  hourlyPay: number;
  totalEarnings: number;
  efficiency: number;
  jobCount: number;
  qualityDeductions: number;
}

interface PayPeriodData {
  currentPeriod: {
    start: string;
    end: string;
    periodName: string;
    periodType: string;
  };
  periodProgress: number;
  daysRemaining: number;
  workingDaysTotal: number;
  isCurrentPeriod: boolean;
}

export function PayrollDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous'>('current');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const { data: payPeriodData } = useQuery<PayPeriodData>({
    queryKey: ['/api/pay-period/current'],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const { data: assignments = [] } = useQuery<JobAssignment[]>({
    queryKey: ['/api/job-assignments'],
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  const { data: p4pConfigs = [] } = useQuery<P4PConfig[]>({
    queryKey: ['/api/p4p-configs'],
  });

  // Calculate payroll summaries for current pay period
  const calculatePayrollSummary = (): PayrollSummary[] => {
    if (!payPeriodData) return [];

    const periodStart = new Date(payPeriodData.currentPeriod.start);
    const periodEnd = new Date(payPeriodData.currentPeriod.end);

    // Filter assignments to current pay period
    const periodAssignments = assignments.filter(assignment => {
      const assignmentDate = assignment.createdAt ? new Date(assignment.createdAt) : new Date();
      return assignmentDate >= periodStart && assignmentDate <= periodEnd;
    });

    // Group by employee
    const employeeGroups = periodAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.employeeId]) {
        acc[assignment.employeeId] = [];
      }
      acc[assignment.employeeId].push(assignment);
      return acc;
    }, {} as Record<string, JobAssignment[]>);

    return Object.entries(employeeGroups).map(([employeeId, empAssignments]) => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return null;

      const totalHours = empAssignments.reduce((sum, assign) => 
        sum + parseFloat(assign.hoursWorked || '0'), 0
      );

      const totalP4P = empAssignments.reduce((sum, assign) => 
        sum + parseFloat(assign.performancePay || '0'), 0
      );

      // Get minimum wage from P4P configs (use the job types for this employee's assignments)
      const employeeJobTypes = [...new Set(empAssignments.map(assign => {
        const job = jobs.find(j => j.id === assign.jobId);
        return job?.jobType || 'maintenance';
      }))];
      
      // Use the highest minimum wage if employee worked multiple job types
      const applicableMinWages = employeeJobTypes.map(jobType => {
        const config = p4pConfigs.find(c => c.jobType === jobType && c.isActive);
        return parseFloat(config?.minimumHourlyRate || '23');
      });
      const minWage = Math.max(...applicableMinWages, 23); // Default to 23 if no configs found
      
      // Calculate hourly vs P4P split
      const baseRate = parseFloat(employee.baseHourlyRate || '23');
      const p4pHourlyEquivalent = totalHours > 0 ? totalP4P / totalHours : 0;
      
      let p4pHours = 0;
      let hourlyHours = 0;
      let hourlyPay = 0;

      if (p4pHourlyEquivalent >= minWage) {
        // All P4P if it meets minimum wage
        p4pHours = totalHours;
      } else {
        // Mix of P4P and hourly to meet minimum
        p4pHours = totalHours;
        const shortfall = (minWage * totalHours) - totalP4P;
        hourlyPay = Math.max(0, shortfall);
      }

      const totalEarnings = totalP4P + hourlyPay;

      // Calculate efficiency
      const jobIds = [...new Set(empAssignments.map(a => a.jobId))];
      const relatedJobs = jobs.filter(job => jobIds.includes(job.id));
      const totalBudgetedHours = relatedJobs.reduce((sum, job) => 
        sum + parseFloat(job.budgetedHours || '0'), 0
      );
      const efficiency = totalBudgetedHours > 0 ? totalBudgetedHours / totalHours : 0;

      return {
        employeeId,
        employee,
        totalHours,
        p4pHours,
        hourlyHours,
        totalP4P,
        hourlyPay,
        totalEarnings,
        efficiency,
        jobCount: jobIds.length,
        qualityDeductions: 0 // TODO: Calculate from incidents
      };
    }).filter(Boolean) as PayrollSummary[];
  };

  const payrollSummaries = calculatePayrollSummary();
  const totalPayroll = payrollSummaries.reduce((sum, emp) => sum + emp.totalEarnings, 0);
  const totalHours = payrollSummaries.reduce((sum, emp) => sum + emp.totalHours, 0);
  const averageEfficiency = payrollSummaries.length > 0 
    ? payrollSummaries.reduce((sum, emp) => sum + emp.efficiency, 0) / payrollSummaries.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payroll Dashboard</h2>
          <p className="text-muted-foreground">Track P4P vs hourly compensation for accurate payroll processing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Generate Paystubs
          </Button>
        </div>
      </div>

      {/* Pay Period Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Current Pay Period</span>
          </CardTitle>
          <CardDescription>
            {payPeriodData?.currentPeriod.periodName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{payPeriodData?.daysRemaining || 0}</div>
              <div className="text-sm text-muted-foreground">Days Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${totalPayroll.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Payroll</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(averageEfficiency * 100).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Efficiency</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Pay Period Progress</span>
              <span className="text-sm text-muted-foreground">
                {payPeriodData?.periodProgress.toFixed(1) || 0}%
              </span>
            </div>
            <Progress value={payPeriodData?.periodProgress || 0} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Employee Payroll Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Employee Payroll Summary</span>
          </CardTitle>
          <CardDescription>
            Breakdown of P4P vs hourly compensation for each team member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollSummaries.map((summary) => (
              <div key={summary.employeeId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{summary.employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{summary.employee.position}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {summary.totalHours.toFixed(1)}h
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {(summary.efficiency * 100).toFixed(1)}% efficiency
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {summary.jobCount} jobs
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${summary.totalEarnings.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Earnings</div>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">P4P Earnings</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">${summary.totalP4P.toFixed(2)}</div>
                    <div className="text-xs text-green-600/80">
                      ${(summary.totalP4P / summary.totalHours).toFixed(2)}/hour avg
                    </div>
                  </div>

                  {summary.hourlyPay > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-orange-800 dark:text-orange-200">Hourly Supplement</span>
                      </div>
                      <div className="text-xl font-bold text-orange-600">${summary.hourlyPay.toFixed(2)}</div>
                      <div className="text-xs text-orange-600/80">
                        To meet $23/hour minimum
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calculator className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">Effective Rate</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      ${(summary.totalEarnings / summary.totalHours).toFixed(2)}/h
                    </div>
                    <div className="text-xs text-blue-600/80">
                      {summary.efficiency >= 1.0 ? 'Above minimum' : 'At minimum wage'}
                    </div>
                  </div>
                </div>

                {summary.qualityDeductions > 0 && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Quality Deductions: -${summary.qualityDeductions.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {payrollSummaries.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-semibold mb-2">No payroll data yet</p>
                <p className="text-muted-foreground">
                  Assign employees to jobs to see payroll calculations for this pay period.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payroll Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pay Method Breakdown</CardTitle>
            <CardDescription>How compensation is distributed this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Performance Pay (P4P)</span>
                <span className="font-medium">
                  ${payrollSummaries.reduce((sum, emp) => sum + emp.totalP4P, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hourly Supplements</span>
                <span className="font-medium">
                  ${payrollSummaries.reduce((sum, emp) => sum + emp.hourlyPay, 0).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Payroll</span>
                <span>${totalPayroll.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efficiency Overview</CardTitle>
            <CardDescription>Team performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Average Efficiency</span>
                <Badge variant={averageEfficiency >= 1.0 ? "default" : "secondary"}>
                  {(averageEfficiency * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Employees Above Target</span>
                <span className="font-medium">
                  {payrollSummaries.filter(emp => emp.efficiency >= 1.0).length} / {payrollSummaries.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Jobs Completed</span>
                <span className="font-medium">
                  {payrollSummaries.reduce((sum, emp) => sum + emp.jobCount, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}