import { PrismaClient } from "@prisma/client";

export type Prisma = PrismaClient;
export type PrismaPromise<T> = Promise<T>
export type PrismaPagination<T> = { data: T[], pagination: { page: number, limit: number, total: number, pages: number } }
export type PrismaCreatePaginate<T> = { data: T[], page: number, limit: number, total: number }

const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
  if (params.action === 'delete') {
    params.action = 'update'
    params.args.data = { deleted_at: new Date() }
  } else if (params.action === 'findMany' || params.action === 'findUnique') {

    if (params.model !== 'StockMovement') {
      params.args.where.deleted_at = null
    }

  } else if (params.action === 'count') {
    if (params.model !== 'StockMovement') {
      params.args.where.deleted_at = null
    }
  }

  return next(params)
})


export function createPagination<T>({ data, page, limit, total }: {
  data: T[],
  page: number,
  limit: number,
  total: number,
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