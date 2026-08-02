import express from "express";
import {
  CreateCustomSeason,
  DeleteCustomSeason,
  GetCustomSeasons,
  UpdateCustomSeason,
} from "../controller/season.controller.js";
import { isAdmin } from "../middlewere/is-admin.middlewere.js";

const routes = express.Router();

routes.get("/custom", GetCustomSeasons);
routes.post("/custom", isAdmin, CreateCustomSeason);
routes.put("/custom/:slug", isAdmin, UpdateCustomSeason);
routes.delete("/custom/:slug", isAdmin, DeleteCustomSeason);

export default routes;
