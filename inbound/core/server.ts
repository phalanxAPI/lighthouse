import * as gRPC from "@grpc/grpc-js";
import * as path from "path";
import { GrpcObject, ServiceClientConstructor } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { InboundService } from "../types/proto";

const PORT = process.env.INBOUND_PORT || 9003;

const packageDef = loadSync(
  path.join(__dirname, "../../arsenal/proto/inbound.lighthouse.proto"),
  {}
);

const gRPCObject = gRPC.loadPackageDefinition(packageDef);

const phalanxPackage = gRPCObject.phalanx as GrpcObject;
const arsenalPackage = phalanxPackage.arsenal as GrpcObject;
const lighthousePackage = arsenalPackage.lighthouse as GrpcObject;
export const inboundPackage = lighthousePackage.inbound as GrpcObject;

const inboundConstructor =
  inboundPackage.InboundService as ServiceClientConstructor;
const InboundService = inboundConstructor.service;

const server = new gRPC.Server();

const initServer = (service: InboundService) => {
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

  server.addService(InboundService, servicesMap);
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    gRPC.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Inbound Server bound on port ${port}`);
    }
  );
};

export default initServer;
