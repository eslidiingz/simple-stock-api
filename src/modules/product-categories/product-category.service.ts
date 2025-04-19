import { t } from "elysia"
import type { Prisma } from "@prisma/client"
import { Ordering, type QueryOptions } from "../../types/query.interface"
import prisma, { createPagination } from "../../core/db/prisma"
import { StatusCodes } from "http-status-codes"


const productCategory = t.Object({
  name: t.String(),
})

type ProductCategoryProps = typeof productCategory.static

interface Query extends QueryOptions {
  name?: string
  is_active?: boolean
}

interface GetCategoriesOptions extends QueryOptions {
  name?: string
  is_active?: boolean
}

export class ProductCategory {
  async getAll() {
    return await prisma.productCategory.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        name: true
      }
    })
  }

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

    const where: Prisma.ProductCategoryWhereInput = {
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

  async getAllByCompany(companyId: string, options?: GetCategoriesOptions) {
    const page: number = Number(options?.page) || 1
    const limit: number = Number(options?.limit) || 10
    const orderBy: string = options?.orderBy || 'name'
    const orderType: string = options?.orderType || Ordering.ASC
    const skip = (page - 1) * limit

    const whereGetConditions: Prisma.CompanyCategoryWhereInput = {
      company_id: companyId,
      is_active: true,
      category: {
        name: options?.name ? { contains: options?.name, mode: 'insensitive' } : undefined,
      },
    }

    const [data, total] = await Promise.all([
      prisma.companyCategory.findMany({
        where: whereGetConditions,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              _count: {
                select: {
                  products: true
                }
              }

            },
          },
        },
        orderBy: {
          category: {
            [orderBy]: orderType
          }
        },
        skip,
        take: limit
      }),
      prisma.companyCategory.count({
        where: whereGetConditions
      })
    ])

    const categories = data.map(entry => ({ ...entry.category, is_active: entry.is_active }))

    return createPagination({ data: categories, page, limit, total })
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

  async addCategoryToCompany(category_id: string, company_id: string) {
    try {
      return await prisma.companyCategory.upsert({
        where: { company_id_category_id: { company_id, category_id } },
        update: { is_active: true, deleted_at: null },
        create: { category_id, company_id }
      })
    } catch (error) {
      return {
        error: { message: 'Cannot add, Category already added to company', code: StatusCodes.CONFLICT, details: error },
      }
    }
  }

  async findCategoryInCompany(category_id: string, company_id: string) {
    return await prisma.companyCategory.findUnique({ where: { company_id_category_id: { company_id, category_id } } })
  }

  async removeCategoryFromCompany(category_id: string, company_id: string) {
    const category = await this.findCategoryInCompany(category_id, company_id)

    if (!category) return { error: 'Category not found in company', code: StatusCodes.NOT_FOUND }

    return await prisma.companyCategory.delete({ where: { company_id_category_id: { company_id, category_id } } })
  }
}