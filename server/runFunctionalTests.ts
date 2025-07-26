import { runFunctionalTests } from './functionalTest';
import { writeFileSync } from 'fs';

async function main() {
  try {
    const results = await runFunctionalTests();
    
    // Save results
    const filename = `functional-test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(filename, JSON.stringify(results, null, 2));
    
    console.log(`📊 Functional test results saved to: ${filename}`);
    
    // Overall assessment
    const successCount = results.filter(r => r.success).length;
    const totalTests = results.length;
    const successRate = (successCount / totalTests) * 100;
    
    console.log('\n🏆 FUNCTIONAL TEST ASSESSMENT:');
    if (successRate === 100) {
      console.log('✅ PERFECT: All functional tests passed - Military/Enterprise grade quality');
    } else if (successRate >= 90) {
      console.log('✅ EXCELLENT: Functional tests meet enterprise standards');
    } else if (successRate >= 80) {
      console.log('⚠️  GOOD: Functional tests mostly successful, minor issues identified');
    } else {
      console.log('❌ NEEDS ATTENTION: Multiple functional issues detected');
    }
    
    console.log('\n✅ Functional testing completed!');
    
  } catch (error) {
    console.error('❌ Functional testing failed:', error);
    process.exit(1);
  }
}

main();