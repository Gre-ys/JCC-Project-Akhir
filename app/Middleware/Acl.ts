import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class Acl {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>,
    allowedRoles: string[]
  ) {
    let akses = false;
    allowedRoles.map((role) => {
      if (auth.user!.role === role) {
        akses = true;
      }
    });
    if (akses) {
      await next();
    } else {
      return response.unauthorized({
        message: "Role Tidak Memiliki Akses Disini!",
      });
    }
  }
}
