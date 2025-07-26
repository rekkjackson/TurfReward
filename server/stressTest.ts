import { performance } from 'perf_hooks';

interface StressTestResult {
  testName: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  successCount: number;
  errorCount: number;
  throughput: number;
}

interface StressTestConfig {
  baseUrl: string;
  iterations: number;
  concurrency: number;
  endpoints: {
    name: string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    body?: any;
    headers?: Record<string, string>;
  }[];
}

export class StressTestRunner {
  private config: StressTestConfig;
  private results: StressTestResult[] = [];

  constructor(config: StressTestConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: StressTestConfig['endpoints'][0]): Promise<{ time: number; success: boolean; error?: string }> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...endpoint.headers,
        },
        body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
      });

      const endTime = performance.now();
      return {
        time: endTime - startTime,
        success: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        time: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async runConcurrentBatch(endpoint: StressTestConfig['endpoints'][0], batchSize: number): Promise<{ time: number; success: boolean; error?: string }[]> {
    const promises = Array(batchSize).fill(null).map(() => this.makeRequest(endpoint));
    return Promise.all(promises);
  }

  private async testEndpoint(endpoint: StressTestConfig['endpoints'][0]): Promise<StressTestResult> {
    console.log(`\n🚀 Starting stress test for ${endpoint.method} ${endpoint.path}`);
    console.log(`📊 Running ${this.config.iterations} iterations with concurrency ${this.config.concurrency}`);

    const testStartTime = performance.now();
    const times: number[] = [];
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Calculate number of batches
    const batchCount = Math.ceil(this.config.iterations / this.config.concurrency);
    
    for (let batch = 0; batch < batchCount; batch++) {
      const remainingIterations = this.config.iterations - (batch * this.config.concurrency);
      const currentBatchSize = Math.min(this.config.concurrency, remainingIterations);
      
      const batchResults = await this.runConcurrentBatch(endpoint, currentBatchSize);
      
      batchResults.forEach(result => {
        times.push(result.time);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          if (result.error && !errors.includes(result.error)) {
            errors.push(result.error);
          }
        }
      });

      // Progress indicator
      const progress = ((batch + 1) / batchCount * 100).toFixed(1);
      process.stdout.write(`\r⏳ Progress: ${progress}% (${successCount} success, ${errorCount} errors)`);
    }

    const testEndTime = performance.now();
    const totalTime = testEndTime - testStartTime;

    const result: StressTestResult = {
      testName: `${endpoint.method} ${endpoint.path}`,
      iterations: this.config.iterations,
      totalTime,
      averageTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      minTime: times.length > 0 ? Math.min(...times) : 0,
      maxTime: times.length > 0 ? Math.max(...times) : 0,
      successCount,
      errorCount,
      throughput: (successCount / totalTime) * 1000, // requests per second
    };

    console.log(`\n✅ Test completed!`);
    if (errors.length > 0) {
      console.log(`❌ Unique errors encountered: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
    }

    return result;
  }

  async runAllTests(): Promise<StressTestResult[]> {
    console.log(`🔥 STARTING COMPREHENSIVE STRESS TEST SUITE`);
    console.log(`🎯 Target: ${this.config.iterations} iterations per endpoint`);
    console.log(`⚡ Concurrency: ${this.config.concurrency} concurrent requests`);
    console.log(`🌐 Base URL: ${this.config.baseUrl}`);
    console.log(`📋 Endpoints to test: ${this.config.endpoints.length}`);

    this.results = [];

    for (const endpoint of this.config.endpoints) {
      const result = await this.testEndpoint(endpoint);
      this.results.push(result);
      
      // Brief pause between endpoint tests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.printSummaryReport();
    return this.results;
  }

  private printSummaryReport(): void {
    console.log(`\n\n📊 STRESS TEST SUMMARY REPORT`);
    console.log(`${'='.repeat(80)}`);
    
    let totalRequests = 0;
    let totalSuccesses = 0;
    let totalErrors = 0;
    let totalTime = 0;

    this.results.forEach(result => {
      totalRequests += result.iterations;
      totalSuccesses += result.successCount;
      totalErrors += result.errorCount;
      totalTime += result.totalTime;

      console.log(`\n🔸 ${result.testName}`);
      console.log(`   Iterations: ${result.iterations.toLocaleString()}`);
      console.log(`   Success Rate: ${((result.successCount / result.iterations) * 100).toFixed(2)}%`);
      console.log(`   Average Response Time: ${result.averageTime.toFixed(2)}ms`);
      console.log(`   Min/Max Time: ${result.minTime.toFixed(2)}ms / ${result.maxTime.toFixed(2)}ms`);
      console.log(`   Throughput: ${result.throughput.toFixed(2)} req/sec`);
      
      if (result.errorCount > 0) {
        console.log(`   ❌ Errors: ${result.errorCount} (${((result.errorCount / result.iterations) * 100).toFixed(2)}%)`);
      }
    });

    console.log(`\n🎯 OVERALL PERFORMANCE`);
    console.log(`   Total Requests: ${totalRequests.toLocaleString()}`);
    console.log(`   Overall Success Rate: ${((totalSuccesses / totalRequests) * 100).toFixed(2)}%`);
    console.log(`   Total Test Duration: ${(totalTime / 1000).toFixed(2)} seconds`);
    console.log(`   Average System Throughput: ${((totalSuccesses / totalTime) * 1000).toFixed(2)} req/sec`);
    
    if (totalErrors > 0) {
      console.log(`   ⚠️  Total Errors: ${totalErrors} (${((totalErrors / totalRequests) * 100).toFixed(2)}%)`);
    }

    console.log(`\n${this.getPerformanceGrade(totalSuccesses / totalRequests, (totalSuccesses / totalTime) * 1000)}`);
  }

  private getPerformanceGrade(successRate: number, throughput: number): string {
    const successPercent = successRate * 100;
    
    if (successPercent >= 99.5 && throughput >= 1000) {
      return '🏆 PERFORMANCE GRADE: A+ (EXCEPTIONAL - Enterprise Ready)';
    } else if (successPercent >= 99 && throughput >= 500) {
      return '🥇 PERFORMANCE GRADE: A (EXCELLENT - Production Ready)';
    } else if (successPercent >= 95 && throughput >= 100) {
      return '🥈 PERFORMANCE GRADE: B (GOOD - Minor Optimizations Needed)';
    } else if (successPercent >= 90 && throughput >= 50) {
      return '🥉 PERFORMANCE GRADE: C (ACCEPTABLE - Significant Improvements Needed)';
    } else {
      return '⚠️  PERFORMANCE GRADE: D (POOR - Major Issues Detected)';
    }
  }
}

// Test configuration for P4P Dashboard System
export const createP4PStressTestConfig = (baseUrl: string = 'http://localhost:5000'): StressTestConfig => ({
  baseUrl,
  iterations: 2000,
  concurrency: 10,
  endpoints: [
    {
      name: 'Dashboard Data',
      method: 'GET',
      path: '/api/dashboard',
    },
    {
      name: 'Job Listings',
      method: 'GET',
      path: '/api/jobs',
    },
    {
      name: 'Employee Data',
      method: 'GET',
      path: '/api/employees',
    },
    {
      name: 'Pay Period Info',
      method: 'GET',
      path: '/api/pay-period/current',
    },
    {
      name: 'Job Creation',
      method: 'POST',
      path: '/api/jobs',
      body: {
        jobType: 'mowing',
        category: 'one_day',
        customerName: 'Stress Test Customer',
        customerAddress: '123 Test Street',
        customerPhone: '555-0123',
        budgetedHours: '4.00',
        laborRevenue: '200.00',
        totalJobValue: '200.00',
        priority: 'normal',
        estimatedDuration: 1,
        notes: 'Automated stress test job'
      }
    },
    {
      name: 'Performance Metrics',
      method: 'GET',
      path: '/api/performance-metrics',
    },
    {
      name: 'Company Metrics',
      method: 'GET',
      path: '/api/company-metrics',
    },
  ]
});