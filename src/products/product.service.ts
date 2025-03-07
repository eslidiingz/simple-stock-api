import { t } from 'elysia'
import { Ordering, type QueryString } from '../interfaces/query.interface'

import prisma, { createPagination } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'
import { ProductCategory } from '../product-categories/product-category.service'
import { is } from '../../node_modules/@types/node/crypto.d';

const product = t.Object({
  name: t.String(),
  category_id: t.String(),
  price: t.Number({ default: 0 }),
  stock: t.Number({ default: 0 }),
  is_active: t.Boolean({ default: true })
})

type ProductProps = typeof product.static

interface Query extends QueryString {
  name?: string | undefined
  category_id?: string | undefined
  in_stock?: boolean | string | undefined
  is_active?: boolean | string | undefined
}

export class Product {
  async get(query: Query) {
    const page: number = Number(query?.page) || 1
    const limit: number = Number(query?.limit) || 10
    const orderBy: string = query?.orderBy || 'created_at'
    const orderType: Ordering = query?.orderType || Ordering.DESC
    const skip: number = (page - 1) * limit

    let queryIsActive: boolean | undefined;
    const hasQueryIsActive = query?.is_active !== undefined
    const queryIsActiveIsString = typeof query?.is_active === 'string'

    let queryInStock: boolean | undefined;
    const hasQueryInStock = query?.in_stock !== undefined
    const queryInStockIsString = typeof query?.in_stock === 'string'

    if (hasQueryIsActive && queryIsActiveIsString) {
      queryIsActive = query?.is_active === 'true'
        ? true
        : query?.is_active === 'false'
          ? false
          : undefined
    }

    if (hasQueryInStock && queryInStockIsString) {
      queryInStock = query?.in_stock === 'true'
        ? true
        : query?.in_stock === 'false'
          ? false
          : undefined
    }

    // Make where condition for reuse into prisma more than once
    const where: Prisma.ProductWhereInput = {
      name: {
        contains: query?.name,
        mode: 'insensitive'
      },
      category_id: {
        equals: query?.category_id || undefined
      },
      ...(queryInStock !== undefined && {
        stock: queryInStock === true ? { gt: 0 } : { lte: 0 }
      }),
      is_active: {
        equals: queryIsActive
      }
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          [orderBy]: orderType
        },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return createPagination({ data, page, limit, total })
  }

  async find(id: string) {
    return await prisma.product.findUnique({ where: { id }, include: { category: true } })
  }

  async create(product: ProductProps) {
    const category = await new ProductCategory().find(product.category_id)

    if (!category) return { error: 'Category not found' }

    const data = {
      ...product,
      code: this.generateCode(),
      ...(product?.is_active !== undefined && { is_active: product.is_active === 'true' ? true : false })
    }

    try {
      return await prisma.product.create({ data })
    } catch (error) {
      return error
    }
  }

  async update(id: string, product: ProductProps) {

    const data = {
      ...product,
      ...(product?.is_active !== undefined && { is_active: product.is_active === 'true' ? true : false })
    }

    return await prisma.product.update({ where: { id }, data })
  }

  async delete(id: string) {
    return await prisma.product.delete({ where: { id } })
  }

  private generateCode(): string {
    const characters = '0123456789';
    // const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

}

