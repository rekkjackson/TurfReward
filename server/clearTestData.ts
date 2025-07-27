#!/usr/bin/env tsx

import { db } from './db';
import { employees, jobAssignments, jobs } from '@shared/schema';

async function clearTestData() {
  console.log('🧹 Clearing test data...');

  try {
    // Import incidents table to handle foreign keys
    const { incidents, performanceMetrics, companyMetrics } = await import('@shared/schema');

    // Delete in proper order to handle foreign key constraints
    await db.delete(jobAssignments);
    console.log('✓ Cleared job assignments');

    await db.delete(jobs);
    console.log('✓ Cleared jobs');

    await db.delete(incidents);
    console.log('✓ Cleared incidents');

    await db.delete(performanceMetrics);
    console.log('✓ Cleared performance metrics');

    await db.delete(companyMetrics);
    console.log('✓ Cleared company metrics');

    await db.delete(employees);
    console.log('✓ Cleared employees');

    console.log('✅ All test data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    process.exit(1);
  }
}

clearTestData();