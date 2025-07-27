import { motion } from 'framer-motion';
import { TrendingUp, Target } from 'lucide-react';

interface MonthlyRevenueThermometerProps {
  currentRevenue: number;
  monthlyGoal: number;
}

export function MonthlyRevenueThermometer({ currentRevenue, monthlyGoal }: MonthlyRevenueThermometerProps) {
  // Calculate cumulative monthly revenue (daily revenue * days passed)
  const daysInMonth = new Date().getDate();
  const cumulativeRevenue = currentRevenue * daysInMonth;
  const percentage = Math.min((cumulativeRevenue / monthlyGoal) * 100, 100);
  const totalDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const expectedPercentage = (daysInMonth / totalDaysInMonth) * 100;
  
  return (
    <div className="bg-slate-light rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Monthly Revenue Goal</span>
          </h3>
          <p className="text-gray-400 text-sm">
            {daysInMonth} of {totalDaysInMonth} days complete
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            ${cumulativeRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            of ${monthlyGoal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Thermometer */}
      <div className="relative">
        <div className="w-full h-8 bg-gray-700 rounded-full overflow-hidden">
          {/* Expected progress line */}
          <div 
            className="absolute top-0 h-full border-r-2 border-yellow-400 z-10"
            style={{ left: `${Math.min(expectedPercentage, 100)}%` }}
          />
          
          {/* Actual progress */}
          <motion.div
            className={`h-full rounded-full ${
              percentage >= expectedPercentage 
                ? 'bg-gradient-to-r from-green-500 to-primary' 
                : 'bg-gradient-to-r from-orange-500 to-warning'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>
        
        {/* Percentage indicator */}
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-gray-400">0%</span>
          <div className="text-center">
            <div className="font-bold text-white">{percentage.toFixed(1)}%</div>
            <div className={`text-xs ${
              percentage >= expectedPercentage ? 'text-success' : 'text-warning'
            }`}>
              {percentage >= expectedPercentage ? 'On Track' : 'Behind Schedule'}
            </div>
          </div>
          <span className="text-gray-400">100%</span>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex justify-between mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <span className="text-gray-400">Expected ({expectedPercentage.toFixed(1)}%)</span>
        </div>
        <div className="flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 text-primary" />
          <span className={percentage >= expectedPercentage ? 'text-success' : 'text-warning'}>
            {percentage >= expectedPercentage ? '+' : ''}{(percentage - expectedPercentage).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}