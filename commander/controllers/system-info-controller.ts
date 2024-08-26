import { Request, Response } from 'express';
import SystemInfo from '../../arsenal/';

export const getSystemInfo = async (req: Request, res: Response) => {
    try {
        const systemInfo = await SystemInfo.find().exec();
        res.json(systemInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch system information' });
    }
};