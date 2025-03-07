import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { productController } from "./products/product.controller";
import { productCategoryController } from "./product-categories/product-category.controller";
import { authController } from "./auth/auth.controller";
import jwt from "@elysiajs/jwt";

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .use(staticPlugin({
    assets: "public", // Serve files from the 'public' directory
    prefix: "/" // Access files via '/public/<filename>'
  }))
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET as string
  }))
  .group('/api', (app) => app.use([
    authController,
    productCategoryController,
    productController
  ]))


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
