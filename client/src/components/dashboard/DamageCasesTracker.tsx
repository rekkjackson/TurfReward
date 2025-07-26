import { AlertTriangle, Wrench, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface DamageCasesTrackerProps {
  yellowSlipCount: number;
  propertyCasualties: number;
  equipmentDamage: number;
  totalCost: number;
  weeklyTrend: number;
}

export function DamageCasesTracker({ 
  yellowSlipCount, 
  propertyCasualties,
  equipmentDamage,
  totalCost,
  weeklyTrend
}: DamageCasesTrackerProps) {
  const getStatusColor = (count: number, threshold: number) => {
    if (count === 0) return 'from-success to-emerald-600';
    if (count <= threshold) return 'from-warning to-orange-600';
    return 'from-danger to-red-600';
  };

  const getStatusLight = (count: number, threshold: number) => {
    if (count === 0) return 'bg-success glow-effect';
    if (count <= threshold) return 'bg-warning animate-pulse';
    return 'bg-danger animate-pulse';
  };

  return (
    <div className="h-full bg-slate-medium rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Damage Cases & Quality Issues</h2>
      
      {/* Traffic Light Status */}
      <div className="flex justify-center mb-4">
        <div className="flex flex-col items-center space-y-2">
          <div className={`w-6 h-6 rounded-full ${getStatusLight(yellowSlipCount + propertyCasualties + equipmentDamage, 3)}`} />
          <div className="text-xs text-gray-400">
            {yellowSlipCount + propertyCasualties + equipmentDamage === 0 ? 'All Clear' : 
             yellowSlipCount + propertyCasualties + equipmentDamage <= 3 ? 'Caution' : 'Alert'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Yellow Slips */}
        <motion.div 
          className="bg-slate-light rounded-lg p-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="text-warning w-5 h-5" />
              <div>
                <div className="text-sm font-semibold">Yellow Slips</div>
                <div className="text-xs text-gray-400">Quality rework required</div>
              </div>
            </div>
            <motion.div 
              className="text-2xl font-bold text-warning"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {yellowSlipCount}
            </motion.div>
          </div>
        </motion.div>

        {/* Property Damage */}
        <motion.div 
          className="bg-slate-light rounded-lg p-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-danger w-5 h-5" />
              <div>
                <div className="text-sm font-semibold">Property Damage</div>
                <div className="text-xs text-gray-400">Customer property</div>
              </div>
            </div>
            <motion.div 
              className="text-2xl font-bold text-danger"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {propertyCasualties}
            </motion.div>
          </div>
        </motion.div>

        {/* Equipment Issues */}
        <motion.div 
          className="bg-slate-light rounded-lg p-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wrench className="text-primary w-5 h-5" />
              <div>
                <div className="text-sm font-semibold">Equipment Damage</div>
                <div className="text-xs text-gray-400">Company equipment</div>
              </div>
            </div>
            <motion.div 
              className="text-2xl font-bold text-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              {equipmentDamage}
            </motion.div>
          </div>
        </motion.div>

        {/* Total Cost Impact */}
        <motion.div 
          className="bg-slate-light rounded-lg p-4 border-2 border-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Total Week Cost Impact</div>
            <motion.div 
              className="text-xl font-bold text-danger"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              ${totalCost.toLocaleString()}
            </motion.div>
            <div className={`text-xs mt-1 flex items-center justify-center ${weeklyTrend < 0 ? 'text-success' : 'text-danger'}`}>
              {weeklyTrend < 0 ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <TrendingUp className="w-3 h-3 mr-1" />
              )}
              {weeklyTrend > 0 ? '+' : ''}{weeklyTrend}% from last week
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}