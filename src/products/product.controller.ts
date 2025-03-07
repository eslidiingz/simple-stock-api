import { Elysia, file, t } from 'elysia'
import { Product } from './product.service';
import { deleteFile, generateFilename, uploadFile } from '../../lib/fileManager'
import { MB } from '../../constant/file'

export const productController = new Elysia({ prefix: '/products' })
  .decorate('productService', new Product())
  .get('', async ({ query, productService }) => {
    const products = await productService.get(query)

    return {
      success: true,
      message: 'Products has been fetched successfully',
      ...products
    }
  })
  .get('/:id', async ({ params: { id }, productService }) => {
    return {
      success: true,
      message: 'Product has been find successfully',
      product: await productService.find(id)
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .post('', async ({ body, productService, error }) => {
    let data = {
      ...body,
      price: Number(body.price),
      ...(body?.stock) && {
        stock: Number(body.stock)
      }
    }

    if (body?.image) {
      const uploaded = await uploadFile('products', body.image, true)
      data = { ...data, image: uploaded.imagePath, thumbnail: uploaded.thumbPath }
    }


    const created: Prisma.Product = await productService.create(data)

    if (!created?.id) {
      if (data?.image)
        await deleteFile(data.image)

      if (data?.thumbnail)
        await deleteFile(data.thumbnail)

      return error(422, { success: false, error: created.error })
    }

    return {
      success: true,
      message: 'Product has been created successfully',
      data: created
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      description: t.Optional(t.String({ minLength: 0 })),
      category_id: t.String({ minLength: 1 }),
      price: t.String({ default: "0" }),
      stock: t.Optional(t.String({ default: "0" })),
      image: t.Optional(t.File({ format: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'], max: 2 * MB })),
      is_active: t.Optional(t.String()),
    })
  })
  .put('/:id', async ({ body, params: { id }, productService }) => {
    return {
      success: true,
      message: 'Product has been updated successfully',
      product: await productService.update(id, body)
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      description: t.Optional(t.String({ minLength: 0 })),
      category_id: t.String({ minLength: 1 }),
      price: t.String({ default: "0" }),
      stock: t.Optional(t.String({ default: "0" })),
      image: t.Optional(t.File({ format: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'], max: 2 * MB })),
      is_active: t.Optional(t.String()),
    }),
    params: t.Object({
      id: t.String()
    })
  })
  .delete('/:id', async ({ params: { id }, productService }) => {
    return {
      success: true,
      message: 'Product has been deleted successfully',
      product: productService.delete(id)
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })