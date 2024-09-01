import { reportOutbound } from "../services/outbound-app";
import { OutboundService } from "../types/proto";

export const services: OutboundService = {
  reportOutbound: reportOutbound,
};
