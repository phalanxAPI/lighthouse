import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";

export type ReportInboundRequest = {
  appId: string;
  serverId: string;
  method: string;
  url: string;
  params: Record<string, string>;
  body: Record<string, string>;
  headers: Record<string, string>;
  timestamp: Timestamp;
};

export type ReportInboundResponse = {
  requestId: string;
};

export type ReportResponseToInboundRequest = {
  requestId: string;
  appId: string;
  statusCode: number;
  body: Record<string, string>;
  headers: Record<string, string>;
  processingTimeMs: number;
};

export type InboundService = {
  ReportInbound: (data: ReportInboundRequest) => Promise<ReportInboundResponse>;
  ReportResponseToInbound: (
    data: ReportResponseToInboundRequest
  ) => Promise<void>;
};