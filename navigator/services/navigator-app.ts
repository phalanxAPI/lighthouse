import { NavigatorRequest } from "../types/proto";
import API from "../../arsenal/models/api";
import Application from "../../arsenal/models/application";
import Server from "../../arsenal/models/server";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import User from "../../arsenal/models/user";
import { sendEmail } from "../../services/mailer";
import { UserRole } from "../../arsenal/types/user";

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
      const res = await API.findOneAndUpdate(
        { appId: appId, endpoint: api.endpoint, method: api.method },
        { $setOnInsert: { isVerified: false, isDeprecated: false } },
        { upsert: true }
      );

      // check if the api is newly created
      if (!res) {
        const admin = await User.findOne({ role: UserRole.ADMIN }).lean();
        if (admin) {
          const receiverMail = admin.email;
          const receiverName = `${admin.firstName} ${admin.lastName}`;
          const subject = `New API Detected in ${application.name}`;
          const apiData = await API.findOne({
            appId: appId,
            endpoint: api.endpoint,
            method: api.method,
          }).lean();
          const apiLink = `${process.env.PHALANX_BASE_URL}/apiInventory/${apiData?._id}`;
          const message = `Hello ${receiverName},\n\nA new API has been detected in the ${application.name} application. Please check, verify and setup security configurations for the API at ${apiLink}.`;

          sendEmail({
            subject: subject,
            body: message,
            to: receiverMail,
          });
        }
      }
    }

    return new Empty();
  } catch (err) {
    console.error(`Error updating routes: ${err}`);
    throw new Error("Failed to update routes");
  }
};
