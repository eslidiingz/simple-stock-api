// src/modules/payment-types/payment-type.service.ts

import prisma from "@/core/db/prisma"

export class PaymentTypeService {
  async getAll() {
    return await prisma.paymentType.findMany()
  }

  async getActive() {
    return await prisma.paymentType.findMany({
      where: { is_active: true },
    })
  }
}