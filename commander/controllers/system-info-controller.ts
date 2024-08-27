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

export const getCpuUsageForGraph = async (req: Request, res: Response) => {
    const { appId, serverId } = req.query;

    try {
        // Convert query parameters to ObjectId
        const appObjectId = new mongoose.Types.ObjectId(appId as string);
        const serverObjectId = new mongoose.Types.ObjectId(serverId as string);

        // Get the current date and the date one week ago
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        // Aggregate CPU usage by hour for the past week
        const logs = await SystemInfo.aggregate([
            {
                $match: {
                    appId: appObjectId,
                    serverId: serverObjectId,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        hour: { $hour: "$createdAt" }
                    },
                    avgCpuLoad: { $avg: "$cpuLoad" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 }
            }
        ]);

        // Generate the full range of hours for the past week
        const fullRange: Date[] = [];
        for (let d = new Date(startDate); d <= endDate; d.setHours(d.getHours() + 1)) {
            fullRange.push(new Date(d));
        }

        // Format the data for the graph
        const graphData = fullRange.map(date => {
            const log = logs.find(log => 
                log._id.year === date.getFullYear() &&
                log._id.month === date.getMonth() + 1 &&
                log._id.day === date.getDate() &&
                log._id.hour === date.getHours()
            );

            return {
                time: date,
                avgCpuLoad: log ? log.avgCpuLoad : 0
            };
        });

        res.json(graphData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching CPU usage for graph', error });
    }
};

export const getMemoryUsageForGraph = async (req: Request, res: Response) => {
    const { appId, serverId } = req.query;

    try {
        // Convert query parameters to ObjectId
        const appObjectId = new mongoose.Types.ObjectId(appId as string);
        const serverObjectId = new mongoose.Types.ObjectId(serverId as string);

        // Get the current date and the date one week ago
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        // Aggregate memory usage by hour for the past week
        const logs = await SystemInfo.aggregate([
            {
                $match: {
                    appId: appObjectId,
                    serverId: serverObjectId,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        hour: { $hour: "$createdAt" }
                    },
                    avgMemUsagePercent: { $avg: "$memUsage.usagePercent" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 }
            }
        ]);

        // Generate the full range of hours for the past week
        const fullRange: Date[] = [];
        for (let d = new Date(startDate); d <= endDate; d.setHours(d.getHours() + 1)) {
            fullRange.push(new Date(d));
        }

        // Format the data for the graph
        const graphData = fullRange.map(date => {
            const log = logs.find(log => 
                log._id.year === date.getFullYear() &&
                log._id.month === date.getMonth() + 1 &&
                log._id.day === date.getDate() &&
                log._id.hour === date.getHours()
            );

            return {
                time: date,
                avgMemUsagePercent: log ? log.avgMemUsagePercent : 0
            };
        });

        res.json(graphData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memory usage for graph', error });
    }
};

export const getDiskIOForGraph = async (req: Request, res: Response) => {
    const { appId, serverId } = req.query;

    try {
        // Convert query parameters to ObjectId
        const appObjectId = new mongoose.Types.ObjectId(appId as string);
        const serverObjectId = new mongoose.Types.ObjectId(serverId as string);

        // Get the current date and the date one week ago
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        // Aggregate disk I/O by hour for the past week
        const logs = await SystemInfo.aggregate([
            {
                $match: {
                    appId: appObjectId,
                    serverId: serverObjectId,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        hour: { $hour: "$createdAt" }
                    },
                    avgDiskRead: { $avg: "$diskIO.read" },
                    avgDiskWrite: { $avg: "$diskIO.write" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 }
            }
        ]);

        // Generate the full range of hours for the past week
        const fullRange: Date[] = [];
        for (let d = new Date(startDate); d <= endDate; d.setHours(d.getHours() + 1)) {
            fullRange.push(new Date(d));
        }

        // Format the data for the graph
        const graphData = fullRange.map(date => {
            const log = logs.find(log => 
                log._id.year === date.getFullYear() &&
                log._id.month === date.getMonth() + 1 &&
                log._id.day === date.getDate() &&
                log._id.hour === date.getHours()
            );

            return {
                time: date,
                avgDiskRead: log ? log.avgDiskRead : 0,
                avgDiskWrite: log ? log.avgDiskWrite : 0
            };
        });

        res.json(graphData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching disk I/O for graph', error });
    }
};

export const getNetworkStatsForGraph = async (req: Request, res: Response) => {
    const { appId, serverId } = req.query;

    try {
        // Convert query parameters to ObjectId
        const appObjectId = new mongoose.Types.ObjectId(appId as string);
        const serverObjectId = new mongoose.Types.ObjectId(serverId as string);

        // Get the current date and the date one week ago
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        // Aggregate network stats by hour for the past week
        const logs = await SystemInfo.aggregate([
            {
                $match: {
                    appId: appObjectId,
                    serverId: serverObjectId,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $unwind: "$networkStats"
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        hour: { $hour: "$createdAt" },
                        interface: "$networkStats.interface"
                    },
                    avgRxSec: { $avg: "$networkStats.rx_sec" },
                    avgTxSec: { $avg: "$networkStats.tx_sec" }
                }
            },
            {
                $sort: { "_id.interface": 1, "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 }
            }
        ]);

        // Generate the full range of hours for the past week
        const fullRange: Date[] = [];
        for (let d = new Date(startDate); d <= endDate; d.setHours(d.getHours() + 1)) {
            fullRange.push(new Date(d));
        }

        // Format the data for the graph
        const graphData = fullRange.map(date => {
            const log = logs.find(log => 
                log._id.year === date.getFullYear() &&
                log._id.month === date.getMonth() + 1 &&
                log._id.day === date.getDate() &&
                log._id.hour === date.getHours()
            );

            return {
                time: date,
                avgRxSec: log ? log.avgRxSec : 0,
                avgTxSec: log ? log.avgTxSec : 0
            };
        });

        res.json(graphData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching network stats for graph', error });
    }
};