import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { productController } from "./products/product.controller";
import { productCategoryController } from "./product-categories/product-category.controller";
import { authController } from "./auth/auth.controller";
import jwt from "@elysiajs/jwt";
import { StatusCodes } from "http-status-codes";
import { stockMovementController } from "./stock-movements/stock-movement.controller";

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .use(staticPlugin({
    assets: "public", // Serve files from the 'public' directory
    prefix: "/" // Access files via '/public/<filename>'
  }))
  .use(jwt({
    name: 'jwt',
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    secret: process.env.JWT_SECRET!,
    exp: '1h'
  }))
  .state({
    currentUser: {}
  })
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

          if (!profile)
            return error(StatusCodes.UNAUTHORIZED, {
              message: 'Unauthorized'
            })

          store.currentUser = profile
        }
      })
      .use([
        productCategoryController,
        productController,
        stockMovementController,
      ])

    return app
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
