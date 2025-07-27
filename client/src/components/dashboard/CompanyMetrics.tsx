import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, FileText, CheckCircle, Star } from 'lucide-react';

interface CompanyMetricsProps {
  yellowSlips: number;
  damageCases: number;
  reviews: number;
  estimates: number;
  completedJobs: number;
  averageRating: number;
}

export function CompanyMetrics({ 
  yellowSlips, 
  damageCases, 
  reviews, 
  estimates, 
  completedJobs,
  averageRating 
}: CompanyMetricsProps) {
  const metrics = [
    {
      title: "Yellow Slips",
      value: yellowSlips,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/20",
      trend: yellowSlips === 0 ? "success" : "warning"
    },
    {
      title: "Damage Cases",
      value: damageCases,
      icon: AlertTriangle,
      color: "text-danger",
      bgColor: "bg-danger/20", 
      trend: damageCases === 0 ? "success" : "danger"
    },
    {
      title: "Reviews",
      value: reviews,
      icon: Star,
      color: "text-primary",
      bgColor: "bg-primary/20",
      trend: "neutral",
      subtitle: `${averageRating.toFixed(1)} avg rating`
    },
    {
      title: "Estimates",
      value: estimates,
      icon: FileText,
      color: "text-info",
      bgColor: "bg-info/20",
      trend: "neutral"
    },
    {
      title: "Jobs Completed",
      value: completedJobs,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/20",
      trend: "success"
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          className="bg-slate-light rounded-xl p-4 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              metric.trend === 'success' ? 'bg-success/20 text-success' :
              metric.trend === 'warning' ? 'bg-warning/20 text-warning' :
              metric.trend === 'danger' ? 'bg-danger/20 text-danger' :
              'bg-gray-700 text-gray-400'
            }`}>
              {metric.trend === 'success' ? 'Good' :
               metric.trend === 'warning' ? 'Watch' :
               metric.trend === 'danger' ? 'Alert' : 'Track'}
            </div>
          </div>
          
          <div className="text-2xl font-bold text-white mb-1">
            {metric.value}
          </div>
          
          <div className="text-xs text-gray-400">
            {metric.title}
          </div>
          
          {metric.subtitle && (
            <div className="text-xs text-gray-500 mt-1">
              {metric.subtitle}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}