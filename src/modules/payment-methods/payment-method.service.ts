// src/modules/payment/payment-method.service.ts

import { t } from "elysia"
import prisma from '@/core/db/prisma'
import type { PrismaClient, Prisma } from '@prisma/client'

const updatePaymentMethodType = t.Object({
  id: t.String(),
  fee: t.Number(),
  note: t.Nullable(t.String()),
})

type UpdatePaymentMethod = typeof updatePaymentMethodType.static

export class PaymentMethodService {

  async findAllByCompany(company_id: string) {
    return prisma.paymentMethod.findMany({
      where: {
        company_id,
        deleted_at: null,
      },
      include: {
        payment_type: true,
        // bank_account: true,
      },
      orderBy: { created_at: 'desc' },
    })
  }

  async findById(id: string, company_id: string) {
    return prisma.paymentMethod.findFirst({
      where: {
        id,
        company_id,
        deleted_at: null,
      },
      include: {
        payment_type: true,
        // bank_account: true,
      },
    })
  }

  async create(userId: string, data: Prisma.PaymentMethodCreateInput) {
    return prisma.paymentMethod.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    })
  }

  async update(id: string, userId: string, data: Prisma.PaymentMethodUpdateInput) {
    return prisma.paymentMethod.update({
      where: { id },
      data,
    })
  }

  async delete(id: string, userId: string) {
    return prisma.paymentMethod.update({
      where: { id },
      data: { deleted_at: new Date() },
    })
  }

  async createDefaultPaymentMethods(company_id: string) {
    const data: Prisma.PaymentMethodCreateManyInput[] = [
      {
        company_id,
        fee: 0,
        note: 'ฟรีค่าธรรมเนียม',
        is_protected: true,
        is_default: true,
        payment_type_id: '2dd2d2dd-d83b-4e03-aad1-ef81c7e04e0d',
      }, {
        company_id,
        fee: 50,
        note: 'คิดค่าธรรมเนียมเพิ่ม 50 บาท',
        is_protected: true,
        is_default: true,
        payment_type_id: 'eebaff1d-67fa-4469-8db1-cf549a03452c',
      }
    ]

    try {
      await prisma.paymentMethod.createMany({ data })
    } catch (error) {
      console.log(error)
    }
  }

  async updatePaymentMethods(updatePaymentMethods: UpdatePaymentMethod[], company_id: string) {
    return await prisma.$transaction(
      updatePaymentMethods.map(({ id, fee, note }) => prisma.paymentMethod.update({
        where: { id, company_id },
        data: { fee, note },
      }))
    )
  }
}