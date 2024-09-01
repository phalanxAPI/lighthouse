import * as gRPC from "@grpc/grpc-js";
import { GrpcObject, ServiceClientConstructor } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import * as path from "path";
import { SysMonService } from "../types/proto";

const PORT = process.env.SYSMON_PORT || 9002;

const packageDef = loadSync(
  path.join(__dirname, "../../arsenal/proto/sysmon.lighthouse.proto"),
  {}
);
const gRPCObject = gRPC.loadPackageDefinition(packageDef);

const phalanxPackage = gRPCObject.phalanx as GrpcObject;
const arsenalPackage = phalanxPackage.arsenal as GrpcObject;
const lighthousePackage = arsenalPackage.lighthouse as GrpcObject;
export const sysmonPackage = lighthousePackage.sysmon as GrpcObject;

const sysmonConstructor =
  sysmonPackage.SysmonService as ServiceClientConstructor;
const SysmonService = sysmonConstructor.service;

const server = new gRPC.Server();

const initServer = (service: SysMonService) => {
  const servicesMap: gRPC.UntypedServiceImplementation = {};

  Object.entries(service).forEach(([key, value]) => {
    servicesMap[key] = async (call: any, callback: any) => {
      try {
        const response = await value(call.request);
        callback(null, response);
      } catch (err) {
        console.error(err);
        callback(err, null);
      }
    };
  });

  server.addService(SysmonService, servicesMap);
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    gRPC.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Server bound on port ${port}`);
    }
  );
};

export default initServer;
