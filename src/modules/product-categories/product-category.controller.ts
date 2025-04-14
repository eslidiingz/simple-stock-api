import { Elysia, t } from 'elysia'
import { ProductCategory } from './product-category.service'
import { Prisma } from '@prisma/client'

export const productCategoryController = new Elysia({ prefix: '/product-categories' })
  .decorate('productCategoryService', new ProductCategory())
  .get('', async ({ query, productCategoryService, store: { currentUser } }) => {
    let categories = []

    switch (currentUser?.user_type) {
      case 'SUPER_ADMIN':
        categories = await productCategoryService.get(query)
        break;

      // Role scope === 'COMPANY'
      default:
        categories = await productCategoryService.getAllByCompany(currentUser?.company.id)
        break;
    }

    return {
      success: true,
      message: 'Product categories has been fetched successfully',
      ...categories
    }
  })
  .get('/:id', async ({ params: { id }, productCategoryService }) => {
    return {
      success: true,
      message: 'Product category has been find successfully',
      productCategory: await productCategoryService.find(id)
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .post('', async ({ body, productCategoryService }) => {
    return {
      success: true,
      message: 'Product category has been created successfully',
      productCategory: await productCategoryService.create(body)
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
    })
  })
  .put('/:id', async ({ params: { id }, body, productCategoryService }) => {
    return {
      success: true,
      message: 'Product category has been updated successfully',
      productCategory: await productCategoryService.update(id, body)
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      name: t.String({ minLength: 1 }),
      is_active: t.Optional(t.Boolean())
    })
  })
  .delete('/:id', async ({ params: { id }, productCategoryService, error }) => {

    const deleted: Prisma.Category = await productCategoryService.delete(id)

    if (!deleted?.id) {
      return error(409, { success: false, error: deleted.error })
    }

    return {
      success: true,
      message: 'Product category has been deleted successfully',
      data: deleted
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })