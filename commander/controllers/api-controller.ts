import { Request, Response } from "express";
import API from "../../arsenal/models/api"; // Adjust the import path as needed
import RequestLog from "../../arsenal/models/request-log"; // Adjust the import path as needed
import mongoose from "mongoose";

export const getAPIInfo = async (req: Request, res: Response) => {
  const { appId, perPage = "10", page = "1" } = req.query;

  console.log(`Received appId: ${appId}, perPage: ${perPage}, page: ${page}`); // Debugging log

  try {
    // Convert appId to ObjectId
    const appObjectId = new mongoose.Types.ObjectId(appId as string);

    // Convert perPage and page to numbers
    const limit = parseInt(perPage as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * limit;

    // Fetch API info based on query with pagination
    const apiInfo = await API.find({ appId: appObjectId })
      .skip(skip)
      .limit(limit);

    if (apiInfo.length === 0) {
      return res.status(404).json({ message: "API info not found" });
    }

    // Get total count for pagination metadata
    const totalCount = await API.countDocuments({ appId: appObjectId });

    // Get hits (number of INCOMING requests) for each API
    const apiInfoWithHits = await Promise.all(
      apiInfo.map(async (api) => {
        const hits = await RequestLog.countDocuments({
          apiId: api._id,
          requestType: "INCOMING",
        });
        return {
          ...api.toObject(),
          hits,
        };
      })
    );

    res.json({
      data: apiInfoWithHits,
      meta: {
        totalCount,
        perPage: limit,
        currentPage: parseInt(page as string, 10),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching API info", error });
  }
};

export const getAPIInfoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log(`Received id: ${id}`); // Debugging log

  try {
    // Convert id to ObjectId
    const apiObjectId = new mongoose.Types.ObjectId(id);

    // Fetch individual API info based on id
    const apiInfo = await API.findById(apiObjectId);

    if (!apiInfo) {
      return res.status(404).json({ message: "API info not found" });
    }

    // Get hits (number of INCOMING requests) for the API
    const hits = await RequestLog.countDocuments({
      apiId: apiObjectId,
      requestType: "INCOMING",
    });

    res.json({
      ...apiInfo.toObject(),
      hits,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching API info", error });
  }
};

export const getRequestLogsForGraph = async (req: Request, res: Response) => {
  const { apiId, requestType } = req.query;

  try {
    // Convert apiId to ObjectId
    const apiObjectId = new mongoose.Types.ObjectId(apiId as string);

    // Get the current date and the date one week ago
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Aggregate request logs by server and hour for the past week
    const logs = await RequestLog.aggregate([
      {
        $match: {
          apiId: apiObjectId,
          requestType: requestType,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            serverId: "$serverId",
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            hour: { $hour: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.serverId": 1,
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
          "_id.hour": 1,
        },
      },
    ]);

    // Generate the full range of hours for the past week
    const fullRange: Date[] = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setHours(d.getHours() + 1)
    ) {
      fullRange.push(new Date(d));
    }

    // Format the data for the graph
    const graphData = fullRange.map((date) => {
      const log = logs.find(
        (log) =>
          log._id.year === date.getFullYear() &&
          log._id.month === date.getMonth() + 1 &&
          log._id.day === date.getDate() &&
          log._id.hour === date.getHours()
      );

      return {
        serverId: log ? log._id.serverId : null,
        time: date,
        count: log ? log.count : 0,
      };
    });

    res.json(graphData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching request logs for graph", error });
  }
};

export const markAPIDeprecated = async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log(`Received id: ${id}`); // Debugging log

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid API ID" });
    }

    const apiObjectId = new mongoose.Types.ObjectId(id);

    // Update the API to mark it as deprecated and update the updatedAt time
    const updatedAPI = await API.findByIdAndUpdate(
      apiObjectId,
      {
        isDeprecated: true,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedAPI) {
      return res.status(404).json({ message: "API not found" });
    }

    res.json({
      message: "API marked as deprecated successfully",
      api: updatedAPI,
    });
  } catch (error) {
    console.error(`Error marking API as deprecated: ${error}`); // Debugging log
    res.status(500).json({ message: "Error marking API as deprecated", error });
  }
};

export const getRequestLogsForGraphByApiId = async (
  req: Request,
  res: Response
) => {
  const { apiId, requestType } = req.query;

  try {
    // Convert apiId to ObjectId
    const apiObjectId = new mongoose.Types.ObjectId(apiId as string);

    // Get the current date and the date one week ago
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Aggregate request logs by server and hour for the past week for the specific API
    const logs = await RequestLog.aggregate([
      {
        $match: {
          apiId: apiObjectId,
          requestType: requestType,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            serverId: "$serverId",
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            hour: { $hour: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.serverId": 1,
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
          "_id.hour": 1,
        },
      },
    ]);

    // Generate the full range of hours for the past week
    const fullRange: Date[] = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setHours(d.getHours() + 1)
    ) {
      fullRange.push(new Date(d));
    }

    // Format the data for the graph
    const graphData = fullRange.map((date) => {
      const log = logs.find(
        (log) =>
          log._id.year === date.getFullYear() &&
          log._id.month === date.getMonth() + 1 &&
          log._id.day === date.getDate() &&
          log._id.hour === date.getHours()
      );

      return {
        serverId: log ? log._id.serverId : null,
        time: date,
        count: log ? log.count : 0,
      };
    });

    res.json(graphData);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching request logs for API on servers",
        error,
      });
  }
};
