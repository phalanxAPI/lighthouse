import express from "express";
import { handleUserCreation } from "../controllers/clerk-controller";

const apiRoutes = express.Router();

// Fetch API info based on appId, isVerified, and isDeprecated
apiRoutes.post("/users", handleUserCreation);

export default apiRoutes;
