#!/usr/bin/env node

/**
 * Supabase RLS Fix Script
 * 
 * This script helps fix RLS issues for the itinerary booking system
 * Run with: node fix-rls-issues.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
🔧 Supabase RLS Fix Helper
==========================

This script will help you fix the RLS (Row Level Security) issues
that are preventing itinerary booking requests from being created.

Error: "new row violates row-level security policy for table 'itinerary_requests'"
`);

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('Available options:');
  console.log('1. Quick Fix - Disable RLS (for development)');
  console.log('2. Proper Fix - Setup RLS policies (for production)');
  console.log('3. Show SQL scripts only');
  console.log('4. Exit');
  
  const choice = await askQuestion('\nChoose an option (1-4): ');
  
  switch (choice.trim()) {
    case '1':
      await showQuickFix();
      break;
    case '2':
      await showProperFix();
      break;
    case '3':
      await showScripts();
      break;
    case '4':
      console.log('Goodbye!');
      process.exit(0);
      break;
    default:
      console.log('Invalid choice. Please try again.');
      await main();
  }
  
  rl.close();
}

async function showQuickFix() {
  console.log(`
🚀 Quick Fix - Disable RLS (Development Only)
=============================================

This will disable Row Level Security temporarily.
⚠️  WARNING: Only use this for development/testing!

Steps:
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste this SQL script:
`);

  const quickFixSQL = `
-- QUICK FIX: Disable RLS for Development
ALTER TABLE public.itinerary_requests DISABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON public.itinerary_requests TO anon, authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE public.itinerary_requests_id_seq TO anon, authenticated;

-- Also fix related tables
ALTER TABLE public.itineraries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.itineraries TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;

SELECT 'RLS disabled successfully for development' AS status;
`;

  console.log(quickFixSQL);
  
  const saveToFile = await askQuestion('Save this SQL to a file? (y/n): ');
  if (saveToFile.toLowerCase() === 'y') {
    const filePath = path.join(__dirname, 'database', 'quick-fix-rls.sql');
    fs.writeFileSync(filePath, quickFixSQL);
    console.log(`✅ SQL saved to: ${filePath}`);
  }
  
  console.log(`
Next steps:
1. Run the SQL in Supabase SQL Editor
2. Test your booking form
3. The error should be resolved
`);
}

async function showProperFix() {
  console.log(`
🔒 Proper Fix - Setup RLS Policies (Production Ready)
====================================================

This creates proper security policies while maintaining access.
✅ Recommended for production environments.

The script will create policies for:
- Users can create their own requests
- Users can view their own requests  
- Admins can manage all requests
- Tour guides can view assigned requests

Steps:
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Run the script: database/fix_rls_policies.sql
`);

  const filePath = path.join(__dirname, 'database', 'fix_rls_policies.sql');
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ Script found at: ${filePath}`);
    
    const showContent = await askQuestion('Show the SQL content? (y/n): ');
    if (showContent.toLowerCase() === 'y') {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log('\n--- SQL Script Content ---');
      console.log(content);
    }
  } else {
    console.log(`❌ Script not found. Please ensure ${filePath} exists.`);
  }
  
  console.log(`
Next steps:
1. Run the fix_rls_policies.sql script in Supabase
2. Test the booking functionality
3. Verify all user roles work correctly
`);
}

async function showScripts() {
  console.log(`
📄 Available SQL Scripts
========================

1. database/disable_rls_dev.sql - Quick development fix
2. database/fix_rls_policies.sql - Comprehensive RLS setup

File locations:`);

  const scripts = [
    'database/disable_rls_dev.sql',
    'database/fix_rls_policies.sql'
  ];
  
  scripts.forEach(script => {
    const fullPath = path.join(__dirname, script);
    const exists = fs.existsSync(fullPath);
    console.log(`${exists ? '✅' : '❌'} ${fullPath}`);
  });
  
  console.log(`
Choose the appropriate script based on your environment:
- Development: Use disable_rls_dev.sql
- Production: Use fix_rls_policies.sql
`);
}

// Run the script
main().catch(console.error);
