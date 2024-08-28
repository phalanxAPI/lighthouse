import { Request, Response } from "express";
import mongoose from "mongoose";
import Scan from "../../arsenal/models/scan";

export const getScans = async (req: Request, res: Response) => {
  const { appId, perPage = "10", page = "1" } = req.query;

  try {
    // Convert perPage and page to numbers
    const limit = parseInt(perPage as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * limit;

    // Convert appId to ObjectId if provided
    const appObjectId = appId
      ? new mongoose.Types.ObjectId(appId as string)
      : null;

    // Fetch scans with pagination and filter by appId if provided
    const query = appObjectId ? { appId: appObjectId } : {};
    const scans = await Scan.find(query).skip(skip).limit(limit);

    if (scans.length === 0) {
      return res.status(404).json({ message: "No scans found" });
    }

    // Get total count for pagination metadata
    const totalCount = await Scan.countDocuments(query);

    res.json({
      data: scans,
      meta: {
        totalCount,
        perPage: limit,
        currentPage: parseInt(page as string, 10),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching scans", error });
  }
};

export const getScanById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Convert id to ObjectId
    const scanId = new mongoose.Types.ObjectId(id);

    // Fetch individual scan by id
    const scan = await Scan.findById(scanId);

    if (!scan) {
      return res.status(404).json({ message: "Scan not found" });
    }

    res.json(scan);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scan", error });
  }
};
