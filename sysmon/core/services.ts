import { sysMon } from "../services/sysmon-app";
import { SysMonService } from "../types/proto";

export const services: SysMonService = {
  reportSystemState: sysMon,
};