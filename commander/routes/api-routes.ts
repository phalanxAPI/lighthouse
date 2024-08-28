import express from 'express';
import { getAPIInfo, getAPIInfoById, getRequestLogsForGraphByApiId, getRequestLogsForGraph, markAPIDeprecated } from '../controllers/api-controller';

const apiRoutes = express.Router();

// Fetch API info based on appId, isVerified, and isDeprecated
apiRoutes.get('/api-info', getAPIInfo);

apiRoutes.get('/api-info/:id', getAPIInfoById);

apiRoutes.get('/api-info-graph', getRequestLogsForGraph);

apiRoutes.put('/api-info/:id/deprecate', markAPIDeprecated);

apiRoutes.get('/api-info-graph/:id', getRequestLogsForGraphByApiId);

export default apiRoutes;