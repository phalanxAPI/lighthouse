import express from 'express';
import { getAPIInfo, getAPIInfoById, getRequestLogsForGraph } from '../controllers/api-controller';

const apiRoutes = express.Router();

// Fetch API info based on appId, isVerified, and isDeprecated
apiRoutes.get('/api-info', getAPIInfo);

apiRoutes.get('/api-info/:id', getAPIInfoById);

apiRoutes.get('/api-info-graph', getRequestLogsForGraph);

export default apiRoutes;