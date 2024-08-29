// proto.ts
export type SysMonRequest = {
  appId: string;
  serverId: string;
  cpuLoad: number;
  memUsage: {
    active: number;
    total: number;
    usagePercent: number;
  };
  diskIO: {
    read: number;
    write: number;
  };
  networkStats: {
    interface: string;
    rx_sec: number;
    tx_sec: number;
  }[];
  battery: {
    percent: number;
    isCharging: boolean;
  };
};

export type SysMonResponse = {
  message: string; // Update the response type to include a message
};

export type SysMonService = {
  SysMon: (data: SysMonRequest) => Promise<SysMonResponse>;
};