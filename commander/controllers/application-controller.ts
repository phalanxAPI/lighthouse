import { Request, Response } from "express";
import mongoose from "mongoose";
import Application from "../../arsenal/models/application"; // Adjust the import path as needed
import Server from "../../arsenal/models/server";
import RequestLog from "../../arsenal/models/request-log";
import SecurityConfiguration from "../../arsenal/models/security-conf";

export const getApplications = async (req: Request, res: Response) => {
  const { perPage = "10", page = "1" } = req.query;

  try {
    // Convert perPage and page to numbers
    const limit = parseInt(perPage as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * limit;

    // Fetch applications with pagination
    const applications = await Application.find().skip(skip).limit(limit);

    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }

    // Get total count for pagination metadata
    const totalCount = await Application.countDocuments();

    // Fetch server counts and hits for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const serverCount = await Server.countDocuments({ appId: app._id });
        const hits = await RequestLog.countDocuments({
          appId: app._id,
          requestType: "INCOMING",
        });
        return {
          ...app.toObject(),
          serverCount,
          hits,
        };
      })
    );

    res.json({
      data: applicationsWithDetails,
      meta: {
        totalCount,
        perPage: limit,
        currentPage: parseInt(page as string, 10),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications", error });
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
      return res.status(404).json({ message: "Application not found" });
    }

    // Fetch the number of hits (incoming requests) for the application
    const hits = await RequestLog.countDocuments({
      appId: applicationId,
      requestType: "INCOMING",
    });

    const serverCount = await Server.countDocuments({ appId: id });

    res.json({
      ...application.toObject(),
      serverCount,
      hits,
      baseUrl: application.baseUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching application", error });
  }
};

export const upsertApplicationBaseUrl = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { baseUrl } = req.body;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Application ID" });
    }

    const applicationId = new mongoose.Types.ObjectId(id);

    // Upsert the baseUrl
    const application = await Application.findOneAndUpdate(
      { _id: applicationId },
      { baseUrl },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found or created" });
    }

    res.json(application);
  } catch (error) {
    console.error(`Error upserting baseUrl: ${error}`); // Debugging log
    res.status(500).json({ message: "Error upserting baseUrl", error });
  }
};

export const getAllApplicationServers = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Convert id to ObjectId
    const applicationId = new mongoose.Types.ObjectId(id);

    // Fetch all servers for the application
    const servers = await Server.find({ appId: applicationId });

    if (servers.length === 0) {
      return res
        .status(404)
        .json({ message: "No servers found for the application" });
    }

    res.json(servers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching servers", error });
  }
};
