import express from 'express';
import mongoose from 'mongoose';
import systemInfoRoutes from '../routes/system-info-routes';
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URI || "");

app.use('/api/v1', systemInfoRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});