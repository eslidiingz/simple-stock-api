import { Elysia, t } from 'elysia'
import { ProductCategory } from './product-category.service'
import { CompanyCategory, Prisma } from '@prisma/client'
import { ExecuteFailed, fail, ok, ResponseFailed } from '@/core/utils/response'
import { StatusCodes } from 'http-status-codes'

export const productCategoryController = new Elysia({ prefix: '/product-categories' })
  .decorate('productCategoryService', new ProductCategory())
  .get('/all', async ({ productCategoryService }) => {
    const categories = await productCategoryService.getAll()

    return ok('Product categories has been fetched successfully', categories)
  })
  .get('', async ({ query, productCategoryService, store: { currentUser } }) => {
    let categories = []

    switch (currentUser?.user_type) {
      case 'SUPER_ADMIN':
        categories = await productCategoryService.get(query)
        break;

      // Role scope === 'COMPANY'
      default:
        categories = await productCategoryService.getAllByCompany(currentUser?.company.id, query)
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
  .post('/add-to-company', async ({ body: { category_id }, productCategoryService, store: { currentUser }, error }) => {
    const category = await productCategoryService.addCategoryToCompany(category_id, currentUser?.company.id)

    if (!category?.id) return error(category?.error.code, fail(category?.error))

    return ok('Product category has been added successfully', category)
  }, {
    body: t.Object({
      category_id: t.String()
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
  .delete('/:id', async ({ params: { id }, productCategoryService, store: { currentUser }, set, error }) => {
    const deleted = await productCategoryService.removeCategoryFromCompany(id, currentUser?.company.id)

    if (!deleted?.id) {
      return error(deleted?.code, fail(deleted?.error, deleted?.code, deleted?.error))
    }

    // set.status = StatusCodes.NO_CONTENT
    return ok('Product category has been deleted successfully', deleted)
  }, {
    params: t.Object({
      id: t.String()
    })
  })