import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import LoginValidator from "App/Validators/LoginValidator";

export default class Verify {
  public async handle(
    { auth, response, request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    let data = await request.validate(LoginValidator);
    const user = await User.findByOrFail("email", data.email);
    let isVerified = user.isVerified;
    if (isVerified) {
      await next();
    } else {
      return response.unauthorized({ message: "Akun Belum Terverifikasi!" });
    }
  }
}
