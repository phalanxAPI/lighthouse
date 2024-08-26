import { Request, Response } from 'express';
import SystemInfo from '../../arsenal/models/system-info'; // Adjust the import path as needed
import mongoose from 'mongoose';

// Update the getSystemInfo function to handle appId and serverId parameters
export const getSystemInfo = async (req: Request, res: Response) => {
    const { appId, serverId } = req.query;

    console.log(`Received appId: ${appId}, serverId: ${serverId}`); // Debugging log

    try {
        // Convert query parameters to ObjectId
        const appObjectId = new mongoose.Types.ObjectId(appId as string);
        const serverObjectId = new mongoose.Types.ObjectId(serverId as string);

        // Fetch system info based on appId and serverId
        const systemInfo = await SystemInfo.findOne({ 
            appId: appObjectId, 
            serverId: serverObjectId 
        });

        if (!systemInfo) {
            return res.status(404).json({ message: 'System info not found' });
        }

        res.json(systemInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching system info', error });
    }
};