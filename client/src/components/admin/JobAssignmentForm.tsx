import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertJobAssignmentSchema, type Job, type Employee, type JobAssignment } from '@shared/schema';
import { Users, Clock, Star, Calculator, CheckCircle, AlertTriangle } from 'lucide-react';

export function JobAssignmentForm() {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['/api/job-assignments'],
  });

  const form = useForm({
    resolver: zodResolver(insertJobAssignmentSchema),
    defaultValues: {
      jobId: '',
      employeeId: '',
      hoursWorked: '0.00',
      isLeader: false,
      isTraining: false,
      performancePay: '0.00',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/job-assignments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({ title: 'Success', description: 'Job assignment created successfully' });
      form.reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create assignment', variant: 'destructive' });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PATCH', `/api/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({ title: 'Success', description: 'Job updated successfully' });
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const calculatePerformancePay = (job: Job, assignment: any) => {
    if (!job || !assignment.hoursWorked) return 0;

    const laborRevenue = parseFloat(job.laborRevenue);
    const hoursWorked = parseFloat(assignment.hoursWorked);
    
    // Get P4P percentage (33% normal, 40% seasonal March-May)
    const percentage = job.isSeasonalBonus ? 0.40 : 0.33;
    
    // Base performance pay
    let performancePay = (laborRevenue * percentage * (hoursWorked / parseFloat(job.actualHours || job.budgetedHours)));
    
    // Add training bonus if applicable
    if (assignment.isTraining) {
      performancePay += hoursWorked * 4; // $4/hour training bonus
    }
    
    // Add large job bonus if applicable (49+ hours)
    if (job.isLargejob && parseFloat(job.budgetedHours) >= 49) {
      performancePay += parseFloat(job.budgetedHours) * 1.50; // $1.50 per budgeted hour
    }
    
    // Ensure minimum wage ($18/hour)
    const minimumPay = hoursWorked * 18;
    
    return Math.max(performancePay, minimumPay);
  };

  const completeJob = (jobId: string, actualHours: number) => {
    updateJobMutation.mutate({
      id: jobId,
      data: {
        status: 'completed',
        actualHours: actualHours.toString(),
        completedAt: new Date().toISOString(),
      }
    });
  };

  const activeJobs = jobs.filter((job: any) => ['pending', 'in_progress'].includes(job.status));
  const selectedJob = jobs.find((job: any) => job.id === selectedJobId);
  const jobAssignments = assignments.filter((assignment: any) => 
    assignment.jobId === selectedJobId
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Job Assignment & Time Tracking</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Assign employees to jobs and track actual hours worked for P4P calculations
        </p>
      </div>

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Select Active Job</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a job to assign workers to" />
            </SelectTrigger>
            <SelectContent>
              {activeJobs.map((job: any) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.jobNumber || job.id.slice(0, 8)} - {job.customerName} ({job.jobType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Job Details & Assignment Form */}
      {selectedJob && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>{selectedJob.customerName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Job Type:</span>
                <Badge variant="outline" className="capitalize">
                  {selectedJob.jobType}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Category:</span>
                <span className="text-sm capitalize">{selectedJob.category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Budgeted Hours:</span>
                <span className="text-sm">{selectedJob.budgetedHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Labor Revenue:</span>
                <span className="text-sm">${Number(selectedJob.laborRevenue).toLocaleString()}</span>
              </div>
              {selectedJob.isLargejob && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Large Job Bonus:</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    +${(parseFloat(selectedJob.budgetedHours) * 1.5).toFixed(2)}
                  </Badge>
                </div>
              )}
              {selectedJob.isSeasonalBonus && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Seasonal Rate:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    40% (Mar-May)
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Assign Employee</CardTitle>
              <CardDescription>Add team member to this job</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <input type="hidden" value={selectedJobId} {...form.register('jobId')} />
                  
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name} - {employee.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hoursWorked"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours Worked</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.25" placeholder="8.00" />
                        </FormControl>
                        <FormDescription>
                          Actual hours worked on this job
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isLeader"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Team Leader</FormLabel>
                            <FormDescription className="text-xs">
                              Crew leader role
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isTraining"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Training</FormLabel>
                            <FormDescription className="text-xs">
                              +$4/hour bonus
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    Assign Employee
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Assignments */}
      {selectedJob && jobAssignments && jobAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Assignments</span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const totalHours = jobAssignments.reduce((sum, assignment) => 
                      sum + parseFloat(assignment.hoursWorked || '0'), 0
                    );
                    completeJob(selectedJobId, totalHours);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete Job
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobAssignments.map((assignment: any) => {
                const employee = employees?.find((emp: Employee) => emp.id === assignment.employeeId);
                const calculatedPay = calculatePerformancePay(selectedJob, assignment);
                
                return (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{employee?.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Clock className="w-3 h-3" />
                          <span>{assignment.hoursWorked}h worked</span>
                          {assignment.isLeader && (
                            <Badge variant="outline" size="sm">Leader</Badge>
                          )}
                          {assignment.isTraining && (
                            <Badge variant="outline" size="sm">Training +$4/h</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${calculatedPay.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        ${(calculatedPay / parseFloat(assignment.hoursWorked || '1')).toFixed(2)}/h
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total Hours: {jobAssignments.reduce((sum, assignment) => 
                    sum + parseFloat(assignment.hoursWorked || '0'), 0
                  )}h</span>
                  <span>Total Pay: ${jobAssignments.reduce((sum, assignment) => 
                    sum + calculatePerformancePay(selectedJob, assignment), 0
                  ).toFixed(2)}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Budgeted: {selectedJob.budgetedHours}h | 
                  Efficiency: {(
                    parseFloat(selectedJob.budgetedHours) / 
                    jobAssignments.reduce((sum, assignment) => sum + parseFloat(assignment.hoursWorked || '0'), 0) * 100
                  ).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}