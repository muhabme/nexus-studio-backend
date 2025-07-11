import { classToPlain, plainToClass } from "@/decorators/transformer-system"

class ApiResponseHandler {
  static standardize<T>(ResponseClass: new (...args: any[]) => T, apiResponse: any): T
  static standardize<T>(ResponseClass: new (...args: any[]) => T, apiResponse: any[]): T[]

  static standardize<T>(
    ResponseClass: new (...args: any[]) => T,
    apiResponse: any | any[],
  ): T | T[] {
    if (Array.isArray(apiResponse)) {
      return apiResponse.map((response) => plainToClass(ResponseClass, response))
    }

    return plainToClass(ResponseClass, apiResponse)
  }

  static toApiFormat<T>(standardizedObject: T): any {
    return classToPlain(standardizedObject)
  }
}

export { ApiResponseHandler }
