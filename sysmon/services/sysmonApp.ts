// sysMon.ts
import SystemInfo from "../../arsenal/models/system-info";
import { SysMonRequest, SysMonResponse } from "../types/proto";

export const sysMon = async (data: SysMonRequest): Promise<SysMonResponse> => {
  const { appId, serverId, cpuLoad, memUsage, diskIO, networkStats, battery } =
    data;

  try {
    const sysMonEntry = await SystemInfo.create({
      appId,
      serverId,
      cpuLoad,
      memUsage,
      diskIO,
      networkStats,
      battery,
    });

    return { scanId: sysMonEntry._id.toString() };
  } catch (err) {
    console.error(`Error storing system monitoring data: ${err}`);
    throw new Error("Failed to store system monitoring data");
  }
};
