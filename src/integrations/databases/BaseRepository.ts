import { Repository } from "@/contracts/database"
import { Knex } from "knex"
import { Model, ModelClass, QueryBuilder, Transaction } from "objection"
import { getKnex } from "./mysql"

export abstract class BaseRepository<T extends Model> implements Repository<T> {
  protected abstract model: ModelClass<T>

  protected get knex(): Knex {
    return getKnex()
  }

  protected query(): QueryBuilder<T, T[]> {
    return this.model.query() as unknown as QueryBuilder<T, T[]>
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const created = await this.model.query().insert(data as any)
      return created as T
    } catch (error) {
      throw new Error(`Failed to create record in ${this.model.tableName}: ${error}`)
    }
  }

  async createMany(data: Partial<T>[]): Promise<T[]> {
    return (await this.model.query().insert(data as any[])) as T[]
  }

  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    try {
      const updated = await this.model.query().patchAndFetchById(id, data as any)
      return (updated as T) || null
    } catch {
      return null
    }
  }

  async findManyBy(criteria: Partial<T>, limit?: number): Promise<T[]> {
    let query = this.model.query().where(criteria as any)
    if (limit) {
      query = query.limit(limit)
    }
    return (await query) as T[]
  }

  async findOneBy(criteria: Partial<T>): Promise<T | null> {
    const result = await this.model.query().findOne(criteria as any)
    return (result as T) || null
  }

  async count(criteria?: Partial<T>): Promise<number> {
    let query = this.model.query()
    if (criteria) {
      query = query.where(criteria as any)
    }
    const result = (await query.count("id as total").first()) as any
    return result ? Number(result.total) : 0
  }

  async exists(criteria: Partial<T>): Promise<boolean> {
    const count = await this.count(criteria)
    return count > 0
  }

  async withTransaction<R>(callback: (trx: Transaction) => Promise<R>): Promise<R> {
    return await this.model.transaction(callback)
  }

  async patch(id: string | number, data: Partial<T>): Promise<number> {
    return await this.model
      .query()
      .patchAndFetchById(id, data as any)
      .then(() => 1)
      .catch(() => 0)
  }

  async deleteBy(criteria: Partial<T>): Promise<number> {
    return await this.model
      .query()
      .delete()
      .where(criteria as any)
  }

  async findWithRelations(id: string | number, relations: string[]): Promise<T | null> {
    const result = await this.model
      .query()
      .findById(id)
      .withGraphFetched(`[${relations.join(", ")}]`)
    return (result as T) || null
  }

  async findManyWithRelations(relations: string[], limit = 100, offset = 0): Promise<T[]> {
    return (await this.model
      .query()
      .withGraphFetched(`[${relations.join(", ")}]`)
      .limit(limit)
      .offset(offset)) as T[]
  }

  async paginate(
    page: number = 1,
    limit: number = 10,
    criteria?: Partial<T>,
  ): Promise<{
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    let query = this.model.query()
    if (criteria) {
      query = query.where(criteria as any)
    }

    const [data, total] = await Promise.all([
      query.clone().offset(offset).limit(limit),
      this.count(criteria),
    ])

    return {
      data: data as T[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async search(searchTerm: string, searchFields: string[], limit = 100): Promise<T[]> {
    let query = this.model.query()

    if (searchFields.length > 0) {
      query = query.where((builder) => {
        searchFields.forEach((field, index) => {
          if (index === 0) {
            builder.where(field, "like", `%${searchTerm}%`)
          } else {
            builder.orWhere(field, "like", `%${searchTerm}%`)
          }
        })
      })
    }

    return (await query.limit(limit)) as T[]
  }

  async rawQuery(sql: string, bindings: Knex.RawBinding): Promise<any> {
    return await this.knex.raw(sql, bindings)
  }
}
