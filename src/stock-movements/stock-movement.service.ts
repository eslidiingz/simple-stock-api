import { t } from 'elysia'
import prisma, { createPagination } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'
import { Ordering, type QueryString } from "../interfaces/query.interface"

const adjust = t.Object({
  movementList: t.Array(t.Object({
    product_id: t.String(),
    quantity: t.Number(),
  }))
})

type AdjustDto = typeof adjust.static

interface Query extends QueryString {

}

export class StockMovement {
  async get(query?: Query) {
    const page: number = Number(query?.page) || 1
    const limit: number = Number(query?.limit) || 10
    const orderBy: string = query?.orderBy || 'created_at'
    const orderType: Ordering = query?.orderType || Ordering.DESC
    const skip: number = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        include: {
          product: true
        },
        orderBy: {
          [orderBy]: orderType
        },
        skip,
        take: limit
      }),
      prisma.stockMovement.count()
    ])

    return createPagination({ data, page, limit, total })
  }

  async adjust(adjustDto: AdjustDto) {

    const data: Prisma.StockMovementCreateManyInput[] = adjustDto.movementList.map(({ product_id, quantity }) => ({
      product_id,
      quantity,
      movement_type: 'stock_in',
    }))

    const adjustment = await prisma.stockMovement.createMany({ data })

    if (adjustment?.count > 0) {

      const stockUpdated = await prisma.$transaction(
        adjustDto.movementList.map(({ product_id, quantity }) => prisma.product.update({
          where: { id: product_id },
          data: { stock: { increment: quantity } }
        }))
      )

      if (stockUpdated) {

        prisma.$disconnect()

        return adjustDto
      }
    }
  }
}