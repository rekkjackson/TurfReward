import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { PayPeriodProgressRing } from './PayPeriodProgressRing';
import { getCurrentPayPeriod, getWorkingDaysInPeriod } from '@shared/payPeriodUtils';

interface PayPeriodMiniWidgetProps {
  className?: string;
  onClick?: () => void;
}

export function PayPeriodMiniWidget({ className = "", onClick }: PayPeriodMiniWidgetProps) {
  const currentPeriod = getCurrentPayPeriod();
  const now = new Date();
  
  // Calculate progress
  const total = currentPeriod.end.getTime() - currentPeriod.start.getTime();
  const elapsed = now.getTime() - currentPeriod.start.getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  
  const workingDays = getWorkingDaysInPeriod(currentPeriod);
  const daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, workingDays - daysElapsed);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPeriodTypeColor = (type: string) => {
    return type === '11-25' ? 'bg-blue-600' : 'bg-green-600';
  };

  return (
    <motion.div
      className={`bg-slate-medium rounded-lg p-4 cursor-pointer hover:bg-slate-light transition-colors ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white">Pay Period</span>
        </div>
        <div className={`px-2 py-1 rounded text-xs text-white ${getPeriodTypeColor(currentPeriod.periodType)}`}>
          {currentPeriod.periodType}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PayPeriodProgressRing
          progress={progress}
          size={50}
          strokeWidth={4}
          showPercentage={false}
          animate={false}
        />
        <div className="flex-1">
          <div className="text-white font-semibold text-sm mb-1">
            {progress.toFixed(0)}% Complete
          </div>
          <div className="text-xs text-gray-400 mb-1">
            {formatDate(currentPeriod.start)} - {formatDate(currentPeriod.end)}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{daysRemaining} days left</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}