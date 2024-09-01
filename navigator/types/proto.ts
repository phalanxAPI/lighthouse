import { Empty } from "google-protobuf/google/protobuf/empty_pb";

export type RoutingTree = {
  methods?: Record<string, boolean>;
  children?: Record<string, RoutingTree>;
};

export type NavigatorRequest = {
  appId: string;
  serverId: string;
  baseUrl: string;
  routingTree: RoutingTree;
};

export type NavigatorService = {
  UpdateRoutes: (data: NavigatorRequest) => Promise<Empty>;
};