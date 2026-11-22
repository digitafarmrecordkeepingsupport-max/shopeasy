/**
 * ShopEasy - Provision Initial Store Owner (Super Admin)
 *
 * Usage:
 *   node scripts/create-admin.js [admin_email] [password] [full_name]
 *
 * Examples:
 *   node scripts/create-admin.js admin@shopeasy.com AdminPass123! "Store Owner"
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env or .env.local if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2] || process.env.INITIAL_ADMIN_EMAIL || 'admin@shopeasy.com';
const password = process.argv[3] || process.env.INITIAL_ADMIN_PASSWORD || 'ShopEasyAdmin2026!';
const fullName = process.argv[4] || 'Store Owner';

async function provisionAdmin() {
  console.log('========================================================');
  console.log('  ShopEasy - Store Owner Account Provisioning Tool      ');
  console.log('========================================================\n');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('ERROR: Missing environment variables.');
    console.error('Please ensure both are set in your .env file:');
    console.error('  - SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL)');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY (found in Supabase Settings > API)\n');
    console.log('Alternative SQL Script to run directly in Supabase SQL Editor:');
    console.log(`
      -- Run in Supabase SQL Editor:
      -- 1. Sign up ${email} via the web admin or Supabase Auth tab
      -- 2. Then run:
      UPDATE public.profiles
      SET role = 'super_admin', account_status = 'active'
      WHERE email = '${email}';
    `);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`Target Email: ${email}`);
  console.log(`Role:         super_admin`);
  console.log(`Full Name:    ${fullName}\n`);

  try {
    // 1. Check if user already exists in auth.users
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = usersData.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    let userId;

    if (existingUser) {
      console.log(`User ${email} already exists (ID: ${existingUser.id}). Updating password and metadata...`);
      userId = existingUser.id;
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: {
          role: 'super_admin',
          full_name: fullName,
        },
      });
      if (updateError) throw updateError;
    } else {
      console.log(`Creating new user ${email}...`);
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'super_admin',
          full_name: fullName,
        },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // 2. Ensure public.profiles reflects super_admin role and active status
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName,
        role: 'super_admin',
        account_status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (profileError) {
      console.warn('Warning updating public.profiles table:', profileError.message);
    } else {
      console.log('Successfully configured public.profiles with super_admin privileges.');
    }

    console.log('\nSUCCESS! Super Admin account is ready:');
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log('You can now log in at the ShopEasy Admin Portal.\n');
  } catch (err) {
    console.error('Failed to provision admin:', err.message || err);
    process.exit(1);
  }
}

provisionAdmin();
