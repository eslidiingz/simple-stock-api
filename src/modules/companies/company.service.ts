import { t } from "elysia";
import prisma from "@/core/db/prisma";


const company = t.Object({
  name: t.String(),
})

type CompanyCreate = typeof company.static

export class CompanyService {
  async create(company: CompanyCreate) {
    try {
      return await prisma.company.create({ data: company })
    } catch (error) {
      console.log(`Failed to create company: ${error}`)
    }
  }

  async createNewCompanyData(company: CompanyCreate, user_id: string) {
    const companyCreated = await this.create(company)

    if (companyCreated?.id) {
      await this.createDefaultCompanyCategories(companyCreated.id)
      await this.createDefaultCompanyUser(companyCreated.id, user_id)

      return companyCreated
    }
  }

  protected async createDefaultCompanyCategories(company_id: string) {
    try {
      const categories = [
        {
          company_id: company_id,
          category_id: "be555bd5-f477-4fdc-a516-47f85e0046e9",
        }
      ]

      await prisma.companyCategory.createMany({ data: categories })
    } catch (error) {
      console.log(`Failed to create default company categories: ${error}`)
    }
  }

  protected async createDefaultCompanyUser(company_id: string, user_id: string) {
    try {
      await prisma.companyUser.create({ data: { company_id, user_id, is_owner: true } })
    } catch (error) {
      console.log(`Failed to create default company user: ${error}`)
    }
  }
}