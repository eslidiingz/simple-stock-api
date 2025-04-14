import { seedBanks } from './banks.seed'
import { seedMockupData } from './mockupData.seed'
import { seedPaymentTypes } from './payment_types.seed'
import { seedPlans } from './plans.seed'
import { seedProductCategory } from './product_category.seed'
import { seedRoles } from './role.seed'

async function main() {
  await seedBanks()
  await seedPaymentTypes()
  await seedPlans()
  await seedProductCategory()
  await seedRoles()
  // await seedRoles()
  // await seedUsers()

  await seedMockupData()
}

main()
  .then(() => {
    console.log('✅ Seed completed')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })