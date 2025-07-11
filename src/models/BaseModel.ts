import { Model, ModelOptions, QueryContext } from "objection"

export abstract class BaseModel extends Model {
  id: number
  created_at: Date
  updated_at: Date

  override $beforeInsert(queryContext: QueryContext): void {
    super.$beforeInsert(queryContext)
    this.created_at = new Date()
    this.updated_at = new Date()
  }

  override $beforeUpdate(opt: ModelOptions, queryContext: QueryContext): void {
    super.$beforeUpdate(opt, queryContext)
    this.updated_at = new Date()
  }

  static override get modelPaths(): string[] {
    return [__dirname]
  }
}
