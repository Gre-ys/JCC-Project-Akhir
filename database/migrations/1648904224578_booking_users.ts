import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class BookingUsers extends BaseSchema {
  protected tableName = "booking_user";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table
        .integer("user_id")
        .unsigned()
        .references("users.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .integer("booking_id")
        .unsigned()
        .references("bookings.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
