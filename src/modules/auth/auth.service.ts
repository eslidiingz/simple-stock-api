import { t } from 'elysia'
import prisma from '../../core/db/prisma'
import { Prisma } from '@prisma/client'
import { PaymentMethodService } from '../payment-methods/payment-method.service'
import { CompanyService } from '../companies/company.service'

const AuthSignUp = t.Object({
  username: t.String({ minLength: 4 }),
  password: t.String({ minLength: 8 }),
  company_name: t.String({ minLength: 1 }),
  email: t.String({ format: 'email' }),
})

const AuthSignIn = t.Object({
  username: t.String({ minLength: 4 }),
  password: t.String({ minLength: 8 }),
})

type SignUpRequest = typeof AuthSignUp.static
type SignInRequest = typeof AuthSignIn.static

type UserPayload = {
  id: string,
  first_name: string,
  last_name: string
  username: string,
  email: string,
}

export class AuthService {
  #companyService
  #paymentMethodService

  constructor() {
    this.#paymentMethodService = new PaymentMethodService()
    this.#companyService = new CompanyService()
  }

  async signUp(signUpRequest: SignUpRequest) {
    try {
      const hashedPassword = await this.hashPassword(signUpRequest.password)
      const data = { ...signUpRequest, password: hashedPassword, role_id: '6f400dd4-3aa7-4074-bc3c-1ab3f5f54d77' }
      const { company_name, ...dataWithoutCompany } = data
      const createdUser = await prisma.user.create({ data: dataWithoutCompany })

      if (createdUser) {
        const company = await this.#companyService.createNewCompanyData({
          name: signUpRequest.company_name,
          short_code: signUpRequest.company_name.replaceAll(' ', '').substr(0, 5).toUpperCase()
        }, createdUser.id)

        await this.#paymentMethodService.createDefaultPaymentMethods(company.id)

        const userPayload = this.createUserPayload(createdUser)
        const payload = { ...userPayload, company_id: company.id }

        return payload;
      }
    } catch (error) {
      console.log('Cannot sign up', error)
      return error
    }
  }

  async signIn(signInRequest: SignInRequest) {
    // const user = await prisma.user.findFirst({ where: { username: signInRequest.username } })

    // const isMatchPassword = Bun.password.verify(user.password, signInRequest.password)

    // return {
    //   success: true,
    //   message: 'User signed in successfully'
    // }
  }

  async existUser(username: string) {
    return await prisma.user.findFirst({ where: { username } })
  }

  createUserPayload(userObject: Prisma.UserSelect): UserPayload {
    const { password, is_active, created_at, updated_at, deleted_at, ...userPayload } = { ...userObject };

    return userPayload
  }

  async hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password, {
      algorithm: 'bcrypt',
      cost: 12
    })
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await Bun.password.verify(password, hashedPassword)
  }


}


// ตรวจว่าผู้ใช้มีสิทธิใช้งานฟังก์ชันนี้หรือไม่
// const hasPermission = await prisma.userRole.findFirst({
//   where: {
//     user_id: currentUser.id,
//     role: {
//       permissions: {
//         some: { permission: { code: 'edit:product' } }
//       }
//     }
//   }
// })