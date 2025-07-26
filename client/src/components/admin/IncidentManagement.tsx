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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertIncidentSchema, type Incident, type Employee } from '@shared/schema';
import { AlertTriangle, Plus, Wrench, AlertCircle } from 'lucide-react';

export function IncidentManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/incidents'],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
  });

  const form = useForm({
    resolver: zodResolver(insertIncidentSchema.omit({ id: true, createdAt: true, updatedAt: true })),
    defaultValues: {
      employeeId: '',
      jobId: 'none',
      type: 'yellow_slip',
      description: '',
      cost: '0.00',
      resolved: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/incidents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({ title: 'Success', description: 'Incident recorded successfully' });
      form.reset();
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to record incident', variant: 'destructive' });
    },
  });

  const onSubmit = (data: any) => {
    // Handle "none" value for optional jobId
    const submitData = {
      ...data,
      jobId: data.jobId === 'none' ? null : data.jobId
    };
    createMutation.mutate(submitData);
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'yellow_slip':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'property_damage':
        return <AlertCircle className="w-5 h-5 text-danger" />;
      case 'quality_issue':
        return <AlertTriangle className="w-5 h-5 text-primary" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-500" />;
    }
  };

  const getIncidentColor = (type: string) => {
    switch (type) {
      case 'yellow_slip':
        return 'border-warning bg-warning/10';
      case 'property_damage':
        return 'border-danger bg-danger/10';
      case 'quality_issue':
        return 'border-primary bg-primary/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  if (incidentsLoading) {
    return <div className="flex justify-center p-8">Loading incidents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Incident Management</h2>
          <p className="text-muted-foreground">Track yellow slips, damage cases, and quality issues</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
              <DialogDescription>
                Record yellow slips, property damage, or quality issues for P4P tracking
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          {employees && employees.map((employee: Employee) => (
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
                  name="jobId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Job (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job if applicable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No specific job</SelectItem>
                          {jobs.map((job: any) => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.jobNumber} - {job.customerName || 'Internal Job'}
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select incident type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yellow_slip">Yellow Slip - Quality Issue</SelectItem>
                          <SelectItem value="property_damage">Property Damage</SelectItem>
                          <SelectItem value="quality_issue">Quality Issue</SelectItem>
                          <SelectItem value="equipment_damage">Equipment Damage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what happened, what needs to be fixed, and any other relevant details..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about the incident for tracking and resolution
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormDescription>
                        Cost of repairs, replacement, or additional labor required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resolved"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Resolved</FormLabel>
                        <FormDescription>
                          Mark as resolved if the issue has been fixed
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
                    Record Incident
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {incidents && incidents.length > 0 ? (
          incidents.map((incident: any) => (
            <Card key={incident.id} className={`${getIncidentColor(incident.type)} transition-all hover:shadow-md`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getIncidentIcon(incident.type)}
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {incident.type.replace('_', ' ')}
                      </CardTitle>
                      <CardDescription>
                        {new Date(incident.createdAt).toLocaleDateString()} - 
                        Employee ID: {incident.employeeId?.slice(0, 8)}...
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {incident.cost > 0 && (
                      <Badge variant="outline" className="font-semibold">
                        ${Number(incident.cost).toFixed(2)}
                      </Badge>
                    )}
                    <Badge variant={incident.resolved ? "default" : "secondary"}>
                      {incident.resolved ? "Resolved" : "Open"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              {incident.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-semibold mb-2">No incidents reported</p>
              <p className="text-muted-foreground">Great job maintaining quality and safety standards!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}