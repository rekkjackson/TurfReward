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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertP4PConfigSchema, type P4PConfig } from '@shared/schema';

export function P4PConfigForm() {
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ['/api/p4p-configs'],
  });

  const form = useForm({
    resolver: zodResolver(insertP4PConfigSchema),
    defaultValues: {
      jobType: '',
      laborRevenuePercentage: '33.00',
      seasonalBonus: '7.00',
      minimumHourlyRate: '18.00',
      trainingBonusPerHour: '4.00',
      largejobBonusThreshold: 49,
      largejobBonusPerHour: '1.50',
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/p4p-configs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/p4p-configs'] });
      toast({ title: 'Success', description: 'P4P configuration created successfully' });
      form.reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create P4P configuration', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PATCH', `/api/p4p-configs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/p4p-configs'] });
      toast({ title: 'Success', description: 'P4P configuration updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update P4P configuration', variant: 'destructive' });
    },
  });

  const onSubmit = (data: any) => {
    if (selectedConfig) {
      updateMutation.mutate({ id: selectedConfig, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const loadConfig = (config: P4PConfig) => {
    setSelectedConfig(config.id);
    form.reset({
      jobType: config.jobType,
      laborRevenuePercentage: config.laborRevenuePercentage || '33.00',
      seasonalBonus: config.seasonalBonus || '0.00',
      minimumHourlyRate: config.minimumHourlyRate || '18.00',
      trainingBonusPerHour: config.trainingBonusPerHour,
      largejobBonusThreshold: config.largejobBonusThreshold || 49,
      largejobBonusPerHour: config.largejobBonusPerHour,
      isActive: config.isActive ?? true,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading configurations...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Existing Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Existing P4P Configurations</CardTitle>
          <CardDescription>
            View and edit current pay-for-performance settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs && configs.map((config: P4PConfig) => (
              <div
                key={config.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => loadConfig(config)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold capitalize">{config.jobType}</h3>
                    <p className="text-sm text-muted-foreground">
                      {config.laborRevenuePercentage}% labor revenue
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Min: ${config.minimumHourlyRate}/hr
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded text-xs ${
                      config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedConfig ? 'Edit Configuration' : 'Create New Configuration'}
          </CardTitle>
          <CardDescription>
            Configure pay-for-performance rates and bonuses based on the P4P document requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectItem value="mowing">Mowing/Maintenance Routes</SelectItem>
                        <SelectItem value="landscaping">Landscaping/Cleanups</SelectItem>
                        <SelectItem value="maintenance">Equipment Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="laborRevenuePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Revenue Percentage (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormDescription>
                      Base percentage of labor revenue paid to team (33% standard, 40% March-May)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seasonalBonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seasonal Bonus (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormDescription>
                      Additional percentage for March-May period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumHourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormDescription>
                      Guaranteed minimum pay per hour ($18/hr minimum)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trainingBonusPerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Bonus Per Hour ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormDescription>
                      Bonus paid when training new employees ($4/hr)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="largejobBonusThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Large Job Bonus Threshold (Hours)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>
                      Jobs at/over this many budgeted hours qualify for bonus (49 hours)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="largejobBonusPerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Large Job Bonus Per Hour ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormDescription>
                      Bonus per budgeted hour for large jobs ($1.50/hr)
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
                      <FormLabel className="text-base">Active Configuration</FormLabel>
                      <FormDescription>
                        Enable this P4P configuration for the selected job type
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

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {selectedConfig ? 'Update Configuration' : 'Create Configuration'}
                </Button>
                {selectedConfig && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedConfig('');
                      form.reset();
                    }}
                  >
                    Create New
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
