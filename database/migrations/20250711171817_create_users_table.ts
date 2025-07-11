import { Knex } from "knex"
import { UserRole } from "../../src/constants/userRoles.enum"
import { UserStatus } from "../../src/constants/userStatus.enum"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary()
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now())
    table.datetime("updated_at").notNullable()

    table.string("email", 255).notNullable().unique()
    table.string("password_hash", 255).notNullable()
    table.string("name", 255).notNullable()

    table.enum("role", Object.values(UserRole)).defaultTo("user")
    table.enum("status", Object.values(UserStatus)).defaultTo("active")

    table.timestamp("last_login_at").nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users")
}
