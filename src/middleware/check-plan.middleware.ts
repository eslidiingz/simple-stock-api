// middleware/check-plan.middleware.ts
import { Elysia } from 'elysia'
import { StatusCodes } from 'http-status-codes'
import { checkAndExpireTrial } from '@/utils/plan/check_plan_status'
import prisma from '@/core/db/prisma'

export const checkPlanMiddleware = new Elysia()
  .derive(async ({ store }) => {
    const currentUser = store.currentUser
    if (!currentUser?.company_id) {
      return {
        companyPlan: null
      }
    }

    // ตรวจสอบแผนหมดอายุ (เช่น TRIAL)
    await checkAndExpireTrial(currentUser.company_id)

    // ดึงข้อมูลแผนล่าสุดของบริษัท
    const company = await prisma.company.findUnique({
      where: { id: currentUser.company_id },
      include: { plan: true },
    })

    return {
      companyPlan: company?.plan || null
    }
  })
  .guard({
    beforeHandle: ({ companyPlan, error }) => {
      if (!companyPlan) {
        return error(StatusCodes.FORBIDDEN, {
          success: false,
          message: 'กรุณาเลือกแพ็กเกจเพื่อใช้งานระบบต่อ'
        })
      }
    }
  })