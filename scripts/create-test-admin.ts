/**
 * Creates a dedicated test admin user for automated testing.
 * Usage: npx tsx scripts/create-test-admin.ts
 *
 * TODO: migrer vers POST /auth/register + PATCH /user/:id (role=admin) via l'API NestJS.
 * Exemple :
 *   POST http://localhost:3000/auth/register
 *   { "name": "Test Admin", "email": "test-admin@chanoatech.com", "password": "TestAdmin!2026" }
 *   puis PATCH /user/:id  { "role": "admin" } avec un token super-admin.
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const TEST_EMAIL    = 'test-admin@chanoatech.com'
const TEST_PASSWORD = 'TestAdmin!2026'
const API_URL       = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3201'

async function main() {
  console.log('Création du compte admin de test via l\'API NestJS…')

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Admin',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  })

  const body = await res.json() as { user?: { id: string }; message?: string }

  if (!res.ok) {
    if (res.status === 409) {
      console.log(`L'utilisateur ${TEST_EMAIL} existe déjà.`)
    } else {
      console.error('Erreur lors de la création :', body.message ?? res.status)
      process.exit(1)
    }
  } else {
    console.log(`Utilisateur créé : ${TEST_EMAIL} (id: ${body.user?.id ?? '?'})`)
  }

  console.log('\nCompte admin de test :')
  console.log(`   Email    : ${TEST_EMAIL}`)
  console.log(`   Password : ${TEST_PASSWORD}`)
  console.log('\nNote : attribuez le rôle "admin" manuellement via PATCH /user/:id.')
}

main().catch(console.error)
