import { motion } from 'framer-motion';
import { Wrench, Trees, Home, Trash2 } from 'lucide-react';

interface WorkTypeBreakdownProps {
  maintenance: {
    jobs: number;
    revenue: number;
    efficiency: number;
  };
  landscaping: {
    jobs: number;
    revenue: number;
    efficiency: number;
  };
  mowing: {
    jobs: number;
    revenue: number;
    efficiency: number;
  };
  cleanup: {
    jobs: number;
    revenue: number;
    efficiency: number;
  };
}

export function WorkTypeBreakdown({ maintenance, landscaping, mowing, cleanup }: WorkTypeBreakdownProps) {
  const workTypes = [
    {
      name: "Maintenance",
      data: maintenance,
      icon: Wrench,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20"
    },
    {
      name: "Landscaping", 
      data: landscaping,
      icon: Trees,
      color: "text-green-400",
      bgColor: "bg-green-400/20"
    },
    {
      name: "Mowing",
      data: mowing,
      icon: Home,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/20"
    },
    {
      name: "Cleanup",
      data: cleanup,
      icon: Trash2,
      color: "text-orange-400",
      bgColor: "bg-orange-400/20"
    }
  ];

  const totalJobs = workTypes.reduce((sum, type) => sum + type.data.jobs, 0);
  const totalRevenue = workTypes.reduce((sum, type) => sum + type.data.revenue, 0);

  return (
    <div className="bg-slate-light rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Work Type Breakdown</h3>
        <div className="text-right">
          <div className="text-sm text-gray-400">Total Revenue</div>
          <div className="text-xl font-bold text-white">${totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {workTypes.map((type, index) => {
          const jobPercentage = totalJobs > 0 ? (type.data.jobs / totalJobs) * 100 : 0;
          const revenuePercentage = totalRevenue > 0 ? (type.data.revenue / totalRevenue) * 100 : 0;
          
          return (
            <motion.div
              key={type.name}
              className="p-4 border border-gray-600 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${type.bgColor}`}>
                    <type.icon className={`w-4 h-4 ${type.color}`} />
                  </div>
                  <span className="font-semibold text-white">{type.name}</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  type.data.efficiency >= 100 ? 'bg-success/20 text-success' :
                  type.data.efficiency >= 85 ? 'bg-warning/20 text-warning' :
                  'bg-danger/20 text-danger'
                }`}>
                  {type.data.efficiency.toFixed(0)}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Jobs</span>
                  <span className="text-white font-semibold">{type.data.jobs}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Revenue</span>
                  <span className="text-white font-semibold">${type.data.revenue.toLocaleString()}</span>
                </div>

                {/* Revenue percentage bar */}
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${type.color.replace('text-', 'bg-')}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${revenuePercentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  {revenuePercentage.toFixed(1)}% of total revenue
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}