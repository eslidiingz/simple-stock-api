// src/modules/payment-types/payment-type.controller.ts
import Elysia from "elysia";
import { PaymentTypeService } from '../payment-types/payment-type.service';
import { ok } from "@/core/utils/response";

export const paymentTypeController = new Elysia({ prefix: '/payment-types' })
  .decorate('paymentTypeService', new PaymentTypeService())
  .get('', async ({ paymentTypeService }) => {
    const paymentTypes = await paymentTypeService.getAll()
    return ok('Payment types fetched successfully', paymentTypes)
  })
  .get('/active', async ({ paymentTypeService }) => {
    const paymentTypes = await paymentTypeService.getActive()
    return ok('Active payment types fetched successfully', paymentTypes)
  })