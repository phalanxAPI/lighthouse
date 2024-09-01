import express from "express";
import {
  getSecurityConfigurationsByApiId,
  upsertSecurityConfiguration,
  getSecurityConfigurationsByAppId,
  upsertSecurityConfigurationByAppId
} from "../controllers/rulesconfig-controller";

const rulesConfigRouter = express.Router();

rulesConfigRouter
  .get("/config/:apiId", getSecurityConfigurationsByApiId)
  .put("/config/:apiId", upsertSecurityConfiguration)
  .get("/config/app/:appId", getSecurityConfigurationsByAppId)
  .put("/config/app/:appId", upsertSecurityConfigurationByAppId);

export default rulesConfigRouter;
