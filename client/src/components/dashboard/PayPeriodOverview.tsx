import { useState } from 'react';
import { Calendar, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getCurrentPayPeriod, getPreviousPayPeriod, getWorkingDaysInPeriod, type PayPeriod } from '@shared/payPeriodUtils';
import { motion } from 'framer-motion';

interface PayPeriodOverviewData {
  currentHours: number;
  targetHours: number;
  performancePay: number;
  minimumWage: number;
  weeklyEfficiency: number;
  daysRemaining: number;
}

interface PayPeriodOverviewProps {
  data?: PayPeriodOverviewData;
}

export function PayPeriodOverview({ data }: PayPeriodOverviewProps) {
  const [currentPeriod] = useState(getCurrentPayPeriod());
  const [previousPeriod] = useState(getPreviousPayPeriod());
  
  const workingDaysInPeriod = getWorkingDaysInPeriod(currentPeriod);
  const daysElapsed = Math.floor((new Date().getTime() - currentPeriod.start.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, workingDaysInPeriod - daysElapsed);
  
  const progressPercent = daysElapsed > 0 ? Math.min(100, (daysElapsed / workingDaysInPeriod) * 100) : 0;
  
  // Mock data if not provided
  const mockData: PayPeriodOverviewData = {
    currentHours: 85.5,
    targetHours: 120,
    performancePay: 1250.00,
    minimumWage: 1440.00,
    weeklyEfficiency: 87.5,
    daysRemaining: daysRemaining
  };
  
  const periodData = data || mockData;
  const isPerformancePayout = periodData.performancePay > periodData.minimumWage;

  return (
    <div className="col-span-6 row-span-2 space-y-4">
      {/* Pay Period Header */}
      <Card className="bg-slate-medium border-slate-light">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Current Pay Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Period</div>
              <div className="font-semibold text-white">{currentPeriod.periodName}</div>
              <div className="text-xs text-gray-500">
                <span className={`px-2 py-1 rounded text-xs ${
                  currentPeriod.periodType === '11-25' ? 'bg-blue-600' : 'bg-green-600'
                }`}>
                  {currentPeriod.periodType}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Progress</div>
              <Progress value={progressPercent} className="mb-2" />
              <div className="text-xs text-gray-400">
                {daysElapsed} of {workingDaysInPeriod} working days • {daysRemaining} remaining
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Pay Status */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-medium border-slate-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Hours Worked</div>
                <div className="text-2xl font-bold text-white">
                  {periodData.currentHours}
                </div>
                <div className="text-xs text-gray-500">
                  Target: {periodData.targetHours}h
                </div>
              </div>
              <Clock className="w-8 h-8 text-primary opacity-50" />
            </div>
            <Progress 
              value={(periodData.currentHours / periodData.targetHours) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-medium border-slate-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Pay Status</div>
                <div className={`text-2xl font-bold ${isPerformancePayout ? 'text-success' : 'text-warning'}`}>
                  ${Math.max(periodData.performancePay, periodData.minimumWage).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {isPerformancePayout ? 'Performance Pay' : 'Minimum Wage'}
                </div>
              </div>
              <DollarSign className={`w-8 h-8 opacity-50 ${isPerformancePayout ? 'text-success' : 'text-warning'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Trend */}
      <Card className="bg-slate-medium border-slate-light">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-400">Period Efficiency</div>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-white">
              {periodData.weeklyEfficiency}%
            </div>
            <div className="text-sm text-success">+2.3%</div>
          </div>
          <Progress value={periodData.weeklyEfficiency} className="mt-2" />
          <div className="text-xs text-gray-500 mt-1">
            Target: 75% efficiency
          </div>
        </CardContent>
      </Card>
    </div>
  );
}