import http from 'http';
import { URL } from 'url';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

interface StressTestResults {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  successRate: number;
  results: TestResult[];
  timestamp: string;
}

// Test endpoints and data
const testEndpoints = [
  // GET endpoints
  { method: 'GET', path: '/api/employees', data: null },
  { method: 'GET', path: '/api/jobs', data: null },
  { method: 'GET', path: '/api/job-assignments', data: null },
  { method: 'GET', path: '/api/dashboard', data: null },
  { method: 'GET', path: '/api/pay-period/current', data: null },
  { method: 'GET', path: '/api/p4p-configs', data: null },
  { method: 'GET', path: '/api/incidents', data: null },
  { method: 'GET', path: '/api/performance-metrics', data: null },
  { method: 'GET', path: '/api/company-metrics', data: null },
  
  // POST endpoints with valid data
  {
    method: 'POST',
    path: '/api/employees',
    data: {
      name: 'Test Employee',
      position: 'Crew Member',
      baseHourlyRate: '18.00',
      isActive: true
    }
  },
  {
    method: 'POST',
    path: '/api/jobs',
    data: {
      customerName: 'Test Customer',
      customerAddress: '123 Test St',
      jobType: 'mowing',
      budgetedHours: '4.0',
      laborRevenue: '200.00',
      totalJobValue: '240.00',
      status: 'pending',
      isLargejob: false,
      isSeasonalBonus: false,
      notes: 'Stress test job'
    }
  }
];

function makeRequest(method: string, path: string, data: any = null): Promise<TestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          endpoint: path,
          method,
          status: res.statusCode || 0,
          responseTime,
          success: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400,
        });
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      resolve({
        endpoint: path,
        method,
        status: 0,
        responseTime,
        success: false,
        error: error.message
      });
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runStressTest(concurrentRequests: number = 50, totalRequests: number = 1000): Promise<StressTestResults> {
  console.log(`Starting stress test: ${totalRequests} requests with ${concurrentRequests} concurrent connections`);
  
  const results: TestResult[] = [];
  const promises: Promise<TestResult>[] = [];

  // Generate test requests
  for (let i = 0; i < totalRequests; i++) {
    const endpoint = testEndpoints[i % testEndpoints.length];
    promises.push(makeRequest(endpoint.method, endpoint.path, endpoint.data));
    
    // Control concurrency
    if (promises.length >= concurrentRequests) {
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      promises.length = 0; // Clear array
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Handle remaining requests
  if (promises.length > 0) {
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }

  // Calculate statistics
  const successfulRequests = results.filter(r => r.success).length;
  const failedRequests = results.length - successfulRequests;
  const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const successRate = (successfulRequests / results.length) * 100;

  const stressTestResults: StressTestResults = {
    totalRequests: results.length,
    successfulRequests,
    failedRequests,
    averageResponseTime: Math.round(averageResponseTime * 100) / 100,
    successRate: Math.round(successRate * 100) / 100,
    results,
    timestamp: new Date().toISOString()
  };

  console.log('\n=== STRESS TEST RESULTS ===');
  console.log(`Total Requests: ${stressTestResults.totalRequests}`);
  console.log(`Successful: ${stressTestResults.successfulRequests}`);
  console.log(`Failed: ${stressTestResults.failedRequests}`);
  console.log(`Success Rate: ${stressTestResults.successRate}%`);
  console.log(`Average Response Time: ${stressTestResults.averageResponseTime}ms`);
  console.log('===========================\n');

  return stressTestResults;
}

export { runStressTest, type StressTestResults, type TestResult };