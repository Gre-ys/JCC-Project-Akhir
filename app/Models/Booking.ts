import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import User from "App/Models/User";
import Field from "App/Models/Field";

export default class Booking extends BaseModel {
  public serializeExtras = true;

  @column({ isPrimary: true })
  public id: number;

  @column.dateTime()
  public playDateStart: DateTime;

  @column.dateTime()
  public playDateEnd: DateTime;

  @column()
  public fieldId: number;

  @column()
  public bookingUserId: number;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @manyToMany(() => User)
  public players: ManyToMany<typeof User>;

  @belongsTo(() => Field)
  public field: BelongsTo<typeof Field>;

  @belongsTo(() => User)
  public bookingUser: BelongsTo<typeof User>;
}
