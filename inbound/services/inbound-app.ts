// inbound-app.ts
import { time } from "console";
import RequestLog from "../../arsenal/models/request-log";
import { ReportInboundRequest, ReportInboundResponse, ReportResponseToInboundRequest } from "../types/proto";

export const inboundHandler = async (data: ReportInboundRequest): Promise<ReportInboundResponse> => {
  try {
    const timestamp = new Date(
      parseInt((data.timestamp as any).seconds.toString()) * 1000
    );
    // Assuming appId, serverId, and method, path are already validated and transformed if necessary
    const requestLogEntry = new RequestLog({
      appId: data.appId,
      serverId: data.serverId,
      method: data.method,
      url: data.url,
      reqParams: data.params,
      reqBody: data.body,
      reqHeaders: data.headers,
      timestamp: timestamp, // Convert protobuf Timestamp to JavaScript Date
      requestType: "INCOMING",
    });

    const savedEntry: any = await requestLogEntry.save();
    
    return { requestId: savedEntry._id.toString() };
  } catch (err) {
    console.error(`Error saving inbound request log: ${err}`);
    throw new Error("Failed to log inbound request");
  }
};

export const inboundResponseHandler = async (data: ReportResponseToInboundRequest): Promise<void> => {
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