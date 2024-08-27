import { Request, Response } from 'express';
import API from '../../arsenal/models/api'; // Adjust the import path as needed
import mongoose from 'mongoose';

export const getAPIInfo = async (req: Request, res: Response) => {
    const { appId } = req.query;

    console.log(`Received appId: ${appId}`); // Debugging log

    try {
        // Convert appId to ObjectId
        const appObjectId = new mongoose.Types.ObjectId(appId as string);

        // Fetch API info based on query
        const apiInfo = await API.find( { appId: appObjectId } );

        if (apiInfo.length === 0) {
            return res.status(404).json({ message: 'API info not found' });
        }

        res.json(apiInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching API info', error });
    }
};