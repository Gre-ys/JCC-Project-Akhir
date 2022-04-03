import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Bookings extends BaseSchema {
  protected tableName = "bookings";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer("booking_user_id")
        .unsigned()
        .references("users.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("booking_user_id");
    });
  }
}
