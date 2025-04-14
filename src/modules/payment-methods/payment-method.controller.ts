// src/modules/payment/payment-method.controller.ts
import { Elysia, t } from 'elysia'
import { PaymentMethodService } from './payment-method.service'
import { ok, fail } from '@/core/utils/response'


export const paymentMethodController = new Elysia({ prefix: '/payment-methods' })
  .decorate('paymentMethodService', new PaymentMethodService())

  // GET /payment-methods (ของ user ปัจจุบัน)
  .get('', async ({ store, paymentMethodService }) => {
    const companyId = store.currentUser?.company.id
    const methods = await paymentMethodService.findAllByCompany(companyId)

    return ok('Payment methods fetched successfully', methods)
  })

  // GET /payment-methods/:id
  .get('/:id', async ({ params, store, paymentMethodService }) => {
    const userId = store.currentUser?.id
    const method = await paymentMethodService.findById(params.id, userId)
    if (!method) return fail('Not found', 'NOT_FOUND')
    return ok('Payment method fetched successfully', method)
  }, {
    params: t.Object({ id: t.String() })
  })

  // POST /payment-methods
  .post('', async ({ body, store, paymentMethodService }) => {
    const userId = store.currentUser?.id
    const created = await paymentMethodService.create(userId, body)
    return ok('Payment method created successfully', created)
  }, {
    body: t.Object({
      name: t.String(),
      payment_type_id: t.String(),
      bank_account_id: t.Optional(t.String()),
    })
  })

  // PATCH /payment-methods/:id
  .patch('/:id', async ({ params, body, store, paymentMethodService }) => {
    const userId = store.currentUser?.id
    const updated = await paymentMethodService.update(params.id, userId, body)
    return ok('Payment method updated successfully', updated)
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      payment_type_id: t.Optional(t.String()),
      bank_account_id: t.Optional(t.String())
    })
  })

  // DELETE /payment-methods/:id
  .delete('/:id', async ({ params, store, paymentMethodService }) => {
    const userId = store.currentUser?.id
    const deleted = await paymentMethodService.delete(params.id, userId)
    return ok('Payment method deleted successfully', deleted)
  }, {
    params: t.Object({ id: t.String() })
  })
