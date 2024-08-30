import Issue from "../../arsenal/models/issue"; // Adjust the import path as needed
import { Request, Response } from "express";
import mongoose from "mongoose";

interface IssueCount {
  status: string;
  severity: string;
  count: number;
}

interface DayIssues {
  _id: {
    day: number;
    month: number;
    year: number;
  };
  issues: IssueCount[];
}

export const getIssues = async (req: Request, res: Response) => {
  const { appId, perPage = "10", page = "1" } = req.query;

  console.log(`Received appId: ${appId}`); // Debugging log
  try {
    if (!appId) {
      return res.status(400).json({ message: "appId is required" });
    }

    const appObjectId = appId as string;
    console.log(`Converted appId to ObjectId: ${appObjectId}`); // Debugging log

    const limit = parseInt(perPage as string) || 10;
    const skip = (parseInt(page as string) - 1) * limit || 0;

    // Calculate the total number of documents
    const totalCount = await Issue.countDocuments({ appId: appObjectId });
    const totalPages = Math.ceil(totalCount / limit);

    const issues = await Issue.find({ appId: appObjectId })
      .limit(limit)
      .skip(skip);
    console.log(`Found issues: ${JSON.stringify(issues)}`); // Debugging log

    res.json({
      data: issues,
      metadata: {
        totalCount,
        totalPages,
        currentPage: parseInt(page as string),
        limit,
      },
    });
  } catch (error) {
    console.error(`Error fetching issues: ${error}`); // Debugging log
    res.status(500).json({ message: "Error fetching issues", error });
  }
};

export const getIssueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid issue ID" });
    }

    const docObjectId = new mongoose.Types.ObjectId(id);

    const issue = await Issue.findOne({ _id: docObjectId });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    console.error(`Error fetching issue: ${error}`); // Replace with proper logging in production
    res.status(500).json({ message: "Error fetching issue", error });
  }
};

export const assignAssigneeToIssue = async (req: Request, res: Response) => {
  const { assigneeId } = req.body;
  try {
    // Debugging log
    const updatedIssue = await Issue.findOneAndUpdate(
      { _id: req.params.id },
      { assigneeId: assigneeId },
      { new: true }
    );
    console.log(`Updated issue: ${JSON.stringify(updatedIssue)}`); // Debugging log

    if (!updatedIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ message: "Assignee updated successfully", updatedIssue });
  } catch (error) {
    console.error(`Error assigning assignee to issue: ${error}`); // Debugging log
    res
      .status(500)
      .json({ message: "Error assigning assignee to issue", error });
  }
};

