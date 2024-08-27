import express from 'express';
import mongoose from 'mongoose';
import systemInfoRoutes from '../routes/system-info-routes';
import apiRoutes from '../routes/api-routes';
import dotenv from "dotenv";
import issueRoutes from '../routes/issue-routes';

dotenv.config();
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URI || "");

app.use(express.json());

app.use('/api/v1', systemInfoRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1', issueRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});