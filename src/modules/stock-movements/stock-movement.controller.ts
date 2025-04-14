import { Elysia, t } from "elysia";
import { StockMovement } from "./stock-movement.service";

export const stockMovementController = new Elysia({ prefix: '/stock-movements' })
  .decorate('stockMovementService', new StockMovement)
  .get('', async ({ store: { currentUser }, query, stockMovementService }) => {

    const stockMovements = await stockMovementService.get({ ...query, company_id: currentUser?.company.id })

    return {
      success: true,
      message: 'Stock movements has been fetched successfully',
      ...stockMovements
    }
  })
  .post('/import', async ({ store: { currentUser }, body, stockMovementService }) => {
    const adjustment = await stockMovementService.adjust(body, currentUser?.company.id)

    return {
      success: true,
      message: 'Stock movement has been created successfully',
      adjustment
    }
  }, {
    body: t.Object({
      movementList: t.Array(t.Object({
        product_id: t.String(),
        quantity: t.Number(),
      }))
    })
  })