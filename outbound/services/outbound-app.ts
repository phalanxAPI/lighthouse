import { ObjectId } from "mongoose";
import Application from "../../arsenal/models/application";
import RequestLogModel from "../../arsenal/models/request-log";
import Server from "../../arsenal/models/server";
import { OutboundResponse, ReportOutboundRequest } from "../types/proto";
import { scoutAPILogs } from "./scout";

export const reportOutbound = async (
  requestInfo: ReportOutboundRequest
): Promise<OutboundResponse> => {
  try {
    const app = await Application.findOne({ name: requestInfo.appId });
    if (!app) {
      console.error("Application not found");
      throw new Error("Application not found");
    }

    const server = await Server.findOne({
      name: requestInfo.serverId,
      appId: app._id,
    });
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

    const history = await RequestLogModel.find({
      appId: app._id,
      url: requestInfo.url,
      method: requestInfo.method,
      requestType: "OUTGOING",
    })
      .sort({ timestamp: -1 })
      .limit(20);

    scoutAPILogs(history, outbound, {
      appId: (app._id as ObjectId).toString(),
      serverId: server.name,
    });

    return;
  } catch (err) {
    console.error(`Error storing outbound request: ${err}`);
    throw new Error("Failed to store outbound request");
  }
};
