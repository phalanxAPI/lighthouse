import { NavigatorRequest } from "../types/proto";
import API from "../../arsenal/models/api";
import Application from "../../arsenal/models/application";
import Server from "../../arsenal/models/server";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";

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
      const newPath =
        parentPath === "/" ? `/${segment}` : `${parentPath}/${segment}`;
      flattenRoutingTree(childTree, newPath, apis);
    });
  }

  return apis;
};

export const updateRoutesHandler = async (
  data: NavigatorRequest
): Promise<Empty> => {
  try {
    // Upsert the application
    const application = await Application.findOneAndUpdate(
      { name: data.appId },
      { $set: { baseUrl: data.baseUrl } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const appId = application._id;

    // Upsert the server
    await Server.findOneAndUpdate(
      { name: data.serverId, appId: appId },
      { $set: { name: data.serverId, appId: appId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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
