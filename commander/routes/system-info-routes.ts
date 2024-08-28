import express from "express";
import {
  getCpuUsageForGraph,
  getDiskIOForGraph,
  getMemoryUsageForGraph,
  getNetworkStatsForGraph,
  getSystemInfo,
} from "../controllers/system-info-controller";

const systemInfoRoutes = express.Router();

// Update the route to take appId and serverId as parameters
systemInfoRoutes.get("/system-info", getSystemInfo);
systemInfoRoutes.get("/system-info/cpu-usage", getCpuUsageForGraph);
systemInfoRoutes.get("/system-info/memory-usage", getMemoryUsageForGraph);
systemInfoRoutes.get("/system-info/disk-io", getDiskIOForGraph);
systemInfoRoutes.get("/system-info/network-stats", getNetworkStatsForGraph);

export default systemInfoRoutes;
