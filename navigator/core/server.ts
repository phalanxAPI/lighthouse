import * as gRPC from "@grpc/grpc-js";
import * as path from "path";
import { GrpcObject, ServiceClientConstructor } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { NavigatorService } from "../types/proto";

const PORT = process.env.NAVIGATOR_PORT || 9005;

const packageDef = loadSync(
  path.join(__dirname, "../../arsenal/proto/navigator.lighthouse.proto"),
  {}
);

const gRPCObject = gRPC.loadPackageDefinition(packageDef);
const phalanxPackage = gRPCObject.phalanx as GrpcObject;
const arsenalPackage = phalanxPackage.arsenal as GrpcObject;
const lighthousePackage = arsenalPackage.lighthouse as GrpcObject;
export const navigatorPackage = lighthousePackage.navigator as GrpcObject;

const navigatorConstructor = navigatorPackage.NavigatorService as ServiceClientConstructor;
const NavigatorService = navigatorConstructor.service;

const server = new gRPC.Server();

const initServer = (service: NavigatorService) => {
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

  server.addService(NavigatorService, servicesMap);
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    gRPC.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Navigator Server bound on port ${port}`);
    }
  );
};

export default initServer;