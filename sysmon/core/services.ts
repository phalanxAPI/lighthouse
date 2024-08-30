import { sysMon } from "../services/sysmonApp";
import { SysMonService } from "../types/proto";

export const services: SysMonService = {
  reportSystemState: sysMon,
};