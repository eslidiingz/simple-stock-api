import jwt from "@elysiajs/jwt";

export const jwtPlugin = jwt({
  name: 'jwt',
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  secret: process.env.JWT_SECRET!,
  exp: '1d'
})