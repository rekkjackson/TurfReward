import { motion } from 'framer-motion';

interface RevenueThermometerProps {
  current: number;
  goal: number;
}

export function RevenueThermometer({ current, goal }: RevenueThermometerProps) {
  const percentage = Math.min(100, (current / goal) * 100);
  const remaining = Math.max(0, goal - current);

  return (
    <div className="col-span-3 row-span-4 bg-slate-medium rounded-lg p-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-2">Daily Revenue</h2>
        <div className="text-3xl font-black metric-number">
          ${current.toLocaleString()}
        </div>
        <div className="text-sm text-gray-400">
          Goal: ${goal.toLocaleString()}
        </div>
      </div>
      
      {/* Thermometer Visual */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Thermometer Container */}
          <div className="w-16 h-64 bg-slate-light rounded-full relative overflow-hidden">
            {/* Fill Level */}
            <motion.div 
              className="absolute bottom-0 w-full rounded-full thermometer-fill"
              initial={{ height: '0%' }}
              animate={{ height: `${percentage}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </div>
          
          {/* Thermometer Bulb */}
          <motion.div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-success rounded-full glow-effect"
            animate={percentage >= 90 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: percentage >= 90 ? Infinity : 0 }}
          />
          
          {/* Scale Markers */}
          <div className="absolute right-20 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
            <span>${(goal / 1000).toFixed(0)}k</span>
            <span>${(goal * 0.75 / 1000).toFixed(0)}k</span>
            <span>${(goal * 0.5 / 1000).toFixed(0)}k</span>
            <span>${(goal * 0.25 / 1000).toFixed(0)}k</span>
            <span>$0</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold text-success">
          {percentage.toFixed(1)}% Complete
        </div>
        <div className="text-xs text-gray-400 mt-1">
          ${remaining.toLocaleString()} to goal
        </div>
      </div>
    </div>
  );
}
