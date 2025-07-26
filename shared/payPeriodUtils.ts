// Pay Period Utilities for Bimonthly Periods (11-25, 26-10)

export interface PayPeriod {
  start: Date;
  end: Date;
  periodName: string;
  periodType: '11-25' | '26-10';
}

/**
 * Gets the current pay period based on today's date
 * Periods: 11th-25th and 26th-10th of next month
 */
export function getCurrentPayPeriod(): PayPeriod {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (currentDay >= 11 && currentDay <= 25) {
    // First period: 11th-25th of current month
    return {
      start: new Date(currentYear, currentMonth, 11),
      end: new Date(currentYear, currentMonth, 25, 23, 59, 59, 999),
      periodName: `${getMonthName(currentMonth)} 11-25, ${currentYear}`,
      periodType: '11-25'
    };
  } else {
    // Second period: 26th of current/previous month to 10th of next/current month
    if (currentDay >= 26) {
      // We're in the 26-10 period that started this month
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      
      return {
        start: new Date(currentYear, currentMonth, 26),
        end: new Date(nextYear, nextMonth, 10, 23, 59, 59, 999),
        periodName: `${getMonthName(currentMonth)} 26 - ${getMonthName(nextMonth)} 10, ${currentYear}`,
        periodType: '26-10'
      };
    } else {
      // We're in the 26-10 period that started last month
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      return {
        start: new Date(prevYear, prevMonth, 26),
        end: new Date(currentYear, currentMonth, 10, 23, 59, 59, 999),
        periodName: `${getMonthName(prevMonth)} 26 - ${getMonthName(currentMonth)} 10, ${currentYear}`,
        periodType: '26-10'
      };
    }
  }
}

/**
 * Gets the previous pay period
 */
export function getPreviousPayPeriod(): PayPeriod {
  const current = getCurrentPayPeriod();
  
  if (current.periodType === '11-25') {
    // Previous period is 26-10 from previous month cycle
    const currentStart = current.start;
    const prevMonth = currentStart.getMonth() === 0 ? 11 : currentStart.getMonth() - 1;
    const prevYear = currentStart.getMonth() === 0 ? currentStart.getFullYear() - 1 : currentStart.getFullYear();
    
    return {
      start: new Date(prevYear, prevMonth, 26),
      end: new Date(currentStart.getFullYear(), currentStart.getMonth(), 10, 23, 59, 59, 999),
      periodName: `${getMonthName(prevMonth)} 26 - ${getMonthName(currentStart.getMonth())} 10, ${prevYear}`,
      periodType: '26-10'
    };
  } else {
    // Previous period is 11-25 from same month or previous month
    const currentStart = current.start;
    const targetMonth = currentStart.getMonth();
    const targetYear = currentStart.getFullYear();
    
    return {
      start: new Date(targetYear, targetMonth, 11),
      end: new Date(targetYear, targetMonth, 25, 23, 59, 59, 999),
      periodName: `${getMonthName(targetMonth)} 11-25, ${targetYear}`,
      periodType: '11-25'
    };
  }
}

/**
 * Gets the next pay period
 */
export function getNextPayPeriod(): PayPeriod {
  const current = getCurrentPayPeriod();
  
  if (current.periodType === '11-25') {
    // Next period is 26-10 starting from current month
    const currentEnd = current.end;
    const currentMonth = currentEnd.getMonth();
    const currentYear = currentEnd.getFullYear();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    return {
      start: new Date(currentYear, currentMonth, 26),
      end: new Date(nextYear, nextMonth, 10, 23, 59, 59, 999),
      periodName: `${getMonthName(currentMonth)} 26 - ${getMonthName(nextMonth)} 10, ${currentYear}`,
      periodType: '26-10'
    };
  } else {
    // Next period is 11-25 of the month after current period ends
    const currentEnd = current.end;
    const nextMonth = currentEnd.getMonth();
    const nextYear = currentEnd.getFullYear();
    
    return {
      start: new Date(nextYear, nextMonth, 11),
      end: new Date(nextYear, nextMonth, 25, 23, 59, 59, 999),
      periodName: `${getMonthName(nextMonth)} 11-25, ${nextYear}`,
      periodType: '11-25'
    };
  }
}

/**
 * Checks if a date falls within a specific pay period
 */
export function isDateInPayPeriod(date: Date, payPeriod: PayPeriod): boolean {
  return date >= payPeriod.start && date <= payPeriod.end;
}

/**
 * Gets all pay periods for a given year
 */
export function getPayPeriodsForYear(year: number): PayPeriod[] {
  const periods: PayPeriod[] = [];
  
  for (let month = 0; month < 12; month++) {
    // First period: 11-25
    periods.push({
      start: new Date(year, month, 11),
      end: new Date(year, month, 25, 23, 59, 59, 999),
      periodName: `${getMonthName(month)} 11-25, ${year}`,
      periodType: '11-25'
    });
    
    // Second period: 26-10 (of next month)
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    periods.push({
      start: new Date(year, month, 26),
      end: new Date(nextYear, nextMonth, 10, 23, 59, 59, 999),
      periodName: `${getMonthName(month)} 26 - ${getMonthName(nextMonth)} 10, ${year}`,
      periodType: '26-10'
    });
  }
  
  return periods;
}

/**
 * Calculates the number of working days in a pay period (excluding weekends)
 */
export function getWorkingDaysInPeriod(payPeriod: PayPeriod): number {
  let workingDays = 0;
  const current = new Date(payPeriod.start);
  
  while (current <= payPeriod.end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}

/**
 * Gets pay period for a specific date
 */
export function getPayPeriodForDate(date: Date): PayPeriod {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  if (day >= 11 && day <= 25) {
    return {
      start: new Date(year, month, 11),
      end: new Date(year, month, 25, 23, 59, 59, 999),
      periodName: `${getMonthName(month)} 11-25, ${year}`,
      periodType: '11-25'
    };
  } else if (day >= 26) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    return {
      start: new Date(year, month, 26),
      end: new Date(nextYear, nextMonth, 10, 23, 59, 59, 999),
      periodName: `${getMonthName(month)} 26 - ${getMonthName(nextMonth)} 10, ${year}`,
      periodType: '26-10'
    };
  } else {
    // Day 1-10, belongs to period that started previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    
    return {
      start: new Date(prevYear, prevMonth, 26),
      end: new Date(year, month, 10, 23, 59, 59, 999),
      periodName: `${getMonthName(prevMonth)} 26 - ${getMonthName(month)} 10, ${prevYear}`,
      periodType: '26-10'
    };
  }
}

function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}