import * as gRPC from "@grpc/grpc-js";
import { GrpcObject, ServiceClientConstructor } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { SysMonService } from "../types/proto";

const PORT = process.env.PORT || 9001;

const packageDef = loadSync("arsenal/proto/sysmon.lighthouse.proto", {});
const gRPCObject = gRPC.loadPackageDefinition(packageDef);

const phalanxPackage = gRPCObject.phalanx as GrpcObject;
const arsenalPackage = phalanxPackage.arsenal as GrpcObject;
const lighthousePackage = arsenalPackage.lighthouse as GrpcObject;
const sysmonPackage = lighthousePackage.sysmon as GrpcObject;

const sysmonConstructor = scoutPackage.SysMonService as ServiceClientConstructor;
const SysMonService = sysmonConstructor.service;

const server = new gRPC.Server();

const initServer = (service: SysMonService) => {
  const servicesMap: gRPC.UntypedServiceImplementation = {};

  Object.entries(service).forEach(([key, value]) => {
    servicesMap[key] = async (call, callback) => {
      try {
        const response = await value(call.request);
        callback(null, response);
      } catch (err) {
        console.error(err);
        callback(err, null);
      }
    };
  });

  server.addService(SysMonService, servicesMap);
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
