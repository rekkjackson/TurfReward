import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertJobSchema, type Job, type Employee } from '@shared/schema';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  DollarSign, 
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  Edit,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

export function ProjectTracking() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs'],
  });

  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
  });

  const form = useForm({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      jobNumber: '',
      jobType: 'mowing',
      category: 'one_day',
      customerName: '',
      customerAddress: '',
      customerPhone: '',
      budgetedHours: '8.00',
      laborRevenue: '400.00',
      materialsCost: '0.00',
      totalJobValue: '400.00',
      priority: 'normal',
      estimatedDuration: 1,
      isLargejob: false,
      isSeasonalBonus: false,
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/jobs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({ title: 'Success', description: 'Job created successfully' });
      form.reset();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Job creation error:', error);
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to create job', 
        variant: 'destructive' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PATCH', `/api/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({ title: 'Success', description: 'Job updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update job', variant: 'destructive' });
    },
  });

  const onSubmit = (data: any) => {
    console.log('Form data before processing:', data);
    
    // Auto-generate job number if not provided
    if (!data.jobNumber) {
      const prefix = data.jobType.charAt(0).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      data.jobNumber = `${prefix}${timestamp}`;
    }

    // Calculate if it's a large job
    data.isLargejob = parseFloat(data.budgetedHours) >= 49;

    // Set seasonal bonus based on current date (March-May)
    const currentMonth = new Date().getMonth() + 1;
    data.isSeasonalBonus = currentMonth >= 3 && currentMonth <= 5;

    // Remove empty fields that might cause validation issues
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    console.log('Cleaned data for submission:', cleanedData);
    createMutation.mutate(cleanedData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-primary" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'yellow_slip':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'on_hold':
        return <Pause className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-gray-300 bg-gray-50';
      case 'in_progress':
        return 'border-primary bg-primary/10';
      case 'completed':
        return 'border-success bg-success/10';
      case 'yellow_slip':
        return 'border-warning bg-warning/10';
      case 'on_hold':
        return 'border-gray-400 bg-gray-100';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      normal: 'bg-gray-100 text-gray-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const filteredJobs = jobs?.filter((job: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'one_day') return job.category === 'one_day';
    if (activeTab === 'multi_day') return job.category === 'multi_day';
    if (activeTab === 'active') return ['pending', 'in_progress'].includes(job.status);
    if (activeTab === 'completed') return job.status === 'completed';
    return true;
  });

  if (jobsLoading) {
    return <div className="flex justify-center p-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Project & Job Tracking</h2>
          <p className="text-muted-foreground">Manage one-day routes and multi-day landscaping projects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Job/Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job/Project</DialogTitle>
              <DialogDescription>
                Add a new mowing route, landscaping project, or maintenance job
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="jobNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Auto-generated if empty" />
                        </FormControl>
                        <FormDescription>Optional - will auto-generate if left empty</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="jobType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mowing">Mowing</SelectItem>
                            <SelectItem value="landscaping">Landscaping</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="cleanup">Cleanup</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="one_day">One Day Job</SelectItem>
                            <SelectItem value="multi_day">Multi-Day Project</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Customer or property name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Job site address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(555) 123-4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="budgetedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budgeted Hours</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.25" placeholder="8.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="laborRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Labor Revenue ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalJobValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Job Value ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Special instructions, materials needed, client preferences..." 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                  >
                    Create Job
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Job Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="one_day">One Day</TabsTrigger>
          <TabsTrigger value="multi_day">Multi Day</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs && filteredJobs.length > 0 ? (
              filteredJobs.map((job: any) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`transition-all hover:shadow-md ${getStatusColor(job.status)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(job.status)}
                          <div>
                            <CardTitle className="text-lg">
                              {job.jobNumber || job.id.slice(0, 8)} - {job.customerName}
                            </CardTitle>
                            <CardDescription className="flex items-center space-x-4">
                              <span className="capitalize">{job.jobType}</span>
                              <span>•</span>
                              <span className="capitalize">{job.category.replace('_', ' ')}</span>
                              {job.budgetedHours && (
                                <>
                                  <span>•</span>
                                  <span>{job.budgetedHours}h budgeted</span>
                                </>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityBadge(job.priority)}>
                            {job.priority}
                          </Badge>
                          {job.isLargejob && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800">
                              Large Job Bonus
                            </Badge>
                          )}
                          {job.isSeasonalBonus && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Seasonal Bonus
                            </Badge>
                          )}
                          <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {job.customerAddress && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="truncate">{job.customerAddress}</span>
                          </div>
                        )}
                        {job.customerPhone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{job.customerPhone}</span>
                          </div>
                        )}
                        {job.laborRevenue && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span>${Number(job.laborRevenue).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {job.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{job.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-semibold mb-2">No jobs found</p>
                  <p className="text-muted-foreground">Create a new job to get started with project tracking!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}