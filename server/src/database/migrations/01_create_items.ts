import Knex from "knex"; //Colocamos letra maiúscula porque estamos nos referindo ao tipo da variável knex, e não à variável em si. Os tipo do typescript geralmente começam com letra maiúscula

export async function up(knex: Knex) {
    //CRIAR A TABELA
    return knex.schema.createTable("items", table => {
        table.increments("id").primary();
        table.string("image").notNullable();
        table.string("title").notNullable();
    });
};

export async function down(knex: Knex) {
    //VOLTAR ATRÁS (DELETAR A TABELA)
    return knex.schema.dropTable("items");
};