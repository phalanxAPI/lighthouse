import API from "../../arsenal/models/api";
import Application from "../../arsenal/models/application";
import Issue from "../../arsenal/models/issue";
import RequestLog from "../../arsenal/models/request-log";
import Server from "../../arsenal/models/server";
import User from "../../arsenal/models/user";
import { SecurityConfigType } from "../../arsenal/types/security-conf";
import { UserRole } from "../../arsenal/types/user";
import { sendEmail } from "../../services/mailer";
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

    if (api.isDeprecated) {
      const issueDescription =
        "This API has been deprecated and should not be used.";

      const issue = await Issue.create({
        apiId: api._id,
        appId: app._id,
        title: SecurityConfigType.IMPROPER_INVENTORY_MANAGEMENT,
        description: issueDescription,
        severity: "LOW",
      });

      const admin = await User.findOne({ role: UserRole.ADMIN }).lean();
      if (admin) {
        const receiverMail = admin.email;
        const receiverName = `${admin.firstName} ${admin.lastName}`;
        const issueLink = `${process.env.PHALANX_BASE_URL}/issues/${issue._id}`;
        const subject = `LOW Vulnerability Detected in ${app.name} API`;
        const message = `Hello ${receiverName},\n\nA ${"LOW"} vulnerability has been detected in the ${
          app.name
        } API. Please check the issue at ${issueLink}.\n\nRegards,\nAPI Arsenal`;

        sendEmail({
          subject: subject,
          body: message,
          to: receiverMail,
        });
      }
    }

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
