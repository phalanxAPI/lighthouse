import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";

export type ReportOutboundRequest = {
  appId: string;
  serverId: string;
  method: string;
  url: string;
  reqParams: Record<string, string>;
  reqBody: Record<string, string>;
  reqHeaders: Record<string, string>;
  statusCode: number;
  resBody: Record<string, string>;
  resHeaders: Record<string, string>;
  timestamp: Timestamp;
  duration: string;
};

export type OutboundResponse = void;

export type OutboundService = {
  reportOutbound: (data: ReportOutboundRequest) => Promise<OutboundResponse>;
};
