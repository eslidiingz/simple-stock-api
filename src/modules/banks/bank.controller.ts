// src/modules/banks/banks.controller.ts
import { Elysia } from 'elysia'
import { ok, fail } from '@/core/utils/response'
import { BankService } from './bank.service'
import prisma from '@/core/db/prisma'

export const bankController = new Elysia({ prefix: '/banks' })
  .decorate('BankService', new BankService(prisma))
  .get('', async ({ BankService }) => {
    const banks = await BankService.getAll()
    return ok('Banks fetched successfully', banks)
  })
  .get('/active', async ({ BankService }) => {
    const banks = await BankService.getActive()
    return ok('Active banks fetched successfully', banks)
  })
  .get('/:short_code', async ({ params, BankService }) => {
    const bank = await BankService.findByCode(params.short_code)
    if (!bank) return fail('Bank not found', 'BANK_NOT_FOUND', `No bank with code ${params.short_code}`)
    return ok('Bank fetched successfully', bank)
  })
  .post('', async ({ body, BankService }) => {
    const bank = await BankService.create(body)
    return ok('Bank created successfully', bank)
  })
  .patch('/:id', async ({ params, body, BankService }) => {
    const bank = await BankService.update(params.id, body)
    return ok('Bank updated successfully', bank)
  })
  .delete('/:id', async ({ params, BankService }) => {
    const bank = await BankService.delete(params.id)
    return ok('Bank deleted successfully', bank)
  })
