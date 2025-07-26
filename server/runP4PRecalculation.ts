import { P4PCalculationEngine } from './p4pCalculations';

async function main() {
  try {
    console.log('🔧 P4P System Recalculation Starting...\n');
    
    // Recalculate all P4P for completed jobs
    await P4PCalculationEngine.recalculateAllP4P();
    
    console.log('\n✅ P4P recalculation completed successfully!');
    console.log('💡 Check the payroll dashboard to see updated P4P calculations.');
    
  } catch (error) {
    console.error('❌ P4P recalculation failed:', error);
    process.exit(1);
  }
}

main();