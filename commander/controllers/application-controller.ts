import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Application from '../../arsenal/models/application'; // Adjust the import path as needed
import Server from '../../arsenal/models/server';

export const getApplications = async (req: Request, res: Response) => {
    const { perPage = '10', page = '1' } = req.query;

    try {
        // Convert perPage and page to numbers
        const limit = parseInt(perPage as string, 10);
        const skip = (parseInt(page as string, 10) - 1) * limit;

        // Fetch applications with pagination
        const applications = await Application.find()
            .skip(skip)
            .limit(limit);

        if (applications.length === 0) {
            return res.status(404).json({ message: 'No applications found' });
        }

        // Get total count for pagination metadata
        const totalCount = await Application.countDocuments();

        // Fetch server counts for each application
        const applicationsWithServerCount = await Promise.all(applications.map(async (app) => {
            const serverCount = await Server.countDocuments({ appId: app._id });
            return {
                ...app.toObject(),
                serverCount
            };
        }));

        res.json({
            data: applicationsWithServerCount,
            meta: {
                totalCount,
                perPage: limit,
                currentPage: parseInt(page as string, 10),
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error });
    }
};

export const getApplicationById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Convert id to ObjectId
        const applicationId = new mongoose.Types.ObjectId(id);

        // Fetch individual application by id
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application', error });
    }
};