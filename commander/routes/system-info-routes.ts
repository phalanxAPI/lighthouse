import express from 'express';
import { getSystemInfo } from './controllers/system-info-controller';

const systemInfoRoutes = express.Router();

systemInfoRoutes.get('/system-info', getSystemInfo);

export default systemInfoRoutes;