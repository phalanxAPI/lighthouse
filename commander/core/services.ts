import * as gRPC from "@grpc/grpc-js";
import { GrpcObject, ServiceClientConstructor } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import dotenv from "dotenv";

dotenv.config();

const packageDef = loadSync("arsenal/proto/scout.proto", {});
const gRPCObject = gRPC.loadPackageDefinition(packageDef);

const phalanxPackage = gRPCObject.phalanx as GrpcObject;
const arsenalPackage = phalanxPackage.arsenal as GrpcObject;
const scoutPackage = arsenalPackage.scout as GrpcObject;

const scoutConstructor = scoutPackage.ScoutService as ServiceClientConstructor;

export var scoutClient = new scoutConstructor(
  process.env.SCOUT_SERVICE || "localhost:9001",
  gRPC.credentials.createInsecure()
);
