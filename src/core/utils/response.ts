export const ok = (message: string, data: any, pagination?: any) => ({
  success: true,
  message,
  data,
  pagination: pagination ?? null,
  error: null,
})

export const fail = (message: string, code = '', details = '') => ({
  success: false,
  message,
  data: null,
  pagination: null,
  error: { code, details },
})