export const getIssueCount = async (req: Request, res: Response) => {
  const { appId } = req.query;

  try {
    if (!appId) {
      return res.status(400).json({ message: "appId is required" });
    }

    const appObjectId = new mongoose.Types.ObjectId(appId as string);

    const counts = await Issue.aggregate([
      {
        $facet: {
          openIssues: [
            { $match: { status: "OPEN", appId: appObjectId } },
            { $count: "count" },
          ],
          lowSeverityIssues: [
            { $match: { severity: "LOW", appId: appObjectId } },
            { $count: "count" },
          ],
          highSeverityIssues: [
            { $match: { severity: "HIGH", appId: appObjectId } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const result = {
      openIssues: counts[0].openIssues[0]?.count || 0,
      lowSeverityIssues: counts[0].lowSeverityIssues[0]?.count || 0,
      highSeverityIssues: counts[0].highSeverityIssues[0]?.count || 0,
    };

    res.json(result);
  } catch (error) {
    console.error(`Error getting issue counts: ${error}`); // Replace with proper logging in production
    res.status(500).json({ message: "Error getting issue counts", error });
  }
};

export const getIssueGraph = async (req: Request, res: Response) => {
  const { appId } = req.query;

  try {
    if (!appId) {
      return res.status(400).json({ message: "appId is required" });
    }

    const appObjectId = new mongoose.Types.ObjectId(appId as string);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const counts = await Issue.aggregate([
      {
        $match: {
          appId: appObjectId,
          raisedAt: { $gte: threeDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$raisedAt" },
            month: { $month: "$raisedAt" },
            year: { $year: "$raisedAt" },
            status: "$status",
            severity: "$severity",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { day: "$_id.day", month: "$_id.month", year: "$_id.year" },
          issues: {
            $push: {
              status: "$_id.status",
              severity: "$_id.severity",
              count: "$count",
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    const result = counts.map((day: any) => {
      const openIssues = day.issues
        .filter((issue: any) => issue.status === "OPEN")
        .reduce((acc: any, issue: any) => acc + issue.count, 0);
      const highSeverityIssues = day.issues
        .filter((issue: any) => issue.severity === "HIGH")
        .reduce((acc: any, issue: any) => acc + issue.count, 0);
      const lowSeverityIssues = day.issues
        .filter((issue: any) => issue.severity === "LOW")
        .reduce((acc: any, issue: any) => acc + issue.count, 0);

      return {
        date: `${day._id.year}-${day._id.month}-${day._id.day}`,
        openIssues,
        highSeverityIssues,
        lowSeverityIssues,
      };
    });

    res.json({ data: result });
  } catch (error) {
    console.error(`Error getting issue graph: ${error}`); // Replace with proper logging in production
    res.status(500).json({ message: "Error getting issue graph", error });
  }
};

export const getIssueGraphBySeverityAndStatus = async (
  req: Request,
  res: Response
) => {
  const { appId } = req.query;

  try {
    if (!appId) {
      return res.status(400).json({ message: "appId is required" });
    }

    const appObjectId = new mongoose.Types.ObjectId(appId as string);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const counts = await Issue.aggregate([
      {
        $match: {
          appId: appObjectId,
          raisedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$raisedAt" },
            month: { $month: "$raisedAt" },
            day: { $dayOfMonth: "$raisedAt" },
            hour: { $hour: "$raisedAt" },
            status: "$status",
            severity: "$severity",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
            hour: "$_id.hour",
          },
          issues: {
            $push: {
              status: "$_id.status",
              severity: "$_id.severity",
              count: "$count",
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 },
      },
    ]);

    const fullRange: Date[] = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setHours(d.getHours() + 1)
    ) {
      fullRange.push(new Date(d));
    }

    const result = fullRange.map((date) => {
      const log = counts.find(
        (log) =>
          log._id.year === date.getFullYear() &&
          log._id.month === date.getMonth() + 1 &&
          log._id.day === date.getDate() &&
          log._id.hour === date.getHours()
      );

      const openIssues = log
        ? log.issues
            .filter((issue: any) => issue.status === "OPEN")
            .reduce((acc: any, issue: any) => acc + issue.count, 0)
        : 0;
      const highSeverityIssues = log
        ? log.issues
            .filter((issue: any) => issue.severity === "HIGH")
            .reduce((acc: any, issue: any) => acc + issue.count, 0)
        : 0;
      const lowSeverityIssues = log
        ? log.issues
            .filter((issue: any) => issue.severity === "LOW")
            .reduce((acc: any, issue: any) => acc + issue.count, 0)
        : 0;

      return {
        time: date,
        openIssues,
        highSeverityIssues,
        lowSeverityIssues,
      };
    });

    res.json({ data: result });
  } catch (error) {
    console.error(`Error getting issue graph by severity and status: ${error}`); // Replace with proper logging in production
    res.status(500).json({
      message: "Error getting issue graph by severity and status",
      error,
    });
  }
};

export const getIssuesByApiId = async (req: Request, res: Response) => {
  const { perPage = "10", page = "1" } = req.query;
  const { id: apiId } = req.params;

  try {
    if (!apiId) {
      return res.status(400).json({ message: "apiId is required" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(apiId as string)) {
      return res.status(400).json({ message: "Invalid API ID" });
    }

    const apiObjectId = new mongoose.Types.ObjectId(apiId as string);

    const limit = parseInt(perPage as string) || 10;
    const skip = (parseInt(page as string) - 1) * limit || 0;

    const issues = await Issue.find({ apiId: apiObjectId })
      .limit(limit)
      .skip(skip);

    res.json(issues);
  } catch (error) {
    console.error(`Error fetching issues by API ID: ${error}`); // Debugging log
    res.status(500).json({ message: "Error fetching issues by API ID", error });
  }
};
