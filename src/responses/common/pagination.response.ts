import { Expose, Type } from "@/decorators/transformer-system"

export class PaginationMetaDto {
  @Expose()
  total: number

  @Expose()
  currentPage: number

  @Expose()
  eachPage: number

  @Expose()
  lastPage: number

  @Expose()
  hasNext: boolean

  @Expose()
  hasPrev: boolean

  constructor(total: number, currentPage: number, eachPage: number) {
    this.total = total
    this.currentPage = currentPage
    this.eachPage = eachPage
    this.lastPage = Math.ceil(total / eachPage)
    this.hasNext = currentPage < this.lastPage
    this.hasPrev = currentPage > 1
  }
}

export class PaginatedResponseDto<T> {
  @Expose()
  data: T[]

  @Expose()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data
    this.meta = meta
  }
}
