import express from 'express';
import { getSecurityConfigurationsByApiId, upsertSecurityConfiguration } from '../controllers/rulesconfig-controller';

const rulesConfigRouter = express.Router();

rulesConfigRouter.get('/config/:apiId', getSecurityConfigurationsByApiId)
                 .put('/config/:apiId', upsertSecurityConfiguration);

export default rulesConfigRouter;