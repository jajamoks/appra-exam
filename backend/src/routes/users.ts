import express, { Request, Response } from "express";
import {
  getUserById,
  updateUser,
  getAllUsers,
  UserUpdateData,
} from "../database/queries/user";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching users:", error);
    res.status(500).json({ error });
  }
});

router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserById(req.userId!);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const updateData: UserUpdateData = {};

    const allowedFields = [
      "name",
      "email",
      "date_of_birth",
      "phone_number",
      "post_address",
      "home_address",
      "bank_name",
      "bsb",
      "account_name",
      "account_number",
      "facebook_url",
      "twitter_url",
      "youtube_url",
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field as keyof UserUpdateData] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updatedUser = await updateUser(req.userId!, updateData);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating user:", error);
    res.status(500).json({ error: `Internal server error ${error}` });
  }
});

export default router;
