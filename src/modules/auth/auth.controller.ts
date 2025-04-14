import { Elysia, t } from "elysia";
import { AuthService } from "./auth.service";
import jwt from "@elysiajs/jwt";
import { StatusCodes } from "http-status-codes";


export const authController = new Elysia({ prefix: '/auth' })
  .decorate('authService', new AuthService)
  .model({
    signIn: t.Object({
      username: t.String({ minLength: 4 }),
      password: t.String({ minLength: 8 }),
    }),
    signUp: t.Object({
      username: t.String({ minLength: 4 }),
      password: t.String({ minLength: 8 }),
      email: t.String({ format: 'email' }),
      // first_name: t.String({ minLength: 1 }),
      // last_name: t.String({ minLength: 1 }),
    })
  })
  .use(jwt({
    name: 'jwt',
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    secret: process.env.JWT_SECRET!,
    exp: '1d'
  }))

  .post('/sign-up', async ({ body, authService, jwt, set }) => {
    const existingUser = await authService.existUser(body.username)

    // if (existingUser) {
    //   set.status = StatusCodes.BAD_REQUEST
    //   return {
    //     success: false,
    //     message: 'User already exists'
    //   }
    // }

    const userCreated = await authService.signUp(body)

    return {
      success: true,
      message: 'User signed up successfully',
      data: userCreated,
      access_token: await jwt.sign(userCreated)
    }
  }, {
    body: 'signUp'
  })
  .post('/sign-in', async ({ body, authService, jwt, set, cookie: { auth } }) => {
    const user = await authService.existUser(body.username)

    if (!user) {
      set.status = StatusCodes.NOT_FOUND
      return {
        success: false,
        message: 'User not found'
      }
    }

    const isMatchPassword = await authService.verifyPassword(body.password, user.password)

    if (!isMatchPassword) {
      set.status = StatusCodes.UNAUTHORIZED
      return {
        success: false,
        message: 'Username or Password is incorrect'
      }
    }

    const userPayload = authService.createUserPayload(user)
    const access_token = await jwt.sign(userPayload)

    return {
      success: true,
      message: 'User signed in successfully',
      data: userPayload,
      access_token
    }
  }, {
    body: 'signIn'
  })

  .derive(({ headers }) => {
    const auth = headers.authorization

    return {
      bearer: auth?.startsWith('Bearer ') ? auth.slice(7) : null
    }
  })

  // .state({
  //   currentUser: {}
  // })

  .guard({
    beforeHandle: async ({ bearer, jwt, error, store }) => {
      const profile = await jwt.verify(bearer || '')

      if (!profile)
        return error(StatusCodes.UNAUTHORIZED, {
          message: 'Unauthorized'
        })

      store.currentUser = profile
    },
  })

  .get('/profile', async ({ store: { currentUser } }) => {
    return {
      success: true,
      message: 'User details',
      data: currentUser
    }
  })

  .get('/say', ({ store: { currentUser } }) => {
    console.log('current user', currentUser)

    return {
      success: true,
      message: 'Hello World'
    }
  })

