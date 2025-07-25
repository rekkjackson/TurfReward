import { CheckCircle, AlertTriangle, GraduationCap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Employee {
  id: string;
  name: string;
  position: string;
  photo?: string;
  efficiency: number;
  performancePercent: number;
  status: string;
}

interface EmployeePerformanceGridProps {
  employees: Employee[];
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'excellent':
      return {
        color: 'bg-success',
        textColor: 'text-success',
        icon: <Star className="w-3 h-3" />,
        text: 'Excellent',
        barColor: 'bg-success'
      };
    case 'on-track':
      return {
        color: 'bg-success',
        textColor: 'text-success',
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'On Track',
        barColor: 'bg-success'
      };
    case 'needs-focus':
      return {
        color: 'bg-warning',
        textColor: 'text-warning',
        icon: <AlertTriangle className="w-3 h-3" />,
        text: 'Needs Focus',
        barColor: 'bg-warning'
      };
    case 'training':
      return {
        color: 'bg-primary',
        textColor: 'text-primary',
        icon: <GraduationCap className="w-3 h-3" />,
        text: 'Training',
        barColor: 'bg-primary'
      };
    default:
      return {
        color: 'bg-gray-500',
        textColor: 'text-gray-500',
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'Unknown',
        barColor: 'bg-gray-500'
      };
  }
};

const getDefaultPhoto = () => "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100";

export function EmployeePerformanceGrid({ employees }: EmployeePerformanceGridProps) {
  if (!employees || employees.length === 0) {
    return (
      <div className="col-span-8 row-span-3 bg-slate-medium rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Team Performance Overview</h2>
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No employee performance data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-8 row-span-3 bg-slate-medium rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Team Performance Overview</h2>
      
      <div className="grid grid-cols-4 gap-4">
        {employees.slice(0, 8).map((employee, index) => {
          const statusConfig = getStatusConfig(employee.status);
          
          return (
            <motion.div
              key={employee.id}
              className="performance-card bg-slate-light rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <div className="text-center">
                <motion.img
                  src={employee.photo || getDefaultPhoto()}
                  alt={`${employee.name} headshot`}
                  className="w-12 h-12 rounded-full mx-auto mb-2 object-cover border-2 border-gray-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                />
                <div className="text-sm font-semibold truncate">{employee.name}</div>
                <div className="text-xs text-gray-400 mb-2 truncate">{employee.position}</div>
                
                {/* Performance Indicator */}
                <div className="w-full bg-slate-dark rounded-full h-2 mb-2">
                  <motion.div
                    className={`h-2 rounded-full ${statusConfig.barColor}`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${employee.performancePercent}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </div>
                
                <motion.div
                  className={`text-lg font-bold ${statusConfig.textColor}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.7 }}
                >
                  {employee.efficiency.toFixed(1)}
                </motion.div>
                <div className="text-xs text-gray-400">Efficiency</div>
                
                {/* Status Badge */}
                <div className="mt-2">
                  <motion.span
                    className={`inline-flex items-center space-x-1 ${statusConfig.color} text-white text-xs px-2 py-1 rounded-full`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.9 }}
                  >
                    {statusConfig.icon}
                    <span>{statusConfig.text}</span>
                  </motion.span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
