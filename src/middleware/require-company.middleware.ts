// middleware/require-company.middleware.ts
import { Elysia } from 'elysia'
import { StatusCodes } from 'http-status-codes'

export const requireCompanyUser = new Elysia()
  .guard({
    beforeHandle: ({ store, error }) => {
      const user = store.currentUser

      if (!user || user.user_type !== 'COMPANY') {
        return error(StatusCodes.FORBIDDEN, {
          message: 'Permission denied: company access only'
        })
      }
    }
  })