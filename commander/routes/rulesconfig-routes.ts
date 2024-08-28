import express from 'express';
import { getSecurityConfigurationsByApiId } from '../controllers/rulesconfig-controller';

const rulesConfigRouter = express.Router();

rulesConfigRouter.get('/config/:apiId', getSecurityConfigurationsByApiId);

export default rulesConfigRouter;