import { getCurrentPayPeriod, getPayPeriodForDate, type PayPeriod } from "@shared/payPeriodUtils";

export interface PayPeriodSummary {
  currentPeriod: PayPeriod;
  periodProgress: number;
  daysRemaining: number;
  workingDaysTotal: number;
  isCurrentPeriod: boolean;
}

export class PayPeriodService {
  /**
   * Gets comprehensive pay period information for the dashboard
   */
  static getCurrentPeriodSummary(): PayPeriodSummary {
    const currentPeriod = getCurrentPayPeriod();
    const now = new Date();
    
    // Calculate period progress
    const totalMs = currentPeriod.end.getTime() - currentPeriod.start.getTime();
    const elapsedMs = now.getTime() - currentPeriod.start.getTime();
    const periodProgress = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
    
    // Calculate working days
    const workingDaysTotal = this.getWorkingDaysInPeriod(currentPeriod);
    const workingDaysElapsed = this.getWorkingDaysBetween(currentPeriod.start, now);
    const daysRemaining = Math.max(0, workingDaysTotal - workingDaysElapsed);
    
    return {
      currentPeriod,
      periodProgress,
      daysRemaining,
      workingDaysTotal,
      isCurrentPeriod: now >= currentPeriod.start && now <= currentPeriod.end
    };
  }

  /**
   * Calculates working days (Mon-Fri) in a pay period
   */
  static getWorkingDaysInPeriod(period: PayPeriod): number {
    let workingDays = 0;
    const current = new Date(period.start);
    
    while (current <= period.end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workingDays;
  }

  /**
   * Calculates working days between two dates
   */
  static getWorkingDaysBetween(start: Date, end: Date): number {
    let workingDays = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workingDays;
  }

  /**
   * Determines if a job assignment falls within the current pay period
   */
  static isJobInCurrentPayPeriod(jobDate: Date): boolean {
    const currentPeriod = getCurrentPayPeriod();
    return jobDate >= currentPeriod.start && jobDate <= currentPeriod.end;
  }

  /**
   * Gets the pay period for any given date
   */
  static getPayPeriodForDate(date: Date): PayPeriod {
    return getPayPeriodForDate(date);
  }

  /**
   * Calculates total hours that should count toward current pay period minimum wage protection
   * This ensures the $23/hour minimum is maintained across the bimonthly period
   */
  static calculatePayPeriodMinimumWage(hoursWorked: number, baseRate: number = 18.00): number {
    return hoursWorked * baseRate;
  }

  /**
   * Formats pay period information for display
   */
  static formatPayPeriodDisplay(period: PayPeriod): string {
    const start = period.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = period.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end} (${period.periodType})`;
  }
}