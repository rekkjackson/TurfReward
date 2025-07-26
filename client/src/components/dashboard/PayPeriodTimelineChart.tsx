import { motion } from 'framer-motion';
import { getCurrentPayPeriod, getPreviousPayPeriod, getNextPayPeriod } from '@shared/payPeriodUtils';

interface PayPeriodTimelineChartProps {
  className?: string;
}

export function PayPeriodTimelineChart({ className = "" }: PayPeriodTimelineChartProps) {
  const previousPeriod = getPreviousPayPeriod();
  const currentPeriod = getCurrentPayPeriod();
  const nextPeriod = getNextPayPeriod();
  
  const now = new Date();
  const currentProgress = Math.min(100, Math.max(0, 
    ((now.getTime() - currentPeriod.start.getTime()) / 
     (currentPeriod.end.getTime() - currentPeriod.start.getTime())) * 100
  ));

  const periods = [
    { period: previousPeriod, label: 'Previous', status: 'completed', progress: 100 },
    { period: currentPeriod, label: 'Current', status: 'active', progress: currentProgress },
    { period: nextPeriod, label: 'Next', status: 'upcoming', progress: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'active': return 'bg-primary';
      case 'upcoming': return 'bg-slate-600';
      default: return 'bg-slate-600';
    }
  };

  const formatDateRange = (period: any) => {
    const start = period.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = period.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <div className={`bg-slate-light rounded-lg p-4 ${className}`}>
      <div className="text-sm font-medium text-white mb-4">Pay Period Timeline</div>
      
      <div className="space-y-3">
        {periods.map((item, index) => (
          <motion.div
            key={index}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              {/* Status Indicator */}
              <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)} flex-shrink-0`}>
                {item.status === 'active' && (
                  <motion.div
                    className="w-full h-full rounded-full bg-white"
                    animate={{ scale: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </div>
              
              {/* Period Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white font-medium">{item.label} Period</span>
                  {item.status === 'active' && (
                    <span className="text-xs text-primary font-medium">
                      {item.progress.toFixed(0)}% Complete
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {formatDateRange(item.period)} • {item.period.periodType}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-medium rounded-full h-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full ${getStatusColor(item.status)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < periods.length - 1 && (
              <div className="absolute left-1.5 top-6 w-px h-6 bg-slate-600 transform -translate-x-0.5" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}