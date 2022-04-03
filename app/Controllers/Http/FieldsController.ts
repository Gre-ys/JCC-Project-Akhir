import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import CreateFieldValidator from "App/Validators/CreateFieldValidator";
import Field from "App/Models/Field";

export default class FieldsController {
  public async index({ params, response }: HttpContextContract) {
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
  }

  public async store({ request, response, params }: HttpContextContract) {
    try {
      await request.validate(CreateFieldValidator);

      await Field.create({
        name: request.input("name"),
        type: request.input("type"),
        venueId: params.venue_id,
      });

      response.ok({ message: "Berhasil Menambahkan Data Field!" });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  public async show({ response, params }: HttpContextContract) {
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
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(CreateFieldValidator);
    let updatedField = await Field.findOrFail(params.id);
    updatedField.name = request.input("name");
    updatedField.type = request.input("type");
    updatedField.venueId = params.venue_id;
    updatedField.save();

    return response.ok({ message: "Berhasil Mengupdate Data Field!" });
  }

  public async destroy({ response, params }: HttpContextContract) {
    await (await Field.findOrFail(params.id)).delete();
    response.ok({ message: "Berhasil Menghapus Data Field!" });
  }
}
