import prisma, { createPagination } from "@/core/db/prisma";
import { Ordering, type QueryOptions } from "@/types/query.interface";
import { StockMovementType, type Prisma } from "@prisma/client";
import { DecreaseStock, StockMovement } from "../stock-movements/stock-movement.service";

interface GetOrdersOptions extends QueryOptions {
  company_id?: string
}



export class OrderDetailService {
  #stockMovementService
  constructor() {
    this.#stockMovementService = new StockMovement()
  }

  async get(options?: GetOrdersOptions) {
    const page = options?.page || 1
    const limit = options?.limit || 10
    const orderBy = options?.orderBy || 'created_at'
    const orderType = options?.orderType || Ordering.DESC
    const skip = (page - 1) * limit

    const whereGetConditions: Prisma.OrderWhereInput = {
      company_id: options?.company_id || undefined
    }

    // return await prisma.order.findMany({
    //   where: whereGetConditions,
    //   include: {
    //     company: true,
    //     // order_items: {
    //     //   include: {
    //     //     product: true
    //     //   }
    //     // }
    //   },
    //   orderBy: {
    //     [orderBy]: orderType
    //   }
    // })

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where: whereGetConditions,
        include: {
          company: true,
          // order_items: {
          //   include: {
          //     product: true
          //   }
          // }
        },
        orderBy: {
          [orderBy]: orderType
        },
        skip,
        take: limit
      }),
      prisma.order.count({
        where: whereGetConditions
      })
    ])

    return createPagination({ data, page, limit, total })
  }

  async create(data: Prisma.OrderDetailCreateManyInput[], company_id: string) {
    try {
      const orderDetailsCreated = await prisma.orderDetail.createMany({ data })

      if (orderDetailsCreated?.count) {

        const stockToDecrease: DecreaseStock = data.map(({ product_id, quantity }) => ({
          product_id,
          quantity
        }))

        const stockDecreased = await this.#stockMovementService.decrease(stockToDecrease, company_id)

        if (stockDecreased) {
          return orderDetailsCreated;
        }
      }

    } catch (error) {
      console.log(`Failed to create order detail: ${error}`)
      return error
    }
  }

  async delete(id: string, company_id: string) {
    const deleted = await prisma.orderDetail.delete({ where: { id } })

    if (deleted?.id) {
      await this.#stockMovementService.increase([{ product_id: deleted.product_id, quantity: deleted.quantity }], StockMovementType.ADJUSTMENT, company_id)
    }

    return deleted
  }
}