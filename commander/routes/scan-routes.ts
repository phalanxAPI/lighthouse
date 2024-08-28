import express from "express";
import { getScans, getScanById, createScan } from "../controllers/scan-controller";

const scanRoutes = express.Router();

scanRoutes.get("/scans", getScans);
scanRoutes.get("/scans/:id", getScanById);
scanRoutes.post("/scans", createScan);

export default scanRoutes;
