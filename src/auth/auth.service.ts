import { t } from 'elysia'
import prisma from '../../lib/prisma'
import { Prisma } from '@prisma/client'

const AuthSignUp = t.Object({
  username: t.String({ minLength: 4 }),
  password: t.String({ minLength: 8 }),
  email: t.String({ format: 'email' }),
})

const AuthSignIn = t.Object({
  username: t.String({ minLength: 4 }),
  password: t.String({ minLength: 8 }),
})

type SignUpRequest = typeof AuthSignUp.static
type SignInRequest = typeof AuthSignIn.static

export class AuthService {
  async signUp(signUpRequest: SignUpRequest) {

    try {
      const hashedPassword = await this.hashPassword(signUpRequest.password)
      const data = { ...signUpRequest, password: hashedPassword }
      const created = await prisma.user.create({ data })
      if (created) {
        const userPayload = this.createUserPayload(created)

        return userPayload;
      }
    } catch (error) {
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

  createUserPayload(userObject: Prisma.UserSelect): Prisma.UserSelect {
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