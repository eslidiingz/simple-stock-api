// utils/plan/check_plan_status.ts
import { isAfter, addDays } from 'date-fns'
import prisma from '@/core/db/prisma'

export async function checkAndExpireTrial(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { plan: true },
  })

  if (!company || !company.plan || company.plan.code !== 'TRIAL') return

  const trialStart = company.created_at
  const trialEnd = addDays(trialStart, 7)
  const now = new Date()

  if (isAfter(now, trialEnd)) {
    // หมดช่วง Trial → ปรับแผนเป็น null หรือแผน FREE หากมี
    await prisma.company.update({
      where: { id: company.id },
      data: { plan_id: null }, // หรือเปลี่ยนเป็นแผน FREE ถ้ามี
    })
    console.log(`🔒 Company ${company.name} trial expired on ${trialEnd.toISOString()}`)
  }
}