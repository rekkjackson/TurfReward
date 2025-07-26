import { DollarSign, AlertTriangle, Heart, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface GoalsMetricsZoneProps {
  weeklyRevenue: { current: number; target: number };
  yellowSlipCount: number;
  customerSatisfaction: number;
  profitSharingProgress?: number;
  yellowSlipChange?: number;
}

export function GoalsMetricsZone({ 
  weeklyRevenue, 
  yellowSlipCount, 
  customerSatisfaction,
  profitSharingProgress = 65,
  yellowSlipChange = -2
}: GoalsMetricsZoneProps) {
  const weeklyRevenuePercent = Math.min(100, (weeklyRevenue.current / weeklyRevenue.target) * 100);
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.1 + 0.5 }}
      >
        <i className={`fas fa-star ${i < Math.floor(rating) ? 'text-warning' : 'text-gray-600'} text-xs`} />
      </motion.div>
    ));
  };

  return (
    <div className="h-full grid grid-cols-4 gap-4">
      {/* Weekly Revenue Goal */}
      <motion.div
        className="bg-slate-medium rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Weekly Revenue</h3>
          <DollarSign className="text-success w-4 h-4" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="w-full bg-slate-light rounded-full h-3">
              <motion.div
                className="bg-success h-3 rounded-full transition-all duration-1000"
                initial={{ width: '0%' }}
                animate={{ width: `${weeklyRevenuePercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
          <div className="text-right">
            <motion.div
              className="text-lg font-bold text-success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              ${weeklyRevenue.current.toLocaleString()}
            </motion.div>
            <div className="text-xs text-gray-400">
              / ${weeklyRevenue.target.toLocaleString()}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Yellow Slips Tracker */}
      <motion.div
        className="bg-slate-medium rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Yellow Slips</h3>
          <AlertTriangle className="text-warning w-4 h-4" />
        </div>
        <div className="flex items-center justify-between">
          <motion.div
            className="text-2xl font-bold text-warning"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {yellowSlipCount}
          </motion.div>
          <div className="text-right">
            <div className="text-sm text-gray-400">This Week</div>
            <div className={`text-xs flex items-center ${yellowSlipChange < 0 ? 'text-success' : 'text-danger'}`}>
              {yellowSlipChange < 0 ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <TrendingUp className="w-3 h-3 mr-1" />
              )}
              {yellowSlipChange > 0 ? '+' : ''}{yellowSlipChange} from last week
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Customer Satisfaction */}
      <motion.div
        className="bg-slate-medium rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Customer Satisfaction</h3>
          <Heart className="text-danger w-4 h-4" />
        </div>
        <div className="flex items-center justify-between">
          <motion.div
            className="text-2xl font-bold text-success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {customerSatisfaction.toFixed(1)}
          </motion.div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Average Rating</div>
            <div className="flex space-x-0.5">
              {renderStars(customerSatisfaction)}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Profit Sharing Progress */}
      <motion.div
        className="bg-slate-medium rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Q1 Profit Sharing</h3>
          <PiggyBank className="text-primary w-4 h-4" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="w-full bg-slate-light rounded-full h-3">
              <motion.div
                className="bg-primary h-3 rounded-full transition-all duration-1000"
                initial={{ width: '0%' }}
                animate={{ width: `${profitSharingProgress}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </div>
          <div className="text-right">
            <motion.div
              className="text-lg font-bold text-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              {profitSharingProgress}%
            </motion.div>
            <div className="text-xs text-gray-400">Quarter Progress</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
