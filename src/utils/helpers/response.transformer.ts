import { plainToClass } from "@/decorators/transformer-system"
import { PaginationMetaDto } from "@/responses/common/pagination.response"
import { PaginatedResponse, PaginationMetadata } from "@/types/response"

type ClassConstructor<T> = new (...args: any[]) => T

export class ResponseTransformer {
  static transform<T>(ResponseClass: ClassConstructor<T>, apiResponse: any): T
  static transform<T>(ResponseClass: ClassConstructor<T>, apiResponse: any[]): T[]

  static transform<T>(
    ResponseClass: ClassConstructor<T>,
    data: any[],
    pagination: PaginationMetadata,
  ): PaginatedResponse<T>

  static transform<T>(
    ResponseClass: ClassConstructor<T>,
    data: any | any[],
    pagination?: PaginationMetadata,
  ): T | T[] | PaginatedResponse<T> {
    if (pagination && Array.isArray(data)) {
      const transformedData = data.map((response) => plainToClass(ResponseClass, response))
      const meta = new PaginationMetaDto(
        pagination.total,
        pagination.currentPage,
        pagination.eachPage,
      )

      return {
        data: transformedData,
        meta,
      }
    }

    if (Array.isArray(data)) {
      return data.map((response) => plainToClass(ResponseClass, response))
    }

    return plainToClass(ResponseClass, data)
  }
}
