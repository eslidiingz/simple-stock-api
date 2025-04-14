export enum Ordering {
  ASC = 'asc',
  DESC = 'desc'
}

export interface QueryOptions {
  orderBy?: string
  orderType?: Ordering
  page?: number
  limit?: number
}