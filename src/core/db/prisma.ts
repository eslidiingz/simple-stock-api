// src/core/db/prisma.ts
import { PrismaClient } from '@prisma/client'
import { softDeleteMiddleware } from './middleware/softDelete'

export type Prisma = PrismaClient
export type PrismaPromise<T> = Promise<T>
export type PrismaPagination<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
export type PrismaCreatePaginate<T> = {
  data: T[]
  page: number
  limit: number
  total: number
}

const rawPrisma = new PrismaClient()

rawPrisma.$use(softDeleteMiddleware)

const prisma = rawPrisma.$extends({
  result: {
    paymentMethod: {
      fee: {
        needs: {},
        compute(payment) {
          return Number(payment.fee)
        },
      },
    },
    product: {
      price: {
        needs: {},
        compute(product) {
          return Number(product.price)
        }
      }
    },
    order: {
      sub_total: {
        needs: {},
        compute(order) {
          return Number(order.sub_total)
        }
      },
      discount: {
        needs: {},
        compute(order) {
          return Number(order.discount)
        }
      },
      shipping: {
        needs: {},
        compute(order) {
          return Number(order.shipping)
        }
      },
      grand_total: {
        needs: {},
        compute(order) {
          return Number(order.grand_total)
        }
      }
    }
  },
})

export function createPagination<T>({ data, page, limit, total }: {
  data: T[]
  page: number
  limit: number
  total: number
}): PrismaPagination<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export default prisma