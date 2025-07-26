import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { getCurrentPayPeriod } from '@shared/payPeriodUtils';
import { RevenueThermometer } from '@/components/dashboard/RevenueThermometer';
import { JobCounters } from '@/components/dashboard/JobCounters';
import { EfficiencyOverview } from '@/components/dashboard/EfficiencyOverview';
import { TopPerformerSpotlight } from '@/components/dashboard/TopPerformerSpotlight';
import { EmployeePerformanceGrid } from '@/components/dashboard/EmployeePerformanceGrid';
import { GoalsMetricsZone } from '@/components/dashboard/GoalsMetricsZone';
import { DamageCasesTracker } from '@/components/dashboard/DamageCasesTracker';
import { PayPeriodVisualization } from '@/components/dashboard/PayPeriodVisualization';
import { CompactPayPeriodWidget } from '@/components/dashboard/CompactPayPeriodWidget';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Loader2, WifiOff, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data, isLoading, error, isConnected } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-success mx-auto mb-4" />
          <p className="text-xl text-white">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-danger text-6xl mb-4">⚠️</div>
          <p className="text-xl text-white mb-2">Failed to load dashboard data</p>
          <p className="text-gray-400">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-xl text-white">No dashboard data available</p>
        </div>
      </div>
    );
  }

  // Safely extract data with defaults
  const todayMetrics = data?.todayMetrics;
  const topPerformer = data?.topPerformer;
  const employeePerformance = data?.employeePerformance || [];
  const weeklyRevenue = data?.weeklyRevenue || { current: 0, target: 40000 };
  const yellowSlipCount = data?.yellowSlipCount || 0;
  const customerSatisfaction = data?.customerSatisfaction || 4.5;
  const damageCases = data?.damageCases || {
    yellowSlipCount: 0,
    propertyCasualties: 0,
    equipmentDamage: 0,
    totalCost: 0,
    weeklyTrend: 0
  };

  return (
    <div className="bg-slate-dark font-inter text-white min-h-screen overflow-hidden">
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed top-4 right-4 z-50 bg-warning text-black px-3 py-1 rounded-full text-sm flex items-center space-x-2">
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </div>
      )}
      
      {/* Admin Panel Access */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="bg-slate-medium/80 backdrop-blur border-slate-light hover:bg-slate-light">
            <Settings className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        </Link>
      </div>
      
      <div className="h-screen p-4 grid grid-cols-12 grid-rows-8 gap-4">
        {/* Row 1: Header - spans full width */}
        <DashboardHeader
          weatherCondition={todayMetrics?.weatherCondition}
          weatherTemperature={todayMetrics?.weatherTemperature}
        />

        {/* Row 2-3: Main metrics section */}
        <RevenueThermometer
          current={Number(todayMetrics?.dailyRevenue || 0)}
          goal={Number(todayMetrics?.dailyRevenueGoal || 6500)}
        />

        <JobCounters
          mowingCompleted={todayMetrics?.mowingJobsCompleted || 0}
          landscapingCompleted={todayMetrics?.landscapingJobsCompleted || 0}
          dailyGoalProgress={Math.round(
            ((todayMetrics?.mowingJobsCompleted || 0) + (todayMetrics?.landscapingJobsCompleted || 0)) / 30 * 100
          )}
        />

        <EfficiencyOverview
          mowingAverage={Number(todayMetrics?.mowingAverageEfficiency || 0)}
          overallEfficiency={Number(todayMetrics?.overallEfficiency || 0)}
          qualityScore={Number(todayMetrics?.averageQualityScore || 5.0)}
        />

        {/* Row 4-6: Performance section */}
        <TopPerformerSpotlight performer={topPerformer} />

        <EmployeePerformanceGrid employees={employeePerformance} />

        {/* Row 4-5: Pay Period tracking */}
        <CompactPayPeriodWidget />

        {/* Row 6-7: Bottom section */}
        <DamageCasesTracker
          yellowSlipCount={damageCases.yellowSlipCount}
          propertyCasualties={damageCases.propertyCasualties}
          equipmentDamage={damageCases.equipmentDamage}
          totalCost={damageCases.totalCost}
          weeklyTrend={damageCases.weeklyTrend}
        />

        {/* Row 8: Goals footer */}
        <GoalsMetricsZone
          weeklyRevenue={weeklyRevenue}
          yellowSlipCount={yellowSlipCount}
          customerSatisfaction={customerSatisfaction}
        />
      </div>
    </div>
  );
}
