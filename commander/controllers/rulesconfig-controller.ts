import SecurityConfiguration from "../../arsenal/models/security-conf"; // Adjust the import path as needed
import { Request, Response } from "express";
import mongoose from "mongoose";

export const getSecurityConfigurationsByApiId = async (req: Request, res: Response) => {
    const { apiId } = req.params;

    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(apiId)) {
            return res.status(400).json({ message: "Invalid API ID" });
        }

        const apiObjectId = new mongoose.Types.ObjectId(apiId);

        // Find all security configurations for the given API ID
        const securityConfigurations = await SecurityConfiguration.find({ apiId: apiObjectId });

        res.json(securityConfigurations);
    } catch (error) {
        console.error(`Error fetching security configurations by API ID: ${error}`); // Debugging log
        res.status(500).json({ message: "Error fetching security configurations by API ID", error });
    }
};