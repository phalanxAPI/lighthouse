import { NavigatorRequest } from "../types/proto";
import API from "../../arsenal/models/api";
import Application from "../../arsenal/models/application";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import mongoose from "mongoose";

interface RoutingTree {
  methods?: Record<string, boolean>;
  children?: Record<string, RoutingTree>;
}

const flattenRoutingTree = (
  tree: RoutingTree,
  parentPath: string = "",
  apis: { endpoint: string; method: string }[] = []
) => {
  if (tree.methods) {
    Object.keys(tree.methods).forEach((method) => {
      apis.push({
        endpoint: parentPath,
        method: method.toUpperCase(),
      });
    });
  }

  if (tree.children) {
    Object.entries(tree.children).forEach(([segment, childTree]) => {
      const newPath = parentPath === "/" ? `/${segment}` : `${parentPath}/${segment}`;
      flattenRoutingTree(childTree, newPath, apis);
    });
  }

  return apis;
};

export const updateRoutesHandler = async (data: NavigatorRequest): Promise<Empty> => {
  try {
    // Find the application by name and get its ID
    const application = await Application.findOne({ name: data.appName });
    if (!application) {
      throw new Error(`Application with name ${data.appName} not found`);
    }
    const appId = application._id;

    const apis = flattenRoutingTree(data.routingTree, "/");

    for (const api of apis) {
      await API.findOneAndUpdate(
        { appId: appId, endpoint: api.endpoint, method: api.method },
        { $setOnInsert: { isVerified: false, isDeprecated: false } },
        { upsert: true, new: true }
      );
    }

    return new Empty();
  } catch (err) {
    console.error(`Error updating routes: ${err}`);
    throw new Error("Failed to update routes");
  }
};