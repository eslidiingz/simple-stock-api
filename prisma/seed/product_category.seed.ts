// prisma/seed/product_category.seed.ts
import prisma from '@/core/db/prisma'

export const seedProductCategory = async () => {
  const categories = [
    {
      id: 'be555bd5-f477-4fdc-a516-47f85e0046e9',
      name: 'Uncategory',
      is_shared: true,
      is_active: true
    },
    {
      id: '6ba8d79e-f051-4857-ab6f-ea4fad1efe2b',
      name: 'Clothes',
      is_shared: true,
      is_active: true
    },
    {
      id: 'a4cd7bf9-0f37-4493-b36d-b7436534fa4d',
      name: 'Food',
      is_shared: true,
      is_active: true
    }
  ]

  for (const category of categories) {
    await prisma.productCategory.upsert({
      where: { id: category.id },
      update: {},
      create: category
    })
  }

  console.log(`✅ Seeded ${categories.length} categories`)
}

