import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import CreateVenueValidator from "App/Validators/CreateVenueValidator";
import Venue from "App/Models/Venue";
import { DateTime } from "luxon";

export default class VenuesController {
  /**
   * @swagger
   * /api/v1/venues:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Venues
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
  public async index({ request, response }: HttpContextContract) {
    try {
      // Filter lewat Query Param
      if (request.qs().name) {
        let venuesFiltered = await (
          await Venue.findByOrFail("name", request.qs().name)
        ).serialize({
          fields: {
            omit: ["created_at", "updated_at"],
          },
        });

        return response.ok({
          message: "Berhasil Mengambil Data Venues!",
          data: venuesFiltered,
        });
      }

      let venues = await Venue.all();
      let venuesData = venues.map((venue) =>
        venue.serialize({
          fields: {
            omit: ["created_at", "updated_at"],
          },
        })
      );

      return response.ok({
        message: "Berhasil Mengambil Data Venues!",
        data: venuesData,
      });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/venues:
   *  post:
   *    tags:
   *      - Venues
   *    security:
   *      - bearerAuth: []
   *    requestBody:
   *      required: true
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            type: object
   *            properties:
   *              name:
   *                type: string
   *              address:
   *                type: string
   *              phone:
   *                type: string
   *    responses:
   *      201:
   *        description: "Berhasil Menambah Data!"
   *      441:
   *        description: "Request Tidak Bisa Di Proses!"
   *      401:
   *        description: "Tidak Mempunyai Akses!"
   */
  public async store({ request, response }: HttpContextContract) {
    try {
      await request.validate(CreateVenueValidator);
      await Venue.create({
        name: request.input("name"),
        address: request.input("address"),
        phone: request.input("phone"),
      });
      response.ok({ message: "Berhasil Menambah Data Venue!" });
    } catch (error) {
      response.unprocessableEntity({ error: error.messages });
    }
  }

  /**
   * @swagger
   * /api/v1/venues/{id}:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Venues
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil data venue tertentu
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
  public async show({ response, params, request }: HttpContextContract) {
    try {
      let tanggal = DateTime.now().toFormat("yyyy-mm-dd");
      if (request.qs().tanggal) {
        tanggal = request.qs().tanggal;
      }

      let venue = await Venue.query()
        .preload("fields", (query) => {
          query.preload("bookings", (query) => {
            query.whereRaw(`play_date_start = ${tanggal}`);
          });
        })
        .where("id", params.id)
        .first();

      let venueData = venue?.serialize({
        fields: {
          pick: ["id", "name", "address", "phone"],
        },
        relations: {
          fields: {
            fields: {
              pick: ["id", "name", "type"],
            },
          },
        },
      });

      return response.ok({
        message: "Berhasil Mengambil Data Venue By Id!",
        data: venueData,
      });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/venues/{id}:
   *  put:
   *    tags:
   *      - Venues
   *    security:
   *      - bearerAuth: []
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil data venue tertentu yang akan diupdate
   *    requestBody:
   *      required: true
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            type: object
   *            properties:
   *              name:
   *                type: string
   *              address:
   *                type: string
   *              phone:
   *                type: string
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
  public async update({ request, response, params }: HttpContextContract) {
    try {
      await request.validate(CreateVenueValidator);

      let updatedVenue = await Venue.findOrFail(params.id);
      updatedVenue.name = request.input("name");
      updatedVenue.address = request.input("address");
      updatedVenue.phone = request.input("phone");
      updatedVenue?.save();

      return response.ok({ message: "Berhasil Mengupdate Data Venue!" });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/venues/{id}:
   *  delete:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Venues
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk menghapus data venue tertentu
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
  public async destroy({ response, params }: HttpContextContract) {
    try {
      await (await Venue.findOrFail(params.id)).delete();
      response.ok({ message: "Berhasil Mengahapus Data Venue!" });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }
}
