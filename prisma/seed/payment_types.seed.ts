// prisma/seed/payment-types.seed.ts
import prisma from '@/core/db/prisma'
import { PrismaClient } from '@prisma/client'

export const seedPaymentTypes = async () => {
  const paymentTypes = [
    {
      id: "2dd2d2dd-d83b-4e03-aad1-ef81c7e04e0d",
      code: 'bank_transfer',
      name: 'โอนเงินผ่านธนาคาร (Bank Transfer)',
      is_active: true,
      is_protected: true,
    },
    {
      id: "eebaff1d-67fa-4469-8db1-cf549a03452c",
      code: 'cod',
      name: 'เก็บเงินปลายทาง (Cash on Delivery)',
      is_active: true,
      is_protected: true,
    },
    {
      id: "1fdf9c7f-0f43-4eb3-8343-76d535eca23e",
      code: 'credit_card',
      name: 'บัตรเครดิต/เดบิต (Credit/Debit Card)',
      is_active: true,
      is_protected: false,
    },
    {
      id: "80159627-7139-47c9-b558-20c4910f24aa",
      code: 'ewallet',
      name: 'กระเป๋าเงินอิเล็กทรอนิกส์ (E-Wallet)',
      is_active: true,
      is_protected: false,
    },
  ]

  for (const type of paymentTypes) {
    await prisma.paymentType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    })
  }

  console.log(`✅ Seeded ${paymentTypes.length} payment types`)
}
