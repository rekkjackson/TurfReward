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
import { insertEmployeeSchema, type Employee } from '@shared/schema';
import { UserPlus, Edit, Eye } from 'lucide-react';

export function EmployeeManagement() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  const form = useForm({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: '',
      position: '',
      photo: '',
      isActive: true,
      baseHourlyRate: '18.00',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: 'Success', description: 'Employee created successfully' });
      form.reset();
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create employee', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PATCH', `/api/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: 'Success', description: 'Employee updated successfully' });
      setDialogOpen(false);
      setSelectedEmployee(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update employee', variant: 'destructive' });
    },
  });

  const onSubmit = (data: any) => {
    if (selectedEmployee) {
      updateMutation.mutate({ id: selectedEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    form.reset({
      name: employee.name,
      position: employee.position,
      photo: employee.photo || '',
      isActive: employee.isActive ?? true,
      baseHourlyRate: employee.baseHourlyRate,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedEmployee(null);
    form.reset();
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">Manage team members and their details</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
              <DialogDescription>
                {selectedEmployee 
                  ? 'Update employee information and settings' 
                  : 'Add a new team member to the P4P system'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Crew Leader">Crew Leader</SelectItem>
                          <SelectItem value="Lead Landscaper">Lead Landscaper</SelectItem>
                          <SelectItem value="Landscaper">Landscaper</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="New Hire">New Hire</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/photo.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL to employee photo for dashboard display
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseHourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormDescription>
                        Base pay rate (minimum $18/hr per P4P policy)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Employee</FormLabel>
                        <FormDescription>
                          Include this employee in dashboard and performance tracking
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
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {selectedEmployee ? 'Update Employee' : 'Create Employee'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees && employees.map((employee: Employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                {employee.photo ? (
                  <img
                    src={employee.photo}
                    alt={employee.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-semibold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <CardDescription>{employee.position}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base Rate:</span>
                  <span className="font-semibold">${employee.baseHourlyRate}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={employee.isActive ? "default" : "secondary"}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(employee)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
