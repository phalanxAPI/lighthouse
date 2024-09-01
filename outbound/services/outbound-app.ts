import Application from "../../arsenal/models/application";
import RequestLogModel from "../../arsenal/models/request-log";
import Server from "../../arsenal/models/server";
import { OutboundResponse, ReportOutboundRequest } from "../types/proto";

export const reportOutbound = async (
  requestInfo: ReportOutboundRequest
): Promise<OutboundResponse> => {
  try {
    const app = await Application.findOne({ name: requestInfo.appId });
    if (!app) {
      console.error("Application not found");
      throw new Error("Application not found");
    }

    const server = await Server.findOne({ name: requestInfo.serverId });
    if (!server) {
      console.error("Server not found");
      throw new Error("Server not found");
    }

    const timestamp = new Date(
      parseInt((requestInfo.timestamp as any).seconds.toString()) * 1000
    );

    const outbound = await RequestLogModel.create({
      ...requestInfo,
      appId: app._id,
      serverId: server._id,
      requestType: "OUTGOING",
      timestamp,
    });

    console.log("Outbound request stored successfully", outbound);
    return;
  } catch (err) {
    console.error(`Error storing outbound request: ${err}`);
    throw new Error("Failed to store outbound request");
  }
};
