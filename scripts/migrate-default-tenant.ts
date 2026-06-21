/**
 * Data Migration Script: Assign Default Tenant
 *
 * This script creates a default tenant and assigns all existing
 * patients and users to it. Run this after applying the Prisma
 * schema changes that add the Tenant model and tenantId fields.
 *
 * Usage:
 *   npx tsx scripts/migrate-default-tenant.ts
 *
 * This script is idempotent — it will not create duplicate tenants
 * or re-assign already-assigned records.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_TENANT = {
  name: 'Default Clinic',
  slug: 'default-clinic',
  plan: 'FREE',
  settings: {
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    patientNumberPrefix: 'CLINIC',
  },
}

async function main() {
  console.log('🏥 Starting default tenant migration...\n')

  // 1. Create or find default tenant
  let tenant = await prisma.tenant.findUnique({
    where: { slug: DEFAULT_TENANT.slug },
  })

  if (tenant) {
    console.log(`✅ Default tenant already exists: ${tenant.name} (${tenant.id})`)
  } else {
    tenant = await prisma.tenant.create({
      data: DEFAULT_TENANT,
    })
    console.log(`✅ Created default tenant: ${tenant.name} (${tenant.id})`)
  }

  // 2. Assign unassigned users to default tenant
  const unassignedUsers = await prisma.user.updateMany({
    where: { tenantId: null },
    data: { tenantId: tenant.id },
  })
  console.log(`✅ Assigned ${unassignedUsers.count} user(s) to default tenant`)

  // 3. Assign unassigned patients to default tenant
  const unassignedPatients = await prisma.patient.updateMany({
    where: { tenantId: null },
    data: { tenantId: tenant.id },
  })
  console.log(`✅ Assigned ${unassignedPatients.count} patient(s) to default tenant`)

  // 4. Summary
  const userCount = await prisma.user.count({ where: { tenantId: tenant.id } })
  const patientCount = await prisma.patient.count({ where: { tenantId: tenant.id } })

  console.log('\n📊 Migration Summary:')
  console.log(`   Tenant:   ${tenant.name} (${tenant.slug})`)
  console.log(`   Plan:     ${tenant.plan}`)
  console.log(`   Users:    ${userCount}`)
  console.log(`   Patients: ${patientCount}`)
  console.log('\n✅ Migration complete!')
}

main()
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
