export type PropertyValidator = (value: any) => Promise<string | null> | string | null

export interface PropertyMetadata {
  propertyKey: string
  type?: any
  name?: string
  transform?: {
    toPlain?: (value: any) => any
    toClass?: (value: any) => any
  }
  exclude?: boolean
  expose?: boolean
  groups?: string[]
  validators?: Array<PropertyValidator>
  defaultValue?: any
}

export interface ClassMetadata {
  properties: Map<string, PropertyMetadata>
  excludeExtraneousValues?: boolean
}

export interface TransformOptions {
  groups?: string[]
  excludeExtraneousValues?: boolean
}

export interface ExposeOptions {
  name?: string
  groups?: string[]
}

export interface ExcludeOptions {
  groups?: string[]
}

export interface TransformFunctions {
  toPlain?: (value: any) => any
  toClass?: (value: any) => any
}
