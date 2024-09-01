import { NavigatorRequest } from "../types/proto";
import API from "../../arsenal/models/api";
import Application from "../../arsenal/models/application";
import Server from "../../arsenal/models/server";
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
    let application = await Application.findOne({ name: data.appName });
    let appId;

    if (!application) {
      // Create a new application if it doesn't exist
      application = new Application({
        name: data.appName,
        baseUrl: "", // Set the baseUrl as needed
      });
      await application.save();
      appId = application._id;
      console.log(`Created new application: ${data.appName}`);

      // Create a new server for the application
      const server = new Server({
        name: data.serverName,
        appId: appId,
      });
      await server.save();
      console.log(`Created new server: ${data.serverName} for application: ${data.appName}`);
    } else {
      appId = application._id;
    }

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