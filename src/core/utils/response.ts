export const ok = (message: string, data: any, pagination?: any) => ({
  success: true,
  message,
  data,
  pagination: pagination ?? null,
  error: null,
})

export interface ResponseFailed {
  success: boolean
  message: string
  // data: any
  // pagination: any
  error: {
    code: string
    details: string
  }
}

export const fail = ({ message = '', code = '', details = '' }) => ({
  success: false,
  message,
  // data: null,
  // pagination: null,
  error: { code, details },
})
