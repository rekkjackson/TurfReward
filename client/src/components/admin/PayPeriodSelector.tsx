import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getCurrentPayPeriod, getPreviousPayPeriod, getNextPayPeriod, getPayPeriodsForYear, type PayPeriod } from '@shared/payPeriodUtils';

interface PayPeriodSelectorProps {
  selectedPeriod: PayPeriod;
  onPeriodChange: (period: PayPeriod) => void;
}

export function PayPeriodSelector({ selectedPeriod, onPeriodChange }: PayPeriodSelectorProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const currentPeriod = getCurrentPayPeriod();
  const previousPeriod = getPreviousPayPeriod();
  const nextPeriod = getNextPayPeriod();
  const yearPeriods = getPayPeriodsForYear(selectedYear);
  
  const formatDateRange = (period: PayPeriod) => {
    const start = period.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = period.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Pay Period Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Selection Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedPeriod.periodName === previousPeriod.periodName ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange(previousPeriod)}
            >
              Previous Period
            </Button>
            <Button
              variant={selectedPeriod.periodName === currentPeriod.periodName ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange(currentPeriod)}
            >
              Current Period
            </Button>
            <Button
              variant={selectedPeriod.periodName === nextPeriod.periodName ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange(nextPeriod)}
            >
              Next Period
            </Button>
          </div>

          {/* Year and Period Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pay Period</label>
              <Select 
                value={selectedPeriod.periodName} 
                onValueChange={(value) => {
                  const period = yearPeriods.find(p => p.periodName === value);
                  if (period) onPeriodChange(period);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearPeriods.map((period) => (
                    <SelectItem key={period.periodName} value={period.periodName}>
                      {period.periodName} ({formatDateRange(period)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="bg-slate-light rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-400">Selected Period</div>
                <div className="text-white">{selectedPeriod.periodName}</div>
              </div>
              <div>
                <div className="font-medium text-gray-400">Period Type</div>
                <div className="text-white">
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedPeriod.periodType === '11-25' ? 'bg-blue-600' : 'bg-green-600'
                  }`}>
                    {selectedPeriod.periodType}
                  </span>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-400">Date Range</div>
                <div className="text-white">{formatDateRange(selectedPeriod)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}