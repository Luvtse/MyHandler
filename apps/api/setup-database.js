#!/usr/bin/env node

/**
 * Database Setup Script for Logistics Web App
 * 
 * This script helps set up a PostgreSQL database for the application.
 * It creates the database if it doesn't exist and runs Prisma migrations.
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚚 Logistics Web App - Database Setup');
console.log('====================================');

async function setupDatabase() {
  try {
    // 1. Check if PostgreSQL is installed
    try {
      console.log('\n📋 Checking PostgreSQL installation...');
      execSync('pg_isready -q');
      console.log('✅ PostgreSQL is installed and running.');
    } catch (error) {
      console.error('❌ PostgreSQL is not installed or not running.');
      console.log('Please install PostgreSQL and make sure it\'s running before continuing.');
      process.exit(1);
    }

    // 2. Get database connection details
    const dbName = await question('Enter database name (default: logistics): ') || 'logistics';
    const dbUser = await question('Enter database user (default: postgres): ') || 'postgres';
    const dbPassword = await question('Enter database password: ');
    const dbHost = await question('Enter database host (default: localhost): ') || 'localhost';
    const dbPort = await question('Enter database port (default: 5432): ') || '5432';

    // 3. Update .env file with database connection details
    const envPath = path.join(__dirname, '.env');
    const envContent = `# PostgreSQL Database Connection
DATABASE_URL="postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public"
DIRECT_URL="postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public"
PORT=4000
JWT_SECRET="change_me_in_production"
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env file with database connection details.');

    // 4. Run Prisma migrations
    console.log('\n📋 Running Prisma migrations...');
    try {
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
      console.log('✅ Prisma migrations completed successfully.');
    } catch (error) {
      console.error('❌ Failed to run Prisma migrations.');
      console.error('Please check your database connection details and try again.');
      process.exit(1);
    }

    // 5. Seed the database
    console.log('\n📋 Seeding the database...');
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully.');
    } catch (error) {
      console.error('❌ Failed to seed the database.');
      console.error('You can manually seed the database later with: npx prisma db seed');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('You can now start the server with: npm run dev');
  } catch (error) {
    console.error('❌ An error occurred during database setup:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

setupDatabase();