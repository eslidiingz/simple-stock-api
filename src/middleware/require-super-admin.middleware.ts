// middleware/require-super-admin.middleware.ts
export const requireSuperAdmin = new Elysia()
  .guard({
    beforeHandle: ({ store, error }) => {
      const user = store.currentUser

      if (!user || user.user_type !== 'SUPER_ADMIN') {
        return error(StatusCodes.FORBIDDEN, {
          message: 'Permission denied: super admin only'
        })
      }
    }
  })