import { updateRoutesHandler } from "../services/navigator-app";
import { NavigatorService } from "../types/proto";

export const services: NavigatorService = {
  UpdateRoutes: updateRoutesHandler,
};