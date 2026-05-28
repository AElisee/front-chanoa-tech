/**
 * Creates a dedicated test admin user for automated testing.
 * Usage: npx tsx scripts/create-test-admin.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const TEST_EMAIL = 'test-admin@chanoatech.com'
const TEST_PASSWORD = 'TestAdmin!2026'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Check if user already exists
  const { data: list } = await supabase.auth.admin.listUsers()
  const existing = list?.users.find((u) => u.email === TEST_EMAIL)

  let userId: string

  if (existing) {
    console.log(`User ${TEST_EMAIL} already exists (${existing.id}). Updating password…`)
    await supabase.auth.admin.updateUserById(existing.id, { password: TEST_PASSWORD })
    userId = existing.id
  } else {
    console.log(`Creating user ${TEST_EMAIL}…`)
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true, // skip email verification
    })
    if (error || !data.user) {
      console.error('Create user failed:', error)
      process.exit(1)
    }
    userId = data.user.id
  }

  // Ensure profile exists with role=admin
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: TEST_EMAIL,
      full_name: 'Test Admin',
      role: 'admin',
    })

  if (profileError) {
    console.error('Upsert profile failed:', profileError)
    process.exit(1)
  }

  console.log('\n✅ Test admin ready:')
  console.log(`   Email:    ${TEST_EMAIL}`)
  console.log(`   Password: ${TEST_PASSWORD}`)
  console.log(`   Role:     admin`)
  console.log(`   User ID:  ${userId}`)
}

main().catch(console.error)
