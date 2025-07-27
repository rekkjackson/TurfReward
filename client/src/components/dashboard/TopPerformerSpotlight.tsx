import { Trophy, TrendingUp, Star, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopPerformerSpotlightProps {
  performer: {
    id: string;
    name: string;
    position: string;
    efficiency: number;
    hoursWorked?: number;
    performancePay?: number;
    weeklyRevenue?: number;
    hourlyRate?: number;
    photo?: string;
  } | null;
  teamStats: {
    totalEmployees: number;
    averageEfficiency: number;
    topQuartileThreshold: number;
  };
}

export function TopPerformerSpotlight({ performer, teamStats }: TopPerformerSpotlightProps) {
  if (!performer) {
    return (
      <div className="bg-slate-light rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-400">Team Performance</h3>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Team Members</span>
              <span className="text-white font-semibold">{teamStats.totalEmployees}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Average Efficiency</span>
              <span className="text-white font-semibold">{teamStats.averageEfficiency.toFixed(1)}%</span>
            </div>
            <div className="text-xs text-gray-500 mt-3">
              Complete jobs to see individual performance leaders
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-light rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span>Top Performer</span>
        </h3>
        <div className="text-xs px-2 py-1 bg-success/20 text-success rounded-full">
          Company Leader
        </div>
      </div>
      
      {/* Top Performer Card */}
      <motion.div 
        className="bg-gradient-to-br from-success/20 to-primary/20 rounded-lg p-4 border border-success/30"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-success/30 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{performer.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-white">{performer.name}</div>
            <div className="text-sm text-gray-300">{performer.position}</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Efficiency</span>
              <span className="text-white font-semibold">{performer.efficiency.toFixed(1)}%</span>
            </div>
            {performer.hoursWorked && (
              <div className="flex justify-between">
                <span className="text-gray-400">Hours</span>
                <span className="text-white font-semibold">{performer.hoursWorked}h</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {performer.performancePay && (
              <div className="flex justify-between">
                <span className="text-gray-400">P4P Rate</span>
                <span className="text-success font-semibold">${performer.performancePay.toFixed(0)}</span>
              </div>
            )}
            {performer.weeklyRevenue && (
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue</span>
                <span className="text-white font-semibold">${performer.weeklyRevenue.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Team Context */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Leading team of {teamStats.totalEmployees} members
      </div>
    </div>
  );
}