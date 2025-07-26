import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { PayPeriodProgressRing } from './PayPeriodProgressRing';
import { getCurrentPayPeriod, getWorkingDaysInPeriod } from '@shared/payPeriodUtils';
import { usePayPeriodData } from '@/hooks/usePayPeriodData';

export function CompactPayPeriodWidget() {
  const currentPeriod = getCurrentPayPeriod();
  const { data: payPeriodData } = usePayPeriodData();
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
    return type === '11-25' ? 'text-blue-400' : 'text-green-400';
  };

  return (
    <div className="h-full bg-slate-medium rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-white">Pay Period Progress</span>
      </div>

      <div className="flex items-center gap-4">
        <PayPeriodProgressRing
          progress={progress}
          size={60}
          strokeWidth={5}
          showPercentage={false}
          animate={true}
        />
        
        <div className="flex-1">
          <div className="text-lg font-bold text-white mb-1">
            {progress.toFixed(1)}% Complete
          </div>
          <div className="text-xs text-gray-400 mb-2">
            {formatDate(currentPeriod.start)} - {formatDate(currentPeriod.end)}
          </div>
          <div className={`text-xs font-medium ${getPeriodTypeColor(currentPeriod.periodType)}`}>
            Period {currentPeriod.periodType}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-primary">
            <Clock className="w-3 h-3" />
            <span className="text-sm font-semibold">{daysRemaining}</span>
          </div>
          <div className="text-xs text-gray-400">days left</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-light">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-white font-semibold">89.5h</div>
            <div className="text-gray-400">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-success font-semibold">87%</div>
            <div className="text-gray-400">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-warning font-semibold">$1.6k</div>
            <div className="text-gray-400">Projected</div>
          </div>
        </div>
      </div>
    </div>
  );
}