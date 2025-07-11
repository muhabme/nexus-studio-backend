import { Knex } from "knex"
import { Transaction } from "objection"

export interface Repository<T> {
  // Find
  findOneBy(criteria: Partial<T>): Promise<T | null>
  findWithRelations(id: string | number, relations: string[]): Promise<T | null>

  findManyBy(criteria: Partial<T>, limit?: number): Promise<T[]>
  findManyWithRelations(relations: string[], limit: number, offset: number): Promise<T[]>

  // Create
  create(data: Partial<T>): Promise<T>
  createMany(data: Partial<T>[]): Promise<T[]>

  // Update
  patch(id: string | number, data: Partial<T>): Promise<number>
  update(id: string | number, data: Partial<T>): Promise<T | null>

  // Delete
  deleteBy(criteria: Partial<T>): Promise<number>

  // Other
  count(criteria?: Partial<T>): Promise<number>
  exists(criteria: Partial<T>): Promise<boolean>

  withTransaction<R>(callback: (trx: Transaction) => Promise<R>): Promise<R>
  search(searchTerm: string, searchFields: string[], limit: number): Promise<T[]>
  rawQuery(sql: string, bindings: Knex.RawBinding): Promise<any>

  paginate(
    page: number,
    limit: number,
    criteria?: Partial<T>,
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }>
}
