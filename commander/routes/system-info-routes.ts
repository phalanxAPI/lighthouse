import express from 'express';
import { getSystemInfo } from '../controllers/system-info-controller';

const systemInfoRoutes = express.Router();

// Update the route to take appId and serverId as parameters
systemInfoRoutes.get('/system-info', getSystemInfo);

export default systemInfoRoutes;