import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('pontoColeta_items', table => {
    table.increments('id').primary();
    table.integer('pontoColeta_id')
      .notNullable()
      .references('id')
      .inTable('pontosColeta');
    table.integer('item_id')
      .notNullable()
      .references('id')
      .inTable('items');
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTableIfExists('pontoColeta_items')
}