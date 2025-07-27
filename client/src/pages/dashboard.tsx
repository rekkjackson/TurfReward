import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { getCurrentPayPeriod } from '@shared/payPeriodUtils';
import { MonthlyRevenueThermometer } from '@/components/dashboard/MonthlyRevenueThermometer';
import { CompanyMetrics } from '@/components/dashboard/CompanyMetrics';
import { WorkTypeBreakdown } from '@/components/dashboard/WorkTypeBreakdown';
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
      
      <div className="h-screen p-4 flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex-shrink-0">
          <DashboardHeader
            weatherCondition={todayMetrics?.weatherCondition}
            weatherTemperature={todayMetrics?.weatherTemperature}
          />
        </div>

        {/* Main Content - New Layout */}
        <div className="flex-1 space-y-6 overflow-y-auto min-h-0">
          {/* Monthly Revenue Thermometer */}
          <MonthlyRevenueThermometer 
            currentRevenue={todayMetrics?.monthlyRevenue || 0}
            monthlyGoal={todayMetrics?.monthlyRevenueGoal || 15000}
          />

          {/* Company Metrics Row */}
          <CompanyMetrics 
            yellowSlips={yellowSlipCount}
            damageCases={damageCases.propertyCasualties + damageCases.equipmentDamage}
            reviews={todayMetrics?.customerReviews || 0}
            estimates={todayMetrics?.estimatesCompleted || 0}
            completedJobs={(todayMetrics?.mowingJobsCompleted || 0) + (todayMetrics?.landscapingJobsCompleted || 0) + (todayMetrics?.maintenanceJobsCompleted || 0) + (todayMetrics?.cleanupJobsCompleted || 0)}
            averageRating={customerSatisfaction}
          />

          {/* Work Type Breakdown and Top Performer Row */}
          <div className="grid grid-cols-2 gap-6">
            <WorkTypeBreakdown 
              maintenance={{
                jobs: todayMetrics?.maintenanceJobsCompleted || 0,
                revenue: todayMetrics?.maintenanceRevenue || 0,
                efficiency: todayMetrics?.maintenanceEfficiency || 75
              }}
              landscaping={{
                jobs: todayMetrics?.landscapingJobsCompleted || 0,
                revenue: todayMetrics?.landscapingRevenue || 0,
                efficiency: todayMetrics?.landscapingEfficiency || 75
              }}
              mowing={{
                jobs: todayMetrics?.mowingJobsCompleted || 0,
                revenue: todayMetrics?.mowingRevenue || 0,
                efficiency: todayMetrics?.mowingAverageEfficiency || 75
              }}
              cleanup={{
                jobs: todayMetrics?.cleanupJobsCompleted || 0,
                revenue: todayMetrics?.cleanupRevenue || 0,
                efficiency: todayMetrics?.cleanupEfficiency || 75
              }}
            />
            
            <TopPerformerSpotlight 
              performer={topPerformer} 
              teamStats={{
                totalEmployees: employeePerformance.length,
                averageEfficiency: todayMetrics?.overallEfficiency || 75,
                topQuartileThreshold: 90
              }}
            />
          </div>

          {/* Employee Performance Grid */}
          <EmployeePerformanceGrid employees={employeePerformance} />
        </div>
      </div>
    </div>
  );
}
