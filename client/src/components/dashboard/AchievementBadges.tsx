import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  DollarSign, 
  Calendar, 
  Shield, 
  Users, 
  Trophy,
  Star,
  Award
} from 'lucide-react';

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  value: string;
  employee: {
    id: string;
    name: string;
    position: string;
  };
}

const iconMap = {
  Zap,
  DollarSign,
  Calendar,
  Shield,
  Users,
  Trophy,
  Star,
  Award
};

export function AchievementBadges() {
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['/api/achievements'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="w-24 h-4 bg-slate-700 rounded mb-1"></div>
                  <div className="w-32 h-3 bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Recent Achievements</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No achievements yet</p>
            <p className="text-sm">Complete jobs to earn badges!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.slice(0, 5).map((achievement: Achievement, index: number) => {
              const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${achievement.color}`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-white truncate">
                        {achievement.title}
                      </h4>
                      {achievement.value && achievement.value !== '0' && (
                        <Badge variant="secondary" className="text-xs">
                          {achievement.type === 'efficiency_master' && `${parseFloat(achievement.value).toFixed(0)}%`}
                          {achievement.type === 'revenue_champion' && `$${parseFloat(achievement.value).toFixed(0)}`}
                          {achievement.type === 'consistency_pro' && `${achievement.value} days`}
                          {achievement.type === 'team_leader' && `${achievement.value} jobs`}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 truncate">
                      {achievement.employee.name} • {achievement.description}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}