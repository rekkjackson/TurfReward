import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Table component not available, using div structure
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calculator, Users, Clock, DollarSign } from 'lucide-react';
import { type Employee, type JobAssignment, type Job, type P4PConfig } from '@shared/schema';

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

interface DetailedPayrollRecord {
  employee: Employee;
  assignments: JobAssignment[];
  totalHours: number;
  totalP4P: number;
  averageHourlyRate: number;
  minimumWageRequired: number;
  hourlySupplementNeeded: number;
  totalPayDue: number;
  bonusEarned: number;
  dailyBreakdown: { [date: string]: { hours: number; earnings: number; jobs: string[] } };
}

export function AccountantPayrollReport() {
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous'>('current');

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

  const calculateDetailedPayroll = (): DetailedPayrollRecord[] => {
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

      // Get minimum wage from P4P configs (use highest applicable)
      const employeeJobTypes = [...new Set(empAssignments.map(assign => {
        const job = jobs.find(j => j.id === assign.jobId);
        return job?.jobType || 'maintenance';
      }))];
      
      const applicableMinWages = employeeJobTypes.map(jobType => {
        const config = p4pConfigs.find(c => c.jobType === jobType && c.isActive);
        return parseFloat(config?.minimumHourlyRate || '23');
      });
      const minWage = Math.max(...applicableMinWages, 23);

      const minimumWageRequired = totalHours * minWage;
      const hourlySupplementNeeded = Math.max(0, minimumWageRequired - totalP4P);
      const totalPayDue = totalP4P + hourlySupplementNeeded;
      const averageHourlyRate = totalHours > 0 ? totalPayDue / totalHours : 0;
      const bonusEarned = Math.max(0, totalP4P - minimumWageRequired);

      // Calculate daily breakdown
      const dailyBreakdown: { [date: string]: { hours: number; earnings: number; jobs: string[] } } = {};
      
      empAssignments.forEach(assign => {
        const job = jobs.find(j => j.id === assign.jobId);
        const assignDate = assign.createdAt ? new Date(assign.createdAt).toISOString().split('T')[0] : 'Unknown';
        const hours = parseFloat(assign.hoursWorked || '0');
        const earnings = parseFloat(assign.performancePay || '0');
        
        if (!dailyBreakdown[assignDate]) {
          dailyBreakdown[assignDate] = { hours: 0, earnings: 0, jobs: [] };
        }
        
        dailyBreakdown[assignDate].hours += hours;
        dailyBreakdown[assignDate].earnings += earnings;
        if (job) {
          dailyBreakdown[assignDate].jobs.push(`${job.jobNumber} (${job.jobType})`);
        }
      });

      return {
        employee,
        assignments: empAssignments,
        totalHours,
        totalP4P,
        averageHourlyRate,
        minimumWageRequired,
        hourlySupplementNeeded,
        totalPayDue,
        bonusEarned,
        dailyBreakdown
      };
    }).filter(Boolean) as DetailedPayrollRecord[];
  };

  const payrollRecords = calculateDetailedPayroll();
  const totalPayroll = payrollRecords.reduce((sum, record) => sum + record.totalPayDue, 0);
  const totalHours = payrollRecords.reduce((sum, record) => sum + record.totalHours, 0);
  const totalBonuses = payrollRecords.reduce((sum, record) => sum + record.bonusEarned, 0);

  const exportToCSV = () => {
    // Simplified CSV export as requested: timeframe, total hours, total pay, bonus
    const escapeCSV = (field: any) => {
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Employee', 'Pay Period', 'Total Hours', 'Total Pay', 'Bonus (P4P above hourly)'];
    
    const csvRows = [
      headers.map(escapeCSV).join(','),
      ...payrollRecords.map(record => [
        escapeCSV(record.employee.name),
        escapeCSV(payPeriodData?.currentPeriod.periodName || 'Current Period'),
        escapeCSV(record.totalHours.toFixed(2)),
        escapeCSV(record.totalPayDue.toFixed(2)),
        escapeCSV(record.bonusEarned.toFixed(2))
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_${payPeriodData?.currentPeriod.periodName?.replace(/\s+/g, '_') || 'Current'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!payPeriodData) {
    return <div className="flex justify-center p-8">Loading payroll data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Accountant Payroll Report</h2>
          <p className="text-muted-foreground">
            Detailed payroll breakdown for {payPeriodData.currentPeriod.periodName}
          </p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayroll.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              For {payPeriodData.currentPeriod.periodName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Across all employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              With hours worked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonuses</CardTitle>
            <Calculator className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBonuses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              P4P above minimum
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Payroll Breakdown</CardTitle>
          <CardDescription>
            Complete payroll information for accounting and compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="grid grid-cols-8 gap-4 font-semibold border-b pb-2 mb-4">
                <div>Employee</div>
                <div>Total Hours</div>
                <div>Hourly Rate</div>
                <div>P4P Earnings</div>
                <div>Min Wage Due</div>
                <div>Hourly Supplement</div>
                <div>Bonus Earned</div>
                <div>Total Pay</div>
              </div>
              
              {/* Data Rows */}
              {payrollRecords.map((record) => (
                <div key={record.employee.id} className="grid grid-cols-8 gap-4 py-3 border-b">
                  <div>
                    <div className="font-medium">{record.employee.name}</div>
                    <div className="text-sm text-muted-foreground">{record.employee.position}</div>
                  </div>
                  <div className="font-mono">{record.totalHours.toFixed(1)}h</div>
                  <div className="font-mono">${record.averageHourlyRate.toFixed(2)}/hr</div>
                  <div className="font-mono">${record.totalP4P.toFixed(2)}</div>
                  <div className="font-mono">${record.minimumWageRequired.toFixed(2)}</div>
                  <div className="font-mono">
                    {record.hourlySupplementNeeded > 0 ? 
                      <span className="text-orange-600">${record.hourlySupplementNeeded.toFixed(2)}</span> :
                      <span className="text-green-600">$0.00</span>
                    }
                  </div>
                  <div className="font-mono">
                    {record.bonusEarned > 0 ? 
                      <Badge variant="default">${record.bonusEarned.toFixed(2)}</Badge> :
                      <span className="text-muted-foreground">$0.00</span>
                    }
                  </div>
                  <div className="font-mono font-bold">${record.totalPayDue.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown for Each Employee */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Daily Hours Breakdown</h3>
        {payrollRecords.map((record) => (
          <Card key={record.employee.id}>
            <CardHeader>
              <CardTitle className="text-base">{record.employee.name} - Daily Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {Object.entries(record.dailyBreakdown).map(([date, data]) => (
                  <div key={date} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">{new Date(date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.jobs.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{data.hours.toFixed(1)}h</div>
                      <div className="text-sm text-muted-foreground font-mono">${data.earnings.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}