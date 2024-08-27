import express from 'express';
import { getAPIInfo } from '../controllers/api-controller';

const apiRoutes = express.Router();

// Fetch API info based on appId, isVerified, and isDeprecated
apiRoutes.get('/api-info', getAPIInfo);

export default apiRoutes;