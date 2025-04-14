import prisma, { createPagination } from "@/core/db/prisma";
import { Ordering, type QueryOptions } from "@/types/query.interface";
import type { Prisma } from "@prisma/client";
import { OrderDetailService } from "../order_details/order_detail.service";
import { format } from "date-fns";


interface GetOrderDetailsOptions extends QueryOptions {
  company_id?: string
}

export class OrderService {
  #orderDetailService

  constructor() {
    this.#orderDetailService = new OrderDetailService()
  }

  async get(options?: GetOrderDetailsOptions) {
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

  async create(data: Prisma.OrderCreateInput) {
    const { items, ...orderToCreate } = data

    orderToCreate.code = await this.generateOrderCode(orderToCreate.company_id)
    console.log(orderToCreate)
    const orderCreated = await prisma.order.create({ data: orderToCreate })

    if (orderCreated?.id) {
      const orderDetailToCreate: Prisma.OrderDetailCreateManyInput[] = items.map((item: Prisma.OrderDetailSelect) => {
        const { id, ...baseItem } = item

        const itemToCreate = {
          ...baseItem,
          order_id: orderCreated.id,
          product_id: item.id,
          total: item.price * item.quantity
        }

        return itemToCreate
      })

      const orderDetailsCreated = await this.#orderDetailService.create(orderDetailToCreate, orderToCreate.company_id)

      if (orderDetailsCreated?.count) {
        await prisma.$disconnect()
        return orderCreated;
      }
    }
  }

  /**
   * Generate a unique order code for a company
   * Format: ORD<companyShortCode><YYMM><runningNumber>
   * Example: ORDACME2504-00001
   */
  private async generateOrderCode(company_id: string) {
    const today = new Date()
    const dateCode = format(today, 'yyMM')

    // Count this month's orders for that company
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    const company = await prisma.company.findFirst({ where: { id: company_id } })

    const companyShortCode = company?.short_code ? company.short_code : company?.name.replaceAll(' ', '').substr(0, 5).toUpperCase()

    const count = await prisma.order.count({
      where: {
        company_id,
        created_at: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
    })

    const runningNumber = String(count + 1).padStart(5, '0')



    return `ORD${companyShortCode.toUpperCase()}${dateCode}${runningNumber}`
  }

}