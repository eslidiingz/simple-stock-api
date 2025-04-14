// src/modules/banks/banks.service.ts
import type { PrismaClient, Prisma } from '@prisma/client'

export class BankService {
  constructor(private prisma: PrismaClient) { }

  async getAll() {
    return this.prisma.bank.findMany({
      orderBy: { name_th: 'asc' },
    })
  }

  async getActive() {
    return this.prisma.bank.findMany({
      where: { is_active: true },
      orderBy: { name_th: 'asc' },
    })
  }

  async findByCode(short_code: string) {
    return this.prisma.bank.findUnique({
      where: { short_code },
    })
  }

  async findById(id: string) {
    return this.prisma.bank.findUnique({
      where: { id },
    })
  }

  async create(data: Prisma.BankCreateInput) {
    return this.prisma.bank.create({ data })
  }

  async update(id: string, data: Prisma.BankUpdateInput) {
    return this.prisma.bank.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return this.prisma.bank.delete({
      where: { id },
    })
  }
}
