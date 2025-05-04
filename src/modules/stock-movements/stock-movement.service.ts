import { t } from 'elysia'
import prisma, { createPagination } from '../../core/db/prisma'
import { StockMovementType, type Prisma } from '@prisma/client'
import { Ordering, type QueryOptions } from "../../types/query.interface"

const adjust = t.Object({
  movementList: t.Array(t.Object({
    product_id: t.String(),
    quantity: t.Number(),
  }))
})

type AdjustDto = typeof adjust.static

const increaseStock = t.Array(t.Object({
  product_id: t.String(),
  quantity: t.Number(),
}))
export type IncreaseStock = typeof increaseStock.static

const decreaseStock = t.Array(t.Object({
  product_id: t.String(),
  quantity: t.Number(),
}))
export type DecreaseStock = typeof decreaseStock.static


interface Query extends QueryOptions {
  company_id?: string
}

export class StockMovement {
  async get(query?: Query) {
    const page: number = Number(query?.page) || 1
    const limit: number = Number(query?.limit) || 10
    const orderBy: string = query?.orderBy || 'created_at'
    const orderType: Ordering = query?.orderType || Ordering.DESC
    const skip: number = (page - 1) * limit

    const whereGetConditions: Prisma.StockMovementWhereInput = {
      company_id: {
        equals: query?.company_id || undefined
      }
    }

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: whereGetConditions,
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

  async adjust(adjustDto: AdjustDto, company_id: string) {
    const data: Prisma.StockMovementCreateManyInput[] = adjustDto.movementList.map(({ product_id, quantity }) => ({
      product_id,
      quantity,
      movement_type: 'STOCK_IN',
      company_id
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

  async decrease(decreaseStock: DecreaseStock, company_id: string) {
    const data: Prisma.StockMovementCreateManyInput[] = decreaseStock.map((product) => ({
      ...product,
      company_id,
      movement_type: StockMovementType.SALE
    }))

    const decreaseStockCreated = await prisma.stockMovement.createMany({ data })

    if (decreaseStockCreated?.count > 0) {
      const productUpdated = await prisma.$transaction(
        decreaseStock.map(({ product_id, quantity }) => prisma.product.update({
          where: { id: product_id },
          data: { stock: { decrement: quantity } }
        }))
      )
      return productUpdated
    }
  }

  async increase(increaseStock: IncreaseStock, movementType: StockMovementType, company_id: string) {
    const data: Prisma.StockMovementCreateManyInput[] = increaseStock.map((product) => ({
      ...product,
      company_id,
      movement_type: movementType
    }))

    const increaseStockCreated = await prisma.stockMovement.createMany({ data })

    if (increaseStockCreated?.count > 0) {
      const productUpdated = await prisma.$transaction(
        increaseStock.map(({ product_id, quantity }) => prisma.product.update({
          where: { id: product_id },
          data: { stock: { increment: quantity } }
        }))
      )
      return productUpdated
    }
  }
}