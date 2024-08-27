import express from 'express';
import { getIssues, getIssueById, assignAssigneeToIssue, getIssueCount } from '../controllers/issue-controller';

const issueRoutes = express.Router();

// Fetch all issues for a specific appId
issueRoutes.get('/issue', getIssues);

// Fetch a single issue by ID for a specific appId
issueRoutes.get('/issue/:id', getIssueById);

// Assign an assignee to an issue by ID for a specific appId
issueRoutes.patch('/issue/:id/assign', assignAssigneeToIssue);

// Get count of each type of issue
issueRoutes.get('/issuecount', getIssueCount);

export default issueRoutes;