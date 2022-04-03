import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import RegisterValidator from "App/Validators/RegisterValidator";
import User from "App/Models/User";
import LoginValidator from "App/Validators/LoginValidator";
import Mail from "@ioc:Adonis/Addons/Mail";
import Database from "@ioc:Adonis/Lucid/Database";
import OtpVerificationValidator from "App/Validators/OtpVerificationValidator";

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(RegisterValidator);
      const dataSave = await User.create(data);

      let otp_code = Math.floor(100000 + Math.random() * 900000);
      await Database.table("otp_codes").insert({
        otp_code: otp_code,
        user_id: dataSave.id,
      });

      await Mail.send((message) => {
        message
          .from("admin@sanberdev.com")
          .to(data.email)
          .subject("Welcome!")
          .htmlView("mail/otp_verification", {
            name: data.name,
            otp_code: otp_code,
          });
      });

      response.created({
        message:
          "Registrasi Berhasil!, Silahakan Lakukan Verfikasi Menggunakan Kode OTP yang Dikirim Ke Email Anda...",
      });
    } catch (error) {
      response.unprocessableEntity({ error: error.message });
    }
  }

  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const data = await request.validate(LoginValidator);
      const token = await auth.use("api").attempt(data.email, data.password);
      response.ok({ message: "Login Berhasil!", token });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }

  public async otp_verification({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(OtpVerificationValidator);
      const otp_code = data.otp_code;
      const email = data.email;

      const user = await User.findByOrFail("email", email);
      const dataOtp = await Database.from("otp_codes")
        .where("otp_code", otp_code)
        .firstOrFail();
      if (user.id === dataOtp.user_id) {
        user.isVerified = true;
        await user.save();
      }
      response.ok({ message: "Verifikasi Berhasil!" });
    } catch (error) {
      response.badRequest({ error: error.message });
    }
  }
}
