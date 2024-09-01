import API from "../../arsenal/models/api";
import Application from "../../arsenal/models/application";
import RequestLog from "../../arsenal/models/request-log";
import Server from "../../arsenal/models/server";
import {
  ReportInboundRequest,
  ReportInboundResponse,
  ReportResponseToInboundRequest,
} from "../types/proto";

export const inboundHandler = async (
  data: ReportInboundRequest
): Promise<ReportInboundResponse> => {
  try {
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

    const api = await API.findOne({
      appId: app._id,
      method: data.method,
      endpoint: data.url,
    });
    if (!api) {
      return { requestId: "" };
    }

    // TODO: Create issue if API is deprecated

    const timestamp = new Date(
      parseInt((data.timestamp as any).seconds.toString()) * 1000
    );

    const requestLogEntry = new RequestLog({
      apiId: api,
      appId: app,
      serverId: server,
      method: data.method,
      url: data.url,
      reqParams: data.params,
      reqBody: data.body,
      reqHeaders: data.headers,
      timestamp: timestamp,
      requestType: "INCOMING",
    });

    const savedEntry: any = await requestLogEntry.save();

    return { requestId: savedEntry._id.toString() };
  } catch (err) {
    console.error(`Error saving inbound request log: ${err}`);
    throw new Error("Failed to log inbound request");
  }
};

export const inboundResponseHandler = async (
  data: ReportResponseToInboundRequest
): Promise<void> => {
  try {
    const updateResult = await RequestLog.findByIdAndUpdate(data.requestId, {
      statusCode: data.statusCode.toString(),
      resBody: data.body,
      resHeaders: data.headers,
      duration: data.processingTimeMs,
    });

    if (!updateResult) {
      console.error(`RequestLog with requestId ${data.requestId} not found.`);
      throw new Error("RequestLog entry not found");
    }
  } catch (err) {
    console.error(`Error updating inbound response log: ${err}`);
    throw new Error("Failed to log inbound response");
  }
};
