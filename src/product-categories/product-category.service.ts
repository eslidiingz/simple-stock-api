import { t } from "elysia"
import type { Prisma } from "@prisma/client"
import { Ordering, type QueryString } from "../interfaces/query.interface"
import prisma, { createPagination } from "../../lib/prisma"

const productCategory = t.Object({
  name: t.String(),
})

type ProductCategoryProps = typeof productCategory.static

interface Query extends QueryString {
  name?: string
  is_active?: boolean
}

export class ProductCategory {
  async get(query?: Query) {
    const page: number = Number(query?.page) || 1
    const limit: number = Number(query?.limit) || 10
    const orderBy: string = query?.orderBy || 'created_at'
    const orderType: Ordering = query?.orderType || Ordering.DESC
    const skip: number = (page - 1) * limit

    let queryIsActive: boolean | undefined;
    const hasQueryIsActive = query?.is_active !== undefined
    if (hasQueryIsActive) {
      queryIsActive = query?.is_active === 'true' ? true : false
    }

    const where: Prisma.CategoryWhereInput = {
      name: {
        contains: query?.name,
        mode: 'insensitive'
      },
      is_active: {
        equals: queryIsActive
      }
    }

    const [data, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: {
          [orderBy]: orderType
        },
        skip,
        take: limit
      }),
      prisma.productCategory.count({ where })
    ])

    return createPagination({ data, page, limit, total })
  }

  async find(id: string) {
    return await prisma.productCategory.findUnique({
      where: { id }, include: {
        _count: {
          select: {
            products: true
          }
        }
      },
    })
  }

  async create(productCategory: ProductCategoryProps) {

    const data = { ...productCategory, name: productCategory.name }

    return await prisma.productCategory.create({ data })
  }

  async update(id: string, productCategory: ProductCategoryProps) {
    return await prisma.productCategory.update({ where: { id }, data: productCategory })
  }

  async delete(id: string) {
    const category = await this.find(id)

    if (!category) return { error: 'Category not found' }
    if (category?._count?.products > 0) return { error: 'Can\'t delete category has products' }

    return await prisma.productCategory.delete({ where: { id } })
  }
}