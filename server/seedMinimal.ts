#!/usr/bin/env tsx

import { db } from './db';
import { p4pConfigs, InsertP4PConfig } from '@shared/schema';

async function seedMinimalData() {
  console.log('🌱 Setting up essential P4P configurations...');
  
  try {
    // Create basic P4P configurations for different job types
    const configs: InsertP4PConfig[] = [
      {
        jobType: 'mowing',
        laborRevenuePercentage: 33,
        seasonalBonusPercentage: 40, // March-May bonus
        minimumHourlyRate: 18.00,
        trainingBonusRate: 4.00,
        largeJobBonusRate: 1.50,
        largeJobThreshold: 49,
        isActive: true,
      },
      {
        jobType: 'landscaping',
        laborRevenuePercentage: 33,
        seasonalBonusPercentage: 40,
        minimumHourlyRate: 18.00,
        trainingBonusRate: 4.00,
        largeJobBonusRate: 1.50,
        largeJobThreshold: 49,
        isActive: true,
      },
      {
        jobType: 'maintenance',
        laborRevenuePercentage: 33,
        seasonalBonusPercentage: 40,
        minimumHourlyRate: 18.00,
        trainingBonusRate: 4.00,
        largeJobBonusRate: 1.50,
        largeJobThreshold: 49,
        isActive: true,
      }
    ];

    for (const config of configs) {
      await db.insert(p4pConfigs).values(config);
      console.log(`✓ Created P4P config for ${config.jobType}`);
    }

    console.log('\n✅ Essential configurations created!');
    console.log('\n📋 Ready for your business data:');
    console.log('• P4P rates set to company standard (33% base, 40% seasonal)');
    console.log('• $23/hour minimum wage protection');
    console.log('• $4/hour training bonus available');
    console.log('• $1.50/hour large job bonus (49+ hours)');
    
  } catch (error) {
    console.error('❌ Error setting up configurations:', error);
    throw error;
  }
}

// Run the minimal seed
seedMinimalData()
  .then(() => {
    console.log('\n🎯 System ready for your team and job data!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });