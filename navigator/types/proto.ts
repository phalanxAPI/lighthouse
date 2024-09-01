import { Empty } from "google-protobuf/google/protobuf/empty_pb";

export type RoutingTree = {
  methods?: Record<string, boolean>;
  children?: Record<string, RoutingTree>;
};

export type NavigatorRequest = {
  appName: string;
  routingTree: RoutingTree;
};

export type NavigatorService = {
  UpdateRoutes: (data: NavigatorRequest) => Promise<Empty>;
};