import express from 'express';
import { getApplications, getApplicationById } from '../controllers/application-controller';

const applicationRoutes = express.Router();

applicationRoutes.get('/applications', getApplications);
applicationRoutes.get('/applications/:id', getApplicationById);

export default applicationRoutes;