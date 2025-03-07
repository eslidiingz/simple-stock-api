export enum Ordering {
  ASC = 'asc',
  DESC = 'desc'
}

export interface QueryString {
  orderBy?: string
  orderType?: Ordering
  page?: number
  limit?: number
}