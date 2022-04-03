/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";
import BookingsController from "App/Controllers/Http/BookingsController";

Route.get("/", async () => {
  return { hello: "world" };
});

// Route Venues
Route.resource("venues", "VenuesController")
  .apiOnly()
  .middleware({ "*": ["auth", "acl:owner"] });

// Route Fields
Route.resource("venues.fields", "FieldsController")
  .apiOnly()
  .middleware({ "*": ["auth", "acl:owner"] });

//Bookings
Route.post("/fields/:field_id/bookings", "BookingsController.store")
  .as("bookings.store")
  .middleware(["auth", "acl:user"]);

Route.get("/fields/:id", "BookingsController.showBookings")
  .as("fields.bookings.showBookings")
  .middleware(["auth", "acl:user"]);

Route.resource("bookings", "BookingsController")
  .apiOnly()
  .middleware({
    "*": ["auth", "acl:user"],
  })
  .except(["store"]);

Route.post("/bookings/:id/join", "BookingsController.join")
  .as("bookings.join")
  .middleware(["auth", "acl:user"]);

Route.post("/bookings/:id/unjoin", "BookingsController.unjoin")
  .as("bookings.unjoin")
  .middleware(["auth", "acl:user"]);

Route.get("/schedules", "BookingsController.schedules")
  .as("bookings.schedules")
  .middleware(["auth", "acl:user"]);

// Auth
Route.post("/otp-verification", "AuthController.otp_verification").as(
  "auth.verify"
);
Route.post("/register", "AuthController.register").as("auth.register");
Route.post("/login", "AuthController.login").as("auth.login");
// .middleware(["verify"]);
