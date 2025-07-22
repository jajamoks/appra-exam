import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "../database/queries/user";
import { generateToken } from "../middleware/auth";

const router = express.Router();

interface LoginRequest {
  email: string;
  password: string;
}

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.password) {
      // eslint-disable-next-line no-console
      console.error("User password is missing for user:", user.email);
      return res.status(500).json({ error: "Internal server error" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...safeUser } = user;

    res.json({
      user: safeUser,
      token,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
