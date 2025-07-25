import { CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface EfficiencyOverviewProps {
  mowingAverage: number;
  overallEfficiency: number;
  qualityScore: number;
}

export function EfficiencyOverview({ 
  mowingAverage, 
  overallEfficiency, 
  qualityScore 
}: EfficiencyOverviewProps) {
  const getEfficiencyColor = (score: number, target: number) => {
    if (score >= target) return 'from-success to-emerald-600';
    if (score >= target * 0.8) return 'from-warning to-orange-600';
    return 'from-danger to-red-600';
  };

  const getStatusIcon = (score: number, target: number) => {
    if (score >= target) return <CheckCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getStatusText = (score: number, target: number) => {
    if (score >= target) return 'Above Target';
    return 'Below Target';
  };

  const getStatusColor = (score: number, target: number) => {
    return score >= target ? 'text-success' : 'text-warning';
  };

  return (
    <div className="col-span-5 row-span-2 bg-slate-medium rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Company-Wide Efficiency</h2>
      <div className="grid grid-cols-3 gap-4">
        {/* Mowing Efficiency */}
        <div className="text-center">
          <div className="relative mb-3">
            <motion.div 
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br ${getEfficiencyColor(mowingAverage, 3.0)} ${mowingAverage >= 3.0 ? 'glow-effect' : ''}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="text-2xl font-black text-white">{mowingAverage.toFixed(1)}</span>
            </motion.div>
          </div>
          <div className="text-sm font-semibold">Mowing Avg</div>
          <div className="text-xs text-gray-400">Target: 3.0+</div>
          <div className={`text-xs mt-1 ${getStatusColor(mowingAverage, 3.0)}`}>
            {getStatusIcon(mowingAverage, 3.0)}
            <span className="ml-1">{getStatusText(mowingAverage, 3.0)}</span>
          </div>
        </div>
        
        {/* Overall Efficiency */}
        <div className="text-center">
          <div className="relative mb-3">
            <motion.div 
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br ${getEfficiencyColor(overallEfficiency, 75)} ${overallEfficiency >= 75 ? 'glow-effect' : ''}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="text-2xl font-black text-white">{Math.round(overallEfficiency)}%</span>
            </motion.div>
          </div>
          <div className="text-sm font-semibold">Overall</div>
          <div className="text-xs text-gray-400">Target: 75%+</div>
          <div className={`text-xs mt-1 ${getStatusColor(overallEfficiency, 75)}`}>
            {getStatusIcon(overallEfficiency, 75)}
            <span className="ml-1">{getStatusText(overallEfficiency, 75)}</span>
          </div>
        </div>
        
        {/* Quality Score */}
        <div className="text-center">
          <div className="relative mb-3">
            <motion.div 
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br ${getEfficiencyColor(qualityScore, 4.5)} glow-effect`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="text-2xl font-black text-white">{qualityScore.toFixed(1)}</span>
            </motion.div>
          </div>
          <div className="text-sm font-semibold">Quality</div>
          <div className="text-xs text-gray-400">Out of 5.0</div>
          <div className="text-xs text-success mt-1">
            <Star className="inline w-4 h-4" />
            <span className="ml-1">Excellent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
