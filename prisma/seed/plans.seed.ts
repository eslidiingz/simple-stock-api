// seed/seed.plans.ts
import prisma from '@/core/db/prisma'

export const seedPlans = async () => {
  const plans = [
    {
      id: '80920f1a-65bc-45b8-a8ac-62914c78b623',
      code: 'TRIAL',
      name: 'Trial Plan',
      description: 'ทดลองใช้งานฟรี 7 วัน',
      max_categories: 3,
      max_users: 1,
      is_active: true,
      is_default: true, // สำหรับผู้ใช้ใหม่
      is_recommend: false,
    },
    {
      id: 'ff1e4e90-4644-418b-b605-c425edcf7663',
      code: 'BASIC',
      name: 'Basic Plan',
      description: 'สำหรับธุรกิจเริ่มต้น ใช้งานฟีเจอร์พื้นฐาน',
      max_categories: 5,
      max_users: 3,
      is_active: true,
      is_default: false,
      is_recommend: false,
    },
    {
      id: '67c834f9-b02f-4095-aa88-dd96c3229b2f',
      code: 'STANDARD',
      name: 'Standard Plan',
      description: 'เหมาะกับธุรกิจขนาดกลาง รองรับผู้ใช้มากขึ้น',
      max_categories: 20,
      max_users: 10,
      is_active: true,
      is_default: false,
      is_recommend: true, // ✅ แนะนำแผนนี้
    },
    {
      id: '2b47cfc5-2fed-4768-9f7d-c80c82dc01f6',
      code: 'PRO',
      name: 'Professional Plan',
      description: 'สำหรับธุรกิจขนาดใหญ่หรือทีมงานมืออาชีพ',
      max_categories: 50,
      max_users: 30,
      is_active: true,
      is_default: false,
      is_recommend: false,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {},
      create: plan,
    })
  }

  console.log(`✅ Seeded ${plans.length} plans`)
}
