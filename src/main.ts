// import 'dotenv/config'
import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { staticPlugin } from "@elysiajs/static";
import { cors } from '@elysiajs/cors'
import { jwtPlugin } from "./core/config/jwt";
import { StatusCodes } from "http-status-codes";

import { authController } from "./modules/auth/auth.controller";
import { privateControllers } from "./modules";
import { checkPlanMiddleware } from "./middleware/check-plan.middleware";
import { user } from './user';
import prisma from "./core/db/prisma";

const app = new Elysia()
  .use(swagger({
    documentation: {
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'Bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  }))
  .use(cors())
  .use(staticPlugin({
    assets: "public", // Serve files from the 'public' directory
    prefix: "/" // Access files via '/public/<filename>'
  }))
  .use(jwtPlugin)
  .state({
    currentUser: {}
  })
  .get('/', () => ({ status: "ok", version: "1.0.0" }))
  .group('/api', (app) => {
    app
      .use(authController)
      .derive(({ headers }) => {
        const auth = headers.authorization

        return {
          bearer: auth?.startsWith('Bearer ')
            ? auth.slice(7)
            : null
        }
      })
      .guard({
        beforeHandle: async ({ bearer, jwt, error, store }) => {
          const profile = await jwt.verify(bearer || '')

          if (!profile) {
            return error(StatusCodes.UNAUTHORIZED, {
              message: 'Unauthorized'
            })
          }

          const user = await prisma.user.findFirst({
            where: { id: profile.id },
            include: { role: true }
          })

          if (!user || !user.role) {
            return error(StatusCodes.FORBIDDEN, {
              message: 'User or role not found'
            })
          }

          const user_type = user?.role?.scope
          let is_owner = false;
          let company = null


          if (user_type === 'COMPANY') {
            const company_user = await prisma.companyUser.findFirst({
              where: { user_id: user.id },
              include: { company: true }
            })

            is_owner = company_user?.is_owner || false
            company = company_user?.company
          }

          const currentUser = {
            ...profile,
            user_type,
            is_owner,
            company,
          }

          store.currentUser = currentUser
        }
      })
      // .use(checkPlanMiddleware)
      .use(privateControllers)

    return app
  })
  .onError(({ error, code }) => {
    console.error(`[${code}]`, error)

    if (code === 'NOT_FOUND') {
      return { status: 404, message: 'Endpoint not found' }
    }

    return {
      status: 500,
      message: 'Something went wrong',
      detail: error.message,
    }
  })


  // .onError(({ error, code }) => {
  //   if (code === 'NOT_FOUND') return 'Not Found :('

  //   console.error(error)
  // })
  // .use(user)
  // .use(note)
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
