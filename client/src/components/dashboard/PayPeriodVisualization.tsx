import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, TrendingUp, DollarSign, Users, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PayPeriodProgressRing } from './PayPeriodProgressRing';
import { getCurrentPayPeriod, getPreviousPayPeriod, getNextPayPeriod, getWorkingDaysInPeriod, type PayPeriod } from '@shared/payPeriodUtils';
import { usePayPeriodData } from '@/hooks/usePayPeriodData';
import { cn } from '@/lib/utils';

interface PayPeriodData {
  hoursWorked: number;
  targetHours: number;
  performancePay: number;
  minimumPay: number;
  efficiency: number;
  jobsCompleted: number;
  revenueGenerated: number;
}

interface PayPeriodVisualizationProps {
  data?: PayPeriodData;
  className?: string;
}

export function PayPeriodVisualization({ data, className }: PayPeriodVisualizationProps) {
  const [currentPeriod] = useState(getCurrentPayPeriod());
  const [previousPeriod] = useState(getPreviousPayPeriod());
  const [nextPeriod] = useState(getNextPayPeriod());
  const [selectedPeriod, setSelectedPeriod] = useState<'previous' | 'current' | 'next'>('current');
  const [timeProgress, setTimeProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  
  const { data: payPeriodData, isConnected } = usePayPeriodData();

  // Calculate time-based progress
  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const total = currentPeriod.end.getTime() - currentPeriod.start.getTime();
      const elapsed = now.getTime() - currentPeriod.start.getTime();
      const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
      setTimeProgress(progress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000); // Update every minute
    
    // Stop animation after initial load
    const animationTimer = setTimeout(() => setIsAnimating(false), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(animationTimer);
    };
  }, [currentPeriod]);

  // Mock data for demonstration
  const mockData: PayPeriodData = {
    hoursWorked: 89.5,
    targetHours: 120,
    performancePay: 1485.50,
    minimumPay: 1612.00,
    efficiency: 87.2,
    jobsCompleted: 23,
    revenueGenerated: 4250.00
  };

  const periodData = data || mockData;
  const workingDays = getWorkingDaysInPeriod(currentPeriod);
  const daysElapsed = Math.floor((new Date().getTime() - currentPeriod.start.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, workingDays - daysElapsed);
  
  const hoursProgress = (periodData.hoursWorked / periodData.targetHours) * 100;
  const isPerformancePayout = periodData.performancePay > periodData.minimumPay;
  const dailyHoursAverage = daysElapsed > 0 ? periodData.hoursWorked / daysElapsed : 0;
  const projectedTotal = dailyHoursAverage * workingDays;

  const periods = [
    { key: 'previous' as const, period: previousPeriod, label: 'Previous' },
    { key: 'current' as const, period: currentPeriod, label: 'Current' },
    { key: 'next' as const, period: nextPeriod, label: 'Next' }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPeriodTypeColor = (type: string) => {
    return type === '11-25' ? 'bg-blue-600' : 'bg-green-600';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Period Selector */}
      <Card className="bg-slate-medium border-slate-light">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Pay Period Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {periods.map(({ key, period, label }) => (
              <motion.button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className={cn(
                  "p-3 rounded-lg text-left transition-all duration-200",
                  selectedPeriod === key
                    ? "bg-primary text-white shadow-lg"
                    : "bg-slate-light hover:bg-slate-light/80 text-gray-300"
                )}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs opacity-80">
                  {formatDate(period.start)} - {formatDate(period.end)}
                </div>
                <Badge 
                  className={cn("mt-1 text-xs", getPeriodTypeColor(period.periodType))}
                  variant="secondary"
                >
                  {period.periodType}
                </Badge>
              </motion.button>
            ))}
          </div>

          {/* Current Period Details */}
          <AnimatePresence mode="wait">
            {selectedPeriod === 'current' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Time Progress with Ring */}
                <div className="bg-slate-light rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Period Progress</span>
                    </div>
                    <motion.button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showDetails ? 'Less' : 'More'} Details
                    </motion.button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <PayPeriodProgressRing 
                      progress={timeProgress} 
                      size={80} 
                      strokeWidth={6}
                      animate={isAnimating}
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">
                        {daysRemaining} working days remaining
                      </div>
                      <Progress value={timeProgress} className="mb-2" />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{formatDate(currentPeriod.start)}</span>
                        <span>{formatDate(currentPeriod.end)}</span>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-medium pt-3 mt-3"
                      >
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-gray-400">Working Days</div>
                            <div className="text-white font-semibold">{workingDays} total</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Days Elapsed</div>
                            <div className="text-white font-semibold">{daysElapsed}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Weekend Days</div>
                            <div className="text-white font-semibold">
                              {Math.floor(((currentPeriod.end.getTime() - currentPeriod.start.getTime()) / (1000 * 60 * 60 * 24)) + 1) - workingDays}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Period Type</div>
                            <Badge className={cn("text-xs", getPeriodTypeColor(currentPeriod.periodType))}>
                              {currentPeriod.periodType}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Hours Worked */}
                  <motion.div 
                    className="bg-slate-light rounded-lg p-4"
                    initial={isAnimating ? { scale: 0.8, opacity: 0 } : {}}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-gray-400">
                        {hoursProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {periodData.hoursWorked}h
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Target: {periodData.targetHours}h
                    </div>
                    <Progress value={hoursProgress} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      Projected: {projectedTotal.toFixed(1)}h
                    </div>
                  </motion.div>

                  {/* Pay Status */}
                  <motion.div 
                    className="bg-slate-light rounded-lg p-4"
                    initial={isAnimating ? { scale: 0.8, opacity: 0 } : {}}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className={`w-4 h-4 ${isPerformancePayout ? 'text-success' : 'text-warning'}`} />
                      <Badge 
                        variant={isPerformancePayout ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isPerformancePayout ? 'Performance' : 'Minimum'}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${isPerformancePayout ? 'text-success' : 'text-warning'}`}>
                      ${Math.max(periodData.performancePay, periodData.minimumPay).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Min: ${periodData.minimumPay.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Performance: ${periodData.performancePay.toLocaleString()}
                    </div>
                  </motion.div>

                  {/* Efficiency */}
                  <motion.div 
                    className="bg-slate-light rounded-lg p-4"
                    initial={isAnimating ? { scale: 0.8, opacity: 0 } : {}}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-xs text-success">+3.2%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {periodData.efficiency}%
                    </div>
                    <div className="text-sm text-gray-400 mb-2">Efficiency</div>
                    <Progress value={periodData.efficiency} className="h-2" />
                  </motion.div>

                  {/* Jobs & Revenue */}
                  <motion.div 
                    className="bg-slate-light rounded-lg p-4"
                    initial={isAnimating ? { scale: 0.8, opacity: 0 } : {}}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-400">Jobs</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {periodData.jobsCompleted}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                      ${periodData.revenueGenerated.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg: ${(periodData.revenueGenerated / periodData.jobsCompleted).toFixed(0)}/job
                    </div>
                  </motion.div>
                </div>

                {/* Interactive Progress Summary */}
                <motion.div 
                  className="bg-primary/10 border border-primary/20 rounded-lg p-4 cursor-pointer hover:bg-primary/15 transition-colors"
                  initial={isAnimating ? { opacity: 0, y: 20 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <div className="text-sm text-primary">Period Summary</div>
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {timeProgress < 25 ? 'Early Period - Building Momentum' :
                       timeProgress < 50 ? 'Quarter Mark - Gaining Traction' :
                       timeProgress < 75 ? 'Mid Period - Steady Progress' :
                       timeProgress < 90 ? 'Final Sprint - Strong Finish!' :
                       'Period Complete - Excellent Work!'}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                      <div>
                        <div className="text-white font-semibold">{dailyHoursAverage.toFixed(1)}h</div>
                        <div>Daily average</div>
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          ${(periodData.revenueGenerated / Math.max(daysElapsed, 1)).toFixed(0)}
                        </div>
                        <div>Revenue/day</div>
                      </div>
                    </div>
                    
                    {/* Performance Indicators */}
                    <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-primary/20">
                      <div className={`flex items-center gap-1 ${hoursProgress >= 100 ? 'text-success' : hoursProgress >= 75 ? 'text-primary' : 'text-warning'}`}>
                        <Target className="w-3 h-3" />
                        <span className="text-xs font-medium">Hours: {hoursProgress.toFixed(0)}%</span>
                      </div>
                      <div className={`flex items-center gap-1 ${isPerformancePayout ? 'text-success' : 'text-warning'}`}>
                        <DollarSign className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {isPerformancePayout ? 'Performance Pay' : 'Minimum Wage'}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 ${periodData.efficiency >= 75 ? 'text-success' : 'text-warning'}`}>
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-medium">Efficiency: {periodData.efficiency}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}