import { Elysia, t } from 'elysia'
import { OrderService } from './order.service'
import { ok } from '@/core/utils/response'
import { OrderPaymentStatus, OrderStatus, type Prisma } from '@prisma/client'

export const orderController = new Elysia({ prefix: '/orders' })
  .decorate('orderService', new OrderService())
  .get('', async ({ query, orderService, store: { currentUser } }) => {
    const orders = await orderService.get({ ...query, company_id: currentUser?.company.id })

    return ok('Orders fetched successfully', orders.data, orders.pagination)
  })
  .get('/:id', async ({ params, orderService, store: { currentUser } }) => {

    const order = await orderService.find(params.id, currentUser?.company.id)

    return ok('Order fetched successfully', order)
  })
  .post('', async ({ body, orderService, store: { currentUser } }) => {
    const productCount = body.items.length
    const productContItems = body.items.reduce((total, item) => total + item.quantity, 0)
    const subTotal = body.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    const discount = 0
    const shipping = body.paymentMethod.fee
    const grandTotal = subTotal - discount + shipping

    const orderToCreate: Prisma.OrderCreateInput = {
      company_id: currentUser?.company.id as string,
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

    return ok('Order created successfully', order)

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
  .put('/:id', async ({ params: { id }, body: { payment_status, status, tracking_code }, orderService, store: { currentUser } }) => {
    const data = { payment_status, status, tracking_code }

    const updated = await orderService.update(id, data)

    return ok('Order updated successfully', updated)
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      payment_status: t.Enum(OrderPaymentStatus),
      status: t.Enum(OrderStatus),
      tracking_code: t.Nullable(t.String()),
    })
  })
  .delete('/:id', async ({ params: { id }, orderService, store: { currentUser } }) => {

    const deleted = await orderService.delete(id, currentUser?.company.id)

    return ok('Order deleted successfully', deleted)
  }, {
    params: t.Object({ id: t.String() })
  })
