import Application from "../../arsenal/models/application";
import Server from "../../arsenal/models/server";
import SystemInfo from "../../arsenal/models/system-info";
import { ReportSystemStateRequest, SysMonResponse } from "../types/proto";

export const sysMon = async (
  data: ReportSystemStateRequest
): Promise<SysMonResponse> => {
  const { appId, serverId, timestamp, systemInfo } = data;

  const newTimestamp = new Date(
    parseInt((timestamp as any).seconds.toString()) * 1000
  );

  try {
    console.log(data);
    const app = await Application.findOne({ name: data.appId });
    if (!app) {
      console.error("Application not found");
      throw new Error("Application not found");
    }

    const server = await Server.findOne({
      name: data.serverId,
      appId: app._id,
    });
    if (!server) {
      console.error("Server not found");
      throw new Error("Server not found");
    }

    await SystemInfo.create({
      appId: app,
      serverId: server,
      timestamp: newTimestamp,
      ...systemInfo, // Spread the systemInfo object to include its properties
    });

    return;
  } catch (err) {
    console.error(`Error storing system monitoring data: ${err}`);
    throw new Error("Failed to store system monitoring data");
  }
};
