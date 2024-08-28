import SecurityConfiguration from "../../arsenal/models/security-conf"; // Adjust the import path as needed
import { Request, Response } from "express";
import mongoose from "mongoose";

export const getSecurityConfigurationsByApiId = async (
  req: Request,
  res: Response
) => {
  const { apiId } = req.params;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(apiId)) {
      return res.status(400).json({ message: "Invalid API ID" });
    }

    const apiObjectId = new mongoose.Types.ObjectId(apiId);

    // Find all security configurations for the given API ID
    const securityConfigurations = await SecurityConfiguration.find({
      apiId: apiObjectId,
    });

    res.json(securityConfigurations);
  } catch (error) {
    console.error(`Error fetching security configurations by API ID: ${error}`); // Debugging log
    res
      .status(500)
      .json({
        message: "Error fetching security configurations by API ID",
        error,
      });
  }
};

export const upsertSecurityConfiguration = async (
  req: Request,
  res: Response
) => {
  const { apiId } = req.params;
  const { configType } = req.query;
  const { isEnabled, rules } = req.body;

  console.log(
    `apiId: ${apiId}, configType: ${configType}, isEnabled: ${isEnabled}, rules: ${JSON.stringify(
      rules
    )}`
  );
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(apiId)) {
      return res.status(400).json({ message: "Invalid API ID" });
    }

    if (!configType) {
      return res.status(400).json({ message: "Config type is required" });
    }

    const apiObjectId = new mongoose.Types.ObjectId(apiId);

    // Upsert the security configuration
    const securityConfiguration = await SecurityConfiguration.findOneAndUpdate(
      { apiId: apiObjectId, configType },
      { isEnabled, rules },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!securityConfiguration) {
      return res
        .status(404)
        .json({ message: "Security configuration not found or created" });
    }

    res.json(securityConfiguration);
  } catch (error) {
    console.error(`Error upserting security configuration: ${error}`); // Debugging log
    res
      .status(500)
      .json({ message: "Error upserting security configuration", error });
  }
};
