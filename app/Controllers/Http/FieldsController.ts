import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import CreateFieldValidator from "App/Validators/CreateFieldValidator";
import Field from "App/Models/Field";

export default class FieldsController {
  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - fields
   *    parameters:
   *      - in: path
   *        name: venue_id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil seluruh data field berdasarkan venue tertentu
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
  public async index({ params, response }: HttpContextContract) {
    try {
      let fields = await Field.query()
        .preload("venue")
        .where("venue_id", params.venue_id);

      let fieldsData = fields.map((field) =>
        field.serialize({
          fields: {
            pick: ["id", "name", "type"],
          },
          relations: {
            venue: {
              fields: {
                pick: ["name"],
              },
            },
          },
        })
      );

      return response.ok({
        message: "Berhasil Mengambil Data Fields!",
        data: fieldsData,
      });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields:
   *  post:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - fields
   *    parameters:
   *      - in: path
   *        name: venue_id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk menambahkan data field baru yang berelasi dengan venue tertentu
   *    requestBody:
   *     required: true
   *     content:
   *       application/x-www-form-urlencoded:
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             type:
   *               type: string
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
  public async store({ request, response, params }: HttpContextContract) {
    try {
      await request.validate(CreateFieldValidator);

      await Field.create({
        name: request.input("name"),
        type: request.input("type"),
        venueId: params.venue_id,
      });

      response.created({ message: "Berhasil Menambahkan Data Field!" });
    } catch (error) {
      response.unprocessableEntity({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields/{id}:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - fields
   *    parameters:
   *      - in: path
   *        name: venue_id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil seluruh data field berdasarkan venue tertentu
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil data field tertentu setelah difilter berdasarkan venue
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
      let field = await await Field.query()
        .preload("venue")
        .where("id", params.id);

      let fieldData = field.map((f) =>
        f.serialize({
          fields: {
            pick: ["id", "name", "type"],
          },
          relations: {
            venue: {
              fields: ["name"],
            },
          },
        })
      );

      return response.ok({
        message: "Berhasil Mengambil Data Field By Id!",
        data: fieldData,
      });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields/{id}:
   *  put:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - fields
   *    parameters:
   *      - in: path
   *        name: venue_id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil seluruh data field berdasarkan venue tertentu
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk menhambil data field tertentu setelah difilter berdasarkan venue yang akan diupdate
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
      await request.validate(CreateFieldValidator);
      let updatedField = await Field.findOrFail(params.id);
      updatedField.name = request.input("name");
      updatedField.type = request.input("type");
      updatedField.venueId = params.venue_id;
      updatedField.save();

      return response.ok({ message: "Berhasil Mengupdate Data Field!" });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields/{id}:
   *  delete:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - fields
   *    parameters:
   *      - in: path
   *        name: venue_id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil seluruh data field berdasarkan venue tertentu
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *        description: Id Numerik untuk mengambil data field tertentu setelah difilter berdasarkan venue yang akan dihapus
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
      await (await Field.findOrFail(params.id)).delete();
      response.ok({ message: "Berhasil Menghapus Data Field!" });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }
}
