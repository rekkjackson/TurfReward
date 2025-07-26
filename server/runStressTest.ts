#!/usr/bin/env tsx

import { StressTestRunner, createP4PStressTestConfig } from './stressTest';

async function main() {
  console.log('🔥 P4P DASHBOARD STRESS TEST SUITE 🔥');
  console.log('=====================================\n');

  // Wait for server to be ready
  console.log('⏳ Waiting for server to be ready...');
  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 30;

  while (!serverReady && attempts < maxAttempts) {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard');
      if (response.ok) {
        serverReady = true;
        console.log('✅ Server is ready!\n');
      }
    } catch (error) {
      attempts++;
      console.log(`⏳ Attempt ${attempts}/${maxAttempts} - waiting for server...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (!serverReady) {
    console.error('❌ Server not ready after 60 seconds. Exiting.');
    process.exit(1);
  }

  // Create and run stress test
  const config = createP4PStressTestConfig();
  const runner = new StressTestRunner(config);

  try {
    const results = await runner.runAllTests();
    
    // Calculate overall performance metrics
    const totalRequests = results.reduce((sum, r) => sum + r.iterations, 0);
    const totalSuccesses = results.reduce((sum, r) => sum + r.successCount, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const overallSuccessRate = (totalSuccesses / totalRequests) * 100;

    console.log('\n🎉 STRESS TEST COMPLETED SUCCESSFULLY!');
    console.log(`📈 Final Results: ${totalRequests.toLocaleString()} total requests`);
    console.log(`✅ Success Rate: ${overallSuccessRate.toFixed(2)}%`);
    
    if (totalErrors > 0) {
      console.log(`❌ Total Errors: ${totalErrors}`);
    }

    // Export results to JSON for analysis
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fs = await import('fs');
    const reportPath = `stress-test-results-${timestamp}.json`;
    
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      config: {
        iterations: config.iterations,
        concurrency: config.concurrency,
        endpointCount: config.endpoints.length
      },
      results,
      summary: {
        totalRequests,
        totalSuccesses,
        totalErrors,
        overallSuccessRate
      }
    }, null, 2));

    console.log(`📊 Detailed results saved to: ${reportPath}`);

  } catch (error) {
    console.error('💥 Stress test failed:', error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);