// src/core/db/middleware/softDelete.ts
import type { Prisma } from '@prisma/client'

export const softDeleteMiddleware: Prisma.Middleware = async (params, next) => {
  const action = params.action
  const model = params.model

  const readActions = ['findFirst', 'findMany', 'findUnique']

  if (readActions.includes(action)) {
    if (!params.args) params.args = {}
    if (!params.args.where) params.args.where = {}

    // ถ้า model นี้รองรับ deleted_at (โดยตรวจว่าฟิลด์ยังไม่ถูกตั้งค่าจาก caller)
    if ('deleted_at' in params.args.where === false) {
      params.args.where.deleted_at = null
    }
  } else if (action === 'delete') {
    params.action = 'update'
    params.args.data = { deleted_at: new Date() }
  }

  return next(params)
}

// prisma.$use(async (params, next) => {
// if (params.action === 'delete') {
//   params.action = 'update'
//   params.args.data = { deleted_at: new Date() }
// } else if (params.action === 'findMany' || params.action === 'findUnique') {

//   if (params.model !== 'StockMovement') {
//     params.args.where.deleted_at = null
//   }

// } else if (params.action === 'count') {
//   if (params.model !== 'StockMovement') {
//     params.args.where.deleted_at = null
//   }
// }

//   return next(params)
// })