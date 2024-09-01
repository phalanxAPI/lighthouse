import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import apiRoutes from "../routes/api-routes";
import applicationRoutes from "../routes/application-routes";
import issueRoutes from "../routes/issue-routes";
import rulesConfigRouter from "../routes/rulesconfig-routes";
import scanRoutes from "../routes/scan-routes";
import systemInfoRoutes from "../routes/system-info-routes";

dotenv.config();
const app = express();
const port = process.env.COMMANDER_PORT || 8000;

mongoose.connect(process.env.MONGODB_URI || "");

app.use(bodyParser.json());
app.use(cors());
app.use("/api/v1", systemInfoRoutes);
app.use("/api/v1", apiRoutes);
app.use("/api/v1", issueRoutes);
app.use("/api/v1", applicationRoutes);
app.use("/api/v1", scanRoutes);
app.use("/api/v1", rulesConfigRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
