import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface JobCountersProps {
  mowingCompleted: number;
  landscapingCompleted: number;
  dailyGoalProgress: number;
  mowingChange?: number;
  landscapingChange?: number;
}

export function JobCounters({ 
  mowingCompleted, 
  landscapingCompleted, 
  dailyGoalProgress,
  mowingChange = 0,
  landscapingChange = 0 
}: JobCountersProps) {
  return (
    <div className="col-span-4 row-span-2 bg-slate-medium rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Today's Job Completion</h2>
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          className="bg-slate-light rounded-lg p-4 text-center"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="text-3xl font-black metric-number mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {mowingCompleted}
          </motion.div>
          <div className="text-sm text-gray-400 mb-1">Mowing Routes</div>
          {mowingChange !== 0 && (
            <div className={`text-xs ${mowingChange > 0 ? 'text-success' : 'text-danger'}`}>
              <TrendingUp className="inline w-3 h-3 mr-1" />
              {mowingChange > 0 ? '+' : ''}{mowingChange} from yesterday
            </div>
          )}
        </motion.div>
        
        <motion.div 
          className="bg-slate-light rounded-lg p-4 text-center"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="text-3xl font-black text-primary mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {landscapingCompleted}
          </motion.div>
          <div className="text-sm text-gray-400 mb-1">Landscaping Jobs</div>
          {landscapingChange !== 0 && (
            <div className={`text-xs ${landscapingChange > 0 ? 'text-success' : 'text-danger'}`}>
              <TrendingUp className="inline w-3 h-3 mr-1" />
              {landscapingChange > 0 ? '+' : ''}{landscapingChange} from yesterday
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Progress to Daily Goal */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Daily Goal Progress</span>
          <span>{dailyGoalProgress}%</span>
        </div>
        <div className="w-full bg-slate-light rounded-full h-3">
          <motion.div 
            className="bg-success h-3 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${dailyGoalProgress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
