import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Fields extends BaseSchema {
  protected tableName = "fields";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table
        .enu("type", [
          "soccer",
          "futsal",
          "mini soccer",
          "basketball",
          "volleyball",
        ])
        .notNullable();
      table.integer("venue_id").unsigned().notNullable();
      table
        .foreign("venue_id")
        .references("venues.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
