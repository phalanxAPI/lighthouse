import { Request, Response } from "express";
import User from "../../arsenal/models/user";
import { ClerkUserData } from "../types/clerk";

export const handleUserCreation = async (req: Request, res: Response) => {
  try {
    const userData = req.body.data as ClerkUserData;
    const userDoc = await User.create({
      email: userData.email_addresses[0].email_address,
      firstName: userData.first_name,
      lastName: userData.last_name,
      clerkId: userData.id,
      avatar: userData.image_url,
    });

    console.log("USER CREATED", userDoc._id);

    res.json({ message: "User created successfully" });
  } catch (error) {
    // throw error
    res.status(400).json({ message: "Error creating user", error });
  }
};
