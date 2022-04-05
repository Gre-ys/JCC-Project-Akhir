import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Booking from "App/Models/Booking";
import Field from "App/Models/Field";
import CreateBookingValidator from "App/Validators/CreateBookingValidator";
import Database from "@ioc:Adonis/Lucid/Database";

export default class BookingsController {
  /**
   * @swagger
   * /api/v1/bookings:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Bookings
   *    responses:
   *      200:
   *        description: "Berhasil Mengambil Data!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   *      400:
   *        description: "Bad Request!"
   */
  public async index({ response }: HttpContextContract) {
    try {
      let bookings = await Booking.all();
      return response.ok({
        message: "Berhasil Mengambil Seluruh Data Bookings!",
        data: bookings,
      });
    } catch (error) {
      return response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/schedules:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Bookings
   *    responses:
   *      200:
   *        description: "Berhasil Mengambil Data!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   *      400:
   *        description: "Bad Request!"
   */
  public async schedules({ response, auth }: HttpContextContract) {
    try {
      let data = await Database.from("booking_user")
        .select("booking_id")
        .where("user_id", auth.user!.id);
      let bookingId = data.map((item) => item.booking_id);
      let bookings = await Database.from("bookings")
        .select(
          "id",
          "play_date_start",
          "play_date_end",
          "field_id",
          "booking_user_id"
        )
        .whereRaw(`id in(${bookingId})`);
      return response.ok({
        message: "Berhasil Mengambil Seluruh Data Bookings yang Diikuti!",
        data: bookings,
      });
    } catch (error) {
      return response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/fields/{field_id}/bookings:
   *  post:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Bookings
   *    parameters:
   *      - in: path
   *        name: venue_id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk menambahkan data booking baru yang berelasi dengan field tertentu
   *    requestBody:
   *     required: true
   *     content:
   *       application/x-www-form-urlencoded:
   *         schema:
   *           type: object
   *           properties:
   *             play_date_start:
   *               type: string
   *               format: date-time
   *             play_date_end:
   *               type: string
   *               format: date-time
   *    responses:
   *      201:
   *        description: "Berhasil Menambah Data!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   *      404:
   *        description: "Data Tidak Ditemukan!"
   */
  public async store({ request, response, params, auth }: HttpContextContract) {
    try {
      const data = await request.validate(CreateBookingValidator);

      let booking = await Booking.create({
        playDateStart: data.play_date_start,
        playDateEnd: data.play_date_end,
        fieldId: params.field_id,
        bookingUserId: auth.user!.id,
      });

      await booking.related("players").sync([auth.user!.id]);
      return response.created({ message: "Berhasil Booking!" });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/bookings/{id}:
   *  put:
   *    tags:
   *      - Bookings
   *    security:
   *      - bearerAuth: []
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil data booking tertentu yang akan diupdate
   *    requestBody:
   *      required: true
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            type: object
   *            properties:
   *              play_date_start:
   *                type: string
   *                format: date-time
   *              play_date_end:
   *                type: string
   *                format: date-time
   *    responses:
   *      200:
   *        description: "Berhasil Update Data!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   *      404:
   *        description: "Data Tidak Ditemukan!"
   *      400:
   *        description: "Bad Request!"
   */
  public async update({
    request,
    response,
    params,
    auth,
  }: HttpContextContract) {
    try {
      const data = await request.validate(CreateBookingValidator);

      let myBookings = await Booking.query().where(
        "booking_user_id",
        auth.user!.id
      );

      let akses = false;
      myBookings.map((booking) => {
        if (booking.id == params.id) {
          akses = true;
        }
      });

      if (akses) {
        let booking = await Booking.findOrFail(params.id);
        booking.playDateStart = data.play_date_start;
        booking.playDateEnd = data.play_date_end;
        booking.save();

        return response.ok({ message: "Berhasil Update Data Booking!" });
      } else {
        return response.unauthorized({
          message: "Booking Ini Bukan Milik Anda!",
        });
      }
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/bookings/{id}:
   *  delete:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Bookings
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk menghapus data booking tertentu
   *    responses:
   *      200:
   *        description: "Berhasil Menghapus Data!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   *      404:
   *        description: "Data Tidak Ditemukan!"
   *      400:
   *        description: "Bad Request!"
   */
  public async destroy({ response, params, auth }: HttpContextContract) {
    try {
      let myBookings = await Booking.query().where(
        "booking_user_id",
        auth.user!.id
      );

      let akses = false;
      myBookings.map((booking) => {
        if (booking.id == params.id) {
          akses = true;
        }
      });

      if (akses) {
        await (await Booking.findOrFail(params.id)).delete();

        return response.ok({ message: "Berhasil Hapus Data Booking!" });
      } else {
        return response.unauthorized({
          message: "Booking Ini Bukan Milik Anda!",
        });
      }
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/fields/{id}:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Bookings
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil data booking yang berelasi dengan field tertentu
   *    responses:
   *      200:
   *        description: "Berhasil Mengambil Data!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   *      404:
   *        description: "Data Tidak Ditemukan!"
   *      400:
   *        description: "Bad Request!"
   */
  public async showBookings({ response, params }: HttpContextContract) {
    try {
      let field = await Field.query()
        .preload("venue")
        .preload("bookings")
        .where("id", params.id)
        .first();

      let fieldData = field?.serialize({
        fields: {
          pick: ["name", "type"],
        },
        relations: {
          venue: {
            fields: {
              pick: ["name", "address", "phone"],
            },
          },
          bookings: {
            fields: {
              pick: [
                "id",
                "field_id",
                "play_date_start",
                "play_date_end",
                "booking_user_id",
              ],
            },
          },
        },
      });

      return response.ok({
        message: "Berhasil Mengambil Data Field dan Bookings-nya!",
        data: fieldData,
      });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/bookings/{id}/join:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Bookings
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil data booking tertentu
   *
   *
   *    responses:
   *      200:
   *        description: "Berhasil Join!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   *      404:
   *        description: "Data Tidak Ditemukan!"
   *      400:
   *        description: "Bad Request!"
   */
  public async join({ response, auth, params }: HttpContextContract) {
    try {
      await (await Booking.findOrFail(params.id))
        .related("players")
        .sync([auth.user!.id], false);
      return response.ok({ message: "Berhasil Join Booking!" });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/bookings/{id}/unjoin:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Bookings
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil data booking tertentu
   *
   *
   *    responses:
   *      200:
   *        description: "Berhasil Unjoin!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   *      404:
   *        description: "Data Tidak Ditemukan!"
   *      400:
   *        description: "Bad Request!"
   */
  public async unjoin({ response, auth, params }: HttpContextContract) {
    try {
      await (await Booking.findOrFail(params.id))
        .related("players")
        .detach([auth.user!.id]);
      return response.ok({ message: "Berhasil Unjoin Booking!" });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/bookings/{id}:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Bookings
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil data booking tertentu
   *
   *
   *    responses:
   *      200:
   *        description: "Berhasil Mengambil Data!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   *      404:
   *        description: "Data Tidak Ditemukan!"
   *      400:
   *        description: "Bad Request!"
   */
  public async show({ response, params }: HttpContextContract) {
    try {
      let booking = await Booking.query()
        .preload("players")
        .where("id", params.id)
        .withCount("players")
        .firstOrFail();

      let bookingData = booking.serialize({
        fields: {
          pick: [
            "id",
            "field_id",
            "play_date_start",
            "play_date_end",
            "booking_user_id",
          ],
        },
        relations: {
          players: {
            fields: {
              pick: ["id", "name", "email"],
            },
          },
        },
      });

      return response.ok({
        message: "Berhasil Mengambil Data Booking Disertai Player-nya!",
        data: bookingData,
      });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }
}
