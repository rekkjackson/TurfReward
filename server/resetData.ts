#!/usr/bin/env tsx

import { db } from './db';
import { 
  jobs, 
  employees, 
  jobAssignments, 
  performanceMetrics, 
  incidents, 
  companyMetrics,
  p4pConfigs 
} from '@shared/schema';

async function resetAllData() {
  console.log('🔄 Starting complete data reset...');
  
  try {
    // Delete all data in proper order (respecting foreign key constraints)
    console.log('🗑️  Deleting job assignments...');
    await db.delete(jobAssignments);
    
    console.log('🗑️  Deleting performance metrics...');
    await db.delete(performanceMetrics);
    
    console.log('🗑️  Deleting incidents...');
    await db.delete(incidents);
    
    console.log('🗑️  Deleting jobs...');
    await db.delete(jobs);
    
    console.log('🗑️  Deleting employees...');
    await db.delete(employees);
    
    console.log('🗑️  Deleting company metrics...');
    await db.delete(companyMetrics);
    
    console.log('🗑️  Deleting P4P configurations...');
    await db.delete(p4pConfigs);
    
    console.log('✅ All data successfully cleared!');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to Admin Panel > Employees tab to add your team members');
    console.log('2. Go to P4P Config tab to set your performance pay rates');
    console.log('3. Go to Projects tab to start adding real jobs');
    console.log('4. Use the Data Input Workflow for daily job entry');
    
    console.log('\n🎯 Your dashboard will automatically update as you add real data!');
    
  } catch (error) {
    console.error('❌ Error during data reset:', error);
    throw error;
  }
}

// Run the reset
resetAllData()
  .then(() => {
    console.log('\n🎉 Data reset complete! Ready for your business data.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Reset failed:', error);
    process.exit(1);
  });