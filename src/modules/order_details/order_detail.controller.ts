import { Elysia, t } from 'elysia'
import { OrderService } from './order.service'
import { ok } from '@/core/utils/response'

export const orderController = new Elysia({ prefix: '/orders' })
  .decorate('orderService', new OrderService())
  .get('', async ({ orderService, store: { currentUser } }) => {
    const orders = await orderService.get({ company_id: currentUser?.company.id })

    return ok('Orders fetched successfully', orders.data, orders.pagination)
  })
  .post('', async ({ body, orderService, store: { currentUser } }) => {
    const productCount = body.items.length
    const productContItems = body.items.reduce((total, item) => total + item.quantity, 0)
    const subTotal = body.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    const discount = 0
    const shipping = body.paymentMethod.fee
    const grandTotal = subTotal - discount + shipping

    const orderToCreate = {
      company_id: currentUser?.company.id,
      product_count: productCount,
      product_count_items: productContItems,
      sub_total: subTotal,
      discount,
      shipping,
      grand_total: grandTotal,
      receiver_name: body.customer.receiver,
      receiver_phone: body.customer.phone,
      shipping_address: body.shippingAddress,
      note: body?.note,
      payment_code: body.paymentMethod?.payment_type.code,
      items: body.items
    }

    const order = await orderService.create(orderToCreate)
  }, {
    body: t.Object({
      items: t.Array(t.Object({
        id: t.String(),
        category_id: t.String(),
        code: t.String(),
        name: t.String(),
        description: t.Nullable(t.String()),
        price: t.Number(),
        quantity: t.Number(),
      })),
      paymentMethod: t.Object({
        fee: t.Number(),
        payment_type: t.Object({
          code: t.String()
        })
      }),
      customer: t.Object({
        receiver: t.String(),
        phone: t.String(),
      }),
      shippingAddress: t.String(),
      note: t.Optional(t.String())
    })
  })
