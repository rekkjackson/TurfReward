import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface PayPeriodSummary {
  currentPeriod: {
    start: string;
    end: string;
    periodName: string;
    periodType: '11-25' | '26-10';
  };
  periodProgress: number;
  daysRemaining: number;
  workingDaysTotal: number;
  isCurrentPeriod: boolean;
}

export function usePayPeriodData() {
  const [realtimeData, setRealtimeData] = useState<PayPeriodSummary | null>(null);

  const { data: initialData, isLoading, error } = useQuery({
    queryKey: ['/api/pay-period/current'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'pay_period_update') {
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