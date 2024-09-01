// proto.ts
import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";

export type NetworkStats = {
  interface: string;
  rxSec: number;
  txSec: number;
};

export type MemUsage = {
  active: number;
  total: number;
  usagePercent: string;
};

export type DiskIO = {
  read: number;
  write: number;
};

export type Battery = {
  percent: number;
  isCharging: boolean;
};

export type SystemInfo = {
  cpuLoad: string;
  memUsage: MemUsage;
  diskIO: DiskIO;
  networkStats: NetworkStats[];
  battery: Battery;
};

export type ReportSystemStateRequest = {
  appId: string;
  serverId: string;
  timestamp: Timestamp;
  systemInfo: SystemInfo;
};

export type SysMonResponse = void;

export type SysMonService = {
  reportSystemState: (data: ReportSystemStateRequest) => Promise<SysMonResponse>;
};