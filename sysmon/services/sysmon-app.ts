// sysMon.ts
import SystemInfo from "../../arsenal/models/system-info";
import { ReportSystemStateRequest, SysMonResponse } from "../types/proto";

export const sysMon = async (data: ReportSystemStateRequest): Promise<SysMonResponse> => {
  const { appId, serverId, timestamp, systemInfo } = data;

  const newTimestamp = new Date(
    parseInt((timestamp as any).seconds.toString()) * 1000
  );

  try {
    const sysMonEntry = await SystemInfo.create({
      appId,
      serverId,
      timestamp: newTimestamp,
      ...systemInfo, // Spread the systemInfo object to include its properties
    });

    return;
  } catch (err) {
    console.error(`Error storing system monitoring data: ${err}`);
    throw new Error("Failed to store system monitoring data");
  }
};