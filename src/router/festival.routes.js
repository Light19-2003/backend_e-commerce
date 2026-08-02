import express from "express";
import {
  CreateCustomFestival,
  DeleteCustomFestival,
  GetCustomFestivals,
  UpdateCustomFestival,
} from "../controller/festival.controller.js";
import { isAdmin } from "../middlewere/is-admin.middlewere.js";

const routes = express.Router();

routes.get("/custom", GetCustomFestivals);
routes.post("/custom", isAdmin, CreateCustomFestival);
routes.put("/custom/:slug", isAdmin, UpdateCustomFestival);
routes.delete("/custom/:slug", isAdmin, DeleteCustomFestival);

export default routes;
