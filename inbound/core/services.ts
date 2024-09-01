import { inboundHandler, inboundResponseHandler } from "../services/inbound-app";
import { InboundService } from "../types/proto";

export const services: InboundService = {
  ReportInbound: inboundHandler,
  ReportResponseToInbound: inboundResponseHandler,
};
