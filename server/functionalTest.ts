import http from 'http';

interface FunctionalTestResult {
  testName: string;
  success: boolean;
  details: string;
  responseTime: number;
  error?: string;
}

// Comprehensive functional test scenarios
const functionalTests = [
  {
    name: "Create Employee and Verify",
    test: async (): Promise<FunctionalTestResult> => {
      const startTime = Date.now();
      try {
        // Create employee
        const employeeData = {
          name: 'Functional Test Employee',
          position: 'Lead Landscaper',
          baseHourlyRate: '22.00',
          isActive: true
        };
        
        const createResponse = await makeRequest('POST', '/api/employees', employeeData);
        if (createResponse.status !== 201) {
          throw new Error(`Failed to create employee: ${createResponse.status}`);
        }
        
        const employee = JSON.parse(createResponse.data);
        
        // Verify employee exists
        const getResponse = await makeRequest('GET', `/api/employees`);
        const employees = JSON.parse(getResponse.data);
        const foundEmployee = employees.find((emp: any) => emp.id === employee.id);
        
        if (!foundEmployee) {
          throw new Error('Created employee not found in list');
        }
        
        return {
          testName: "Create Employee and Verify",
          success: true,
          details: `Employee ${employee.name} created and verified`,
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        return {
          testName: "Create Employee and Verify",
          success: false,
          details: "Failed to create and verify employee",
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },
  
  {
    name: "Create Job and Complete Workflow",
    test: async (): Promise<FunctionalTestResult> => {
      const startTime = Date.now();
      try {
        // Create job
        const jobData = {
          customerName: 'Functional Test Customer',
          customerAddress: '456 Test Ave',
          jobType: 'mowing',
          budgetedHours: '3.0',
          laborRevenue: '180.00',
          totalJobValue: '200.00',
          status: 'pending',
          isLargejob: false,
          isSeasonalBonus: false,
          notes: 'Functional test job'
        };
        
        const createJobResponse = await makeRequest('POST', '/api/jobs', jobData);
        if (createJobResponse.status !== 201) {
          throw new Error(`Failed to create job: ${createJobResponse.status}`);
        }
        
        const job = JSON.parse(createJobResponse.data);
        
        // Update job status to completed
        const updateResponse = await makeRequest('PATCH', `/api/jobs/${job.id}`, {
          status: 'completed'
        });
        
        if (updateResponse.status !== 200) {
          throw new Error(`Failed to update job status: ${updateResponse.status}`);
        }
        
        return {
          testName: "Create Job and Complete Workflow",
          success: true,
          details: `Job ${job.customerName} created and completed successfully`,
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        return {
          testName: "Create Job and Complete Workflow",
          success: false,
          details: "Failed job creation/completion workflow",
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },
  
  {
    name: "Dashboard Data Integrity",
    test: async (): Promise<FunctionalTestResult> => {
      const startTime = Date.now();
      try {
        const dashboardResponse = await makeRequest('GET', '/api/dashboard');
        if (dashboardResponse.status !== 200) {
          throw new Error(`Dashboard request failed: ${dashboardResponse.status}`);
        }
        
        const dashboard = JSON.parse(dashboardResponse.data);
        
        // Verify required dashboard structure
        const requiredFields = ['todayMetrics', 'weeklyRevenue', 'damageCases'];
        for (const field of requiredFields) {
          if (!dashboard[field]) {
            throw new Error(`Missing required dashboard field: ${field}`);
          }
        }
        
        // Verify todayMetrics structure
        const requiredMetrics = ['dailyRevenue', 'mowingJobsCompleted', 'landscapingJobsCompleted'];
        for (const metric of requiredMetrics) {
          if (dashboard.todayMetrics[metric] === undefined) {
            throw new Error(`Missing required metric: ${metric}`);
          }
        }
        
        return {
          testName: "Dashboard Data Integrity",
          success: true,
          details: "Dashboard data structure verified with all required fields",
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        return {
          testName: "Dashboard Data Integrity",
          success: false,
          details: "Dashboard data integrity check failed",
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },
  
  {
    name: "Pay Period Calculation",
    test: async (): Promise<FunctionalTestResult> => {
      const startTime = Date.now();
      try {
        const payPeriodResponse = await makeRequest('GET', '/api/pay-period/current');
        if (payPeriodResponse.status !== 200) {
          throw new Error(`Pay period request failed: ${payPeriodResponse.status}`);
        }
        
        const payPeriod = JSON.parse(payPeriodResponse.data);
        
        // Verify pay period structure
        const requiredFields = ['currentPeriod', 'periodProgress', 'daysRemaining'];
        for (const field of requiredFields) {
          if (payPeriod[field] === undefined) {
            throw new Error(`Missing required pay period field: ${field}`);
          }
        }
        
        // Verify current period details
        if (!payPeriod.currentPeriod.periodName || !payPeriod.currentPeriod.start) {
          throw new Error('Invalid current period data');
        }
        
        return {
          testName: "Pay Period Calculation",
          success: true,
          details: `Pay period ${payPeriod.currentPeriod.periodName} calculated correctly`,
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        return {
          testName: "Pay Period Calculation",
          success: false,
          details: "Pay period calculation failed",
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  }
];

function makeRequest(method: string, path: string, data: any = null): Promise<{status: number, data: string}> {
  return new Promise((resolve, reject) => {
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
        resolve({
          status: res.statusCode || 0,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runFunctionalTests(): Promise<FunctionalTestResult[]> {
  console.log('🔧 Running Comprehensive Functional Tests...\n');
  
  const results: FunctionalTestResult[] = [];
  
  for (const testCase of functionalTests) {
    console.log(`Testing: ${testCase.name}...`);
    const result = await testCase.test();
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.testName}: ${result.details} (${result.responseTime}ms)`);
    } else {
      console.log(`❌ ${result.testName}: ${result.details} (${result.responseTime}ms)`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    console.log('');
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;
  const successRate = (successCount / totalTests) * 100;
  
  console.log('=== FUNCTIONAL TEST SUMMARY ===');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${totalTests - successCount}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log('===============================\n');
  
  return results;
}

export { runFunctionalTests, type FunctionalTestResult };