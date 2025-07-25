import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface DashboardData {
  todayMetrics: any;
  topPerformer: any;
  employeePerformance: any[];
  weeklyRevenue: { current: number; target: number };
  yellowSlipCount: number;
  customerSatisfaction: number;
}

export function useDashboardData() {
  const [realtimeData, setRealtimeData] = useState<DashboardData | null>(null);

  const { data: initialData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard'],
    refetchInterval: 60000, // Fallback refresh every minute
  });

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'dashboard_update') {
      setRealtimeData(message.data);
    }
  }, []);

  const { isConnected } = useWebSocket(handleWebSocketMessage);

  // Use real-time data if available, otherwise fall back to query data
  const data = realtimeData || initialData;

  return {
    data,
    isLoading,
    error,
    isConnected,
  };
}
