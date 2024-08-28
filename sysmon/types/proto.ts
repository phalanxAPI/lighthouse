export type SysMonRequest = {
  appId: string;
};

export type SysMonResponse = {
  scanId: string;
};

export type SysMonService = {
  SysMon: (data: SysMonRequest) => Promise<SysMonResponse>;
};
