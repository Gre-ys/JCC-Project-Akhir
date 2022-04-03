import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import CreateVenueValidator from "App/Validators/CreateVenueValidator";
import Venue from "App/Models/Venue";
import { DateTime } from "luxon";

export default class VenuesController {
  public async index({ request, response }: HttpContextContract) {
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
  }

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
      response.badRequest({ error: error.messages });
    }
  }

  public async show({ response, params, request }: HttpContextContract) {
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
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(CreateVenueValidator);

    let updatedVenue = await Venue.findOrFail(params.id);
    updatedVenue.name = request.input("name");
    updatedVenue.address = request.input("address");
    updatedVenue.phone = request.input("phone");
    updatedVenue?.save();

    return response.ok({ message: "Berhasil Mengupdate Data Venue!" });
  }

  public async destroy({ response, params }: HttpContextContract) {
    await (await Venue.findOrFail(params.id)).delete();

    response.ok({ message: "Berhasil Mengahapus Data Venue!" });
  }
}
