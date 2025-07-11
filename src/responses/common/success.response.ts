import { PaginationMetadata, StandardResponse } from "@/types/response"

export class SuccessResponse<T> implements StandardResponse<T> {
  status: number
  data: T
  meta?: PaginationMetadata

  constructor(data: T, status: number = 200, meta?: PaginationMetadata) {
    this.status = status
    this.data = data
    if (meta) {
      this.meta = meta
    }
  }

  static ok<T>(data: T, meta?: PaginationMetadata): SuccessResponse<T> {
    return new SuccessResponse(data, 200, meta)
  }

  static created<T>(data: T, meta?: PaginationMetadata): SuccessResponse<T> {
    return new SuccessResponse(data, 201, meta)
  }

  static accepted<T>(data: T, meta?: PaginationMetadata): SuccessResponse<T> {
    return new SuccessResponse(data, 202, meta)
  }

  static noContent(): SuccessResponse<null> {
    return new SuccessResponse(null, 204)
  }
}
