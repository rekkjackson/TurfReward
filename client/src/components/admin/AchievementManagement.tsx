import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Zap, 
  DollarSign, 
  Calendar, 
  Shield, 
  Users,
  Star,
  Award,
  Target,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
  isActive: boolean;
  earnedCount: number;
}

const iconOptions = [
  { value: 'Trophy', label: 'Trophy', icon: Trophy },
  { value: 'Zap', label: 'Lightning', icon: Zap },
  { value: 'DollarSign', label: 'Dollar', icon: DollarSign },
  { value: 'Calendar', label: 'Calendar', icon: Calendar },
  { value: 'Shield', label: 'Shield', icon: Shield },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Star', label: 'Star', icon: Star },
  { value: 'Award', label: 'Award', icon: Award },
  { value: 'Target', label: 'Target', icon: Target },
  { value: 'Clock', label: 'Clock', icon: Clock },
  { value: 'CheckCircle', label: 'Check Circle', icon: CheckCircle },
  { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
];

const colorOptions = [
  { value: 'bg-yellow-500', label: 'Gold', color: 'bg-yellow-500' },
  { value: 'bg-blue-500', label: 'Blue', color: 'bg-blue-500' },
  { value: 'bg-green-500', label: 'Green', color: 'bg-green-500' },
  { value: 'bg-purple-500', label: 'Purple', color: 'bg-purple-500' },
  { value: 'bg-red-500', label: 'Red', color: 'bg-red-500' },
  { value: 'bg-emerald-500', label: 'Emerald', color: 'bg-emerald-500' },
  { value: 'bg-orange-500', label: 'Orange', color: 'bg-orange-500' },
  { value: 'bg-pink-500', label: 'Pink', color: 'bg-pink-500' },
];

const criteriaTemplates = [
  { 
    value: 'efficiency_threshold', 
    label: 'Efficiency Threshold',
    description: 'Achievement earned when efficiency reaches a certain percentage'
  },
  { 
    value: 'revenue_milestone', 
    label: 'Revenue Milestone',
    description: 'Achievement earned when P4P earnings reach a certain amount'
  },
  { 
    value: 'work_days', 
    label: 'Work Days',
    description: 'Achievement earned when working a certain number of days'
  },
  { 
    value: 'leadership_roles', 
    label: 'Leadership Roles',
    description: 'Achievement earned when leading a certain number of jobs'
  },
  { 
    value: 'safety_streak', 
    label: 'Safety Streak',
    description: 'Achievement earned for incident-free periods'
  },
  { 
    value: 'custom', 
    label: 'Custom Criteria',
    description: 'Define your own achievement criteria'
  }
];

export function AchievementManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    icon: 'Trophy',
    color: 'bg-yellow-500',
    criteria: 'efficiency_threshold',
    threshold: '150',
    customCriteria: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['/api/achievement-configs'],
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/achievement-configs', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievement-configs'] });
      toast({ title: "Achievement created successfully!" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create achievement", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/achievement-configs/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievement-configs'] });
      toast({ title: "Achievement updated successfully!" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update achievement", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/achievement-configs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievement-configs'] });
      toast({ title: "Achievement deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete achievement", variant: "destructive" });
    }
  });

  const processAchievements = useMutation({
    mutationFn: () => apiRequest('/api/achievements/process', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      toast({ title: "Achievements processed successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to process achievements", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      type: '',
      title: '',
      description: '',
      icon: 'Trophy',
      color: 'bg-yellow-500',
      criteria: 'efficiency_threshold',
      threshold: '150',
      customCriteria: ''
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const achievementData = {
      type: formData.type || formData.title.toLowerCase().replace(/\s+/g, '_'),
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      criteria: formData.criteria === 'custom' ? formData.customCriteria : formData.criteria,
      threshold: parseFloat(formData.threshold) || 0,
      isActive: true
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: achievementData });
    } else {
      createMutation.mutate(achievementData);
    }
  };

  const startEdit = (achievement: Achievement) => {
    setFormData({
      type: achievement.type,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      color: achievement.color,
      criteria: achievement.criteria,
      threshold: '150',
      customCriteria: achievement.criteria
    });
    setEditingId(achievement.id);
    setIsCreating(true);
  };

  const IconComponent = iconOptions.find(opt => opt.value === formData.icon)?.icon || Trophy;
  const selectedColor = colorOptions.find(opt => opt.value === formData.color);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievement Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Achievement Management</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={() => processAchievements.mutate()}
                disabled={processAchievements.isPending}
                variant="outline"
                size="sm"
              >
                Process Weekly Achievements
              </Button>
              <Button onClick={() => setIsCreating(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Achievement
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Achievement Form */}
          {isCreating && (
            <Card className="mb-6 border-primary/20">
              <CardHeader>
                <CardTitle>{editingId ? 'Edit Achievement' : 'Create New Achievement'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Achievement Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Speed Demon"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type (auto-generated)</Label>
                      <Input
                        id="type"
                        value={formData.type || formData.title.toLowerCase().replace(/\s+/g, '_')}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="speed_demon"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., Complete 10 jobs in record time"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="icon">Icon</Label>
                      <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-4 h-4" />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-4 h-4 rounded-full ${option.color}`}></div>
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Preview</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`p-2 rounded-full ${formData.color}`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{formData.title || 'Preview'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="criteria">Achievement Criteria</Label>
                    <Select value={formData.criteria} onValueChange={(value) => setFormData({ ...formData, criteria: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {criteriaTemplates.map((template) => (
                          <SelectItem key={template.value} value={template.value}>
                            <div>
                              <div className="font-medium">{template.label}</div>
                              <div className="text-xs text-gray-500">{template.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.criteria !== 'custom' && formData.criteria !== 'safety_streak' && (
                    <div>
                      <Label htmlFor="threshold">Threshold Value</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={formData.threshold}
                        onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                        placeholder="e.g., 150 for 150% efficiency"
                      />
                    </div>
                  )}

                  {formData.criteria === 'custom' && (
                    <div>
                      <Label htmlFor="customCriteria">Custom Criteria</Label>
                      <Textarea
                        id="customCriteria"
                        value={formData.customCriteria}
                        onChange={(e) => setFormData({ ...formData, customCriteria: e.target.value })}
                        placeholder="Describe your custom achievement criteria..."
                      />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingId ? 'Update Achievement' : 'Create Achievement'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Achievements List */}
          <div className="space-y-4">
            {achievements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No custom achievements created yet</p>
                <p className="text-sm">Create your first achievement to motivate your team!</p>
              </div>
            ) : (
              achievements.map((achievement: Achievement) => {
                const IconComponent = iconOptions.find(opt => opt.value === achievement.icon)?.icon || Trophy;
                
                return (
                  <Card key={achievement.id} className="border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${achievement.color}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{achievement.title}</h3>
                            <p className="text-sm text-gray-400">{achievement.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {achievement.type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Earned {achievement.earnedCount || 0} times
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(achievement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(achievement.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}