import { runStressTest } from './stressTest';
import { writeFileSync } from 'fs';

async function main() {
  try {
    console.log('🚀 P4P System Stress Test Starting...\n');
    
    // Run comprehensive stress test
    const results = await runStressTest(100, 5000); // 5000 requests, 100 concurrent
    
    // Save results to file
    const filename = `stress-test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(filename, JSON.stringify(results, null, 2));
    
    console.log(`📊 Results saved to: ${filename}`);
    
    // Detailed analysis
    console.log('\n📈 DETAILED ANALYSIS:');
    
    // Group by endpoint
    const endpointStats = results.results.reduce((acc, result) => {
      const key = `${result.method} ${result.endpoint}`;
      if (!acc[key]) {
        acc[key] = { total: 0, successful: 0, avgTime: 0, times: [] };
      }
      acc[key].total++;
      if (result.success) acc[key].successful++;
      acc[key].times.push(result.responseTime);
      return acc;
    }, {} as Record<string, any>);
    
    Object.entries(endpointStats).forEach(([endpoint, stats]) => {
      const avgTime = stats.times.reduce((a: number, b: number) => a + b, 0) / stats.times.length;
      const successRate = (stats.successful / stats.total * 100).toFixed(1);
      console.log(`${endpoint}: ${successRate}% success, ${avgTime.toFixed(1)}ms avg`);
    });
    
    // Performance assessment
    console.log('\n🏆 PERFORMANCE ASSESSMENT:');
    if (results.successRate >= 95) {
      console.log('✅ EXCELLENT: System performance exceeds enterprise standards');
    } else if (results.successRate >= 90) {
      console.log('✅ GOOD: System performance meets enterprise standards');
    } else if (results.successRate >= 80) {
      console.log('⚠️  ACCEPTABLE: System performance needs optimization');
    } else {
      console.log('❌ POOR: System requires immediate attention');
    }
    
    if (results.averageResponseTime <= 100) {
      console.log('⚡ FAST: Response times are excellent');
    } else if (results.averageResponseTime <= 300) {
      console.log('👍 GOOD: Response times are acceptable');
    } else {
      console.log('🐌 SLOW: Response times need optimization');
    }
    
    console.log('\n✅ Stress test completed successfully!');
    
  } catch (error) {
    console.error('❌ Stress test failed:', error);
    process.exit(1);
  }
}

main();