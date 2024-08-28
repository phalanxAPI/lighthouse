import express from "express";
import {
  getApplications,
  getApplicationById,
  upsertApplicationBaseUrl,
} from "../controllers/application-controller";

const applicationRoutes = express.Router();

applicationRoutes.get("/applications", getApplications);
applicationRoutes.get("/applications/:id", getApplicationById);
applicationRoutes.put("/applications/:id/baseUrl", upsertApplicationBaseUrl);

export default applicationRoutes;
