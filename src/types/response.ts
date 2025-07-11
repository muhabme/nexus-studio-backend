export interface PaginationMetadata {
  total: number
  currentPage: number
  eachPage: number
  lastPage: number
}

export interface StandardResponse<T> {
  status: number
  data: T
  meta?: PaginationMetadata
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMetadata
}

export interface ControllerResponse<T> {
  data?: T
  message?: string
  meta?: PaginationMetadata
  [key: string]: any
}
