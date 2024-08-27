import express from 'express';
import { getScans, getScanById } from '../controllers/scan-controller';

const scanRoutes = express.Router();

scanRoutes.get('/scans', getScans);
scanRoutes.get('/scans/:id', getScanById);

export default scanRoutes;