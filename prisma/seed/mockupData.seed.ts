import prisma from "@/core/db/prisma"
import { AuthService } from "@/modules/auth/auth.service"
import { CompanyService } from "@/modules/companies/company.service"
import { PaymentMethodService } from "@/modules/payment-methods/payment-method.service"
import { Product } from "@/modules/products/product.service"
import { StockMovement } from "@/modules/stock-movements/stock-movement.service"

const authService = new AuthService()
const companyService = new CompanyService()
const paymentMethodService = new PaymentMethodService()
const productService = new Product()
const stockMovementService = new StockMovement()

export const seedMockupData = async () => {
  await createCompanyMockup()
}

const createCompanyMockup = async () => {
  const companyMockupData = [
    {
      // user
      id: '6f4cb8d8-ee29-4b44-afbb-ff73a41457fc',
      first_name: 'Company',
      last_name: 'Mockup',
      username: 'company',
      email: 'company@example.com',

      // company
      company_name: 'Company Mockup',

      // category
      category_id: "6ba8d79e-f051-4857-ab6f-ea4fad1efe2b", // Clothes

      // product
      products: [
        {
          id: '7116c485-dce4-44eb-9890-9a8c7dc89fdb',
          category_id: '6ba8d79e-f051-4857-ab6f-ea4fad1efe2b',
          code: '5185201390241171',
          name: 'Red dress',
          image: '/uploads/products/mock/mock-red-dress.webp',
          thumbnail: '/uploads/products/mock/mock-red-dress.webp',
          price: 199,
        },
        {
          id: '4363c41e-aa25-4be1-a652-e7351170affe',
          category_id: '6ba8d79e-f051-4857-ab6f-ea4fad1efe2b',
          code: '8425717192798847',
          name: 'Pink dress',
          image: '/uploads/products/mock/mock-pink-dress.webp',
          thumbnail: '/uploads/products/mock/mock-pink-dress.webp',
          price: 250,
        },
        {
          id: '60f3ba44-02db-45e4-9211-2a7fa45926d0',
          category_id: '6ba8d79e-f051-4857-ab6f-ea4fad1efe2b',
          code: '5482488424493543',
          name: 'Blue dress',
          image: '/uploads/products/mock/mock-blue-dress.jpg',
          thumbnail: '/uploads/products/mock/mock-blue-dress.jpg',
          price: 230,
        },
      ],

      // stock
      stocks: [
        {
          product_id: '7116c485-dce4-44eb-9890-9a8c7dc89fdb',
          quantity: 100,
        },
        {
          product_id: '4363c41e-aa25-4be1-a652-e7351170affe',
          quantity: 80,
        },
        {
          product_id: '60f3ba44-02db-45e4-9211-2a7fa45926d0',
          quantity: 50,
        },
      ]
    }, {
      // user
      id: 'cc8bec19-e328-4564-b2fa-d6101c779f98',
      first_name: 'Company 2',
      last_name: 'Mockup',
      username: 'company2',
      email: 'company2@example.com',

      // company
      company_name: 'Company 2 Mockup',

      // category
      category_id: "a4cd7bf9-0f37-4493-b36d-b7436534fa4d", // Food

      // product
      products: [
        {
          id: 'c2920951-f081-4f13-9ba8-66ff507e5fd0',
          category_id: '6ba8d79e-f051-4857-ab6f-ea4fad1efe2b',
          code: '5482488424493543',
          name: 'ปูอัดแช่แข็ง',
          image: '/uploads/products/mock/mock-frozen-crab-stick.jpeg',
          thumbnail: '/uploads/products/mock/mock-frozen-crab-stick.jpeg',
          price: 230,
        },
      ],

      // stock
      stocks: [
        {
          product_id: 'c2920951-f081-4f13-9ba8-66ff507e5fd0',
          quantity: 50,
        },
      ]
    }
  ]

  for (const data of companyMockupData) {
    const { company_name, category_id, products, stocks, ...userRegister } = {
      ...data,
      password: await authService.hashPassword('testcompany'),
      role_id: '6f400dd4-3aa7-4074-bc3c-1ab3f5f54d77', // owner
    }

    const userCreated = await prisma.user.create({
      data: userRegister
    })

    if (userCreated) {
      // Create company
      const company = await companyService.createNewCompanyData({
        name: data.company_name
      }, userCreated.id)

      // Create default payment methods
      await paymentMethodService.createDefaultPaymentMethods(company?.id)

      const companyCategories = [
        {
          company_id: company?.id,
          category_id: data.category_id
        }
      ]

      // Create company categories
      const categoriesCreated = await prisma.companyCategory.createMany({
        data: companyCategories
      })

      console.log(`✅ Mockup company username is: ${userCreated.username} (${userCreated.id}) has ${categoriesCreated.count} categories`)

      // Create company products
      for (const product of data.products) {
        product.company_id = company?.id

        const mockCurrentUser = {
          company: {
            id: company?.id
          }
        }

        await productService.create(product, mockCurrentUser)
      }

      console.log(`✅ Mockup company products: ${data?.products.length} products`)

      const productMoveInStock = {
        movementList: data.stocks
      }
      // Create company stocks
      await stockMovementService.adjust(productMoveInStock, company?.id)

      console.log(`✅ Mockup company stocks: ${data?.stocks.length} stocks`)
    }
  }
}