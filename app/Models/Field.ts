import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Venue from "./Venue";
import Booking from "./Booking";

export default class Field extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public type: string;

  @column()
  public venueId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => Venue)
  public venue: BelongsTo<typeof Venue>;

  @hasMany(() => Booking)
  public bookings: HasMany<typeof Booking>;
}
