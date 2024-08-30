// sysMon.ts
import SystemInfo from "../../arsenal/models/system-info";
import { ReportSystemStateRequest, SysMonResponse } from "../types/proto";

export const sysMon = async (data: ReportSystemStateRequest): Promise<SysMonResponse> => {
  const { appId, serverId, timestamp, systemInfo } = data;

  try {
    const sysMonEntry = await SystemInfo.create({
      appId,
      serverId,
      timestamp,
      ...systemInfo, // Spread the systemInfo object to include its properties
    });

    return { message: "System monitoring data stored successfully" };
  } catch (err) {
    console.error(`Error storing system monitoring data: ${err}`);
    throw new Error("Failed to store system monitoring data");
  }
};