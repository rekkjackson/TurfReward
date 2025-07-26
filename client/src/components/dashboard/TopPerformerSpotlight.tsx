import { Trophy, Medal, Star, Clock, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopPerformerSpotlightProps {
  performer: {
    name: string;
    position: string;
    photo?: string;
    efficiency: number;
    weeklyRevenue: number;
  } | null;
}

export function TopPerformerSpotlight({ performer }: TopPerformerSpotlightProps) {
  if (!performer) {
    return (
      <div className="h-full bg-slate-medium rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Top Performer Spotlight</h2>
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No performance data available</p>
          </div>
        </div>
      </div>
    );
  }

  const defaultPhoto = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150";

  return (
    <div className="h-full bg-slate-medium rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Top Performer Spotlight</h2>
      
      {/* Top Performer Card */}
      <motion.div 
        className="bg-gradient-to-br from-success to-emerald-600 rounded-lg p-4 mb-4 glow-effect"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <motion.img 
            src={performer.photo || defaultPhoto}
            alt={`${performer.name} headshot`}
            className="w-16 h-16 rounded-full object-cover border-4 border-white"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <div>
            <div className="text-xl font-bold text-white">{performer.name}</div>
            <div className="text-sm text-green-100">{performer.position}</div>
            <motion.div 
              className="flex space-x-1 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Trophy className="text-yellow-300 w-4 h-4" />
              <Medal className="text-yellow-300 w-4 h-4" />
              <Star className="text-yellow-300 w-4 h-4" />
            </motion.div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <motion.div 
              className="text-2xl font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {performer.efficiency.toFixed(1)}
            </motion.div>
            <div className="text-xs text-green-100">Efficiency</div>
          </div>
          <div>
            <motion.div 
              className="text-2xl font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              ${performer.weeklyRevenue.toLocaleString()}
            </motion.div>
            <div className="text-xs text-green-100">This Week</div>
          </div>
        </div>
      </motion.div>
      
      {/* Achievement Badges */}
      <div className="space-y-2">
        <motion.div 
          className="flex items-center space-x-3 bg-slate-light rounded-lg p-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Clock className="text-primary text-lg" />
          <div>
            <div className="text-sm font-semibold">Zero Late Days</div>
            <div className="text-xs text-gray-400">Perfect attendance this month</div>
          </div>
        </motion.div>
        <motion.div 
          className="flex items-center space-x-3 bg-slate-light rounded-lg p-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Handshake className="text-warning text-lg" />
          <div>
            <div className="text-sm font-semibold">Customer Champion</div>
            <div className="text-xs text-gray-400">3 referrals this quarter</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
