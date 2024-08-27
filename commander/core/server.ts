import express from 'express';
import mongoose from 'mongoose';
import systemInfoRoutes from '../routes/system-info-routes';
import apiRoutes from '../routes/api-routes';
import dotenv from "dotenv";
import issueRoutes from '../routes/issue-routes';
import applicationRoutes from '../routes/applicatoin-routes';
import scanRoutes from '../routes/scan-routes';

dotenv.config();
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URI || "");

app.use(express.json());

app.use('/api/v1', systemInfoRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1', issueRoutes);
app.use('/api/v1', applicationRoutes);
app.use('/api/v1', scanRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});