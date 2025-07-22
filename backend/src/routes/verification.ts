/* eslint-disable no-console */
import express, { Request, Response } from "express";
import { AuthRequest, authenticateToken } from "../middleware/auth";
import jwt from "jsonwebtoken";
import {
  createVerificationCode,
  getVerificationCode,
  markVerificationCodeAsUsed,
  createAuditLog,
  checkRateLimit,
  incrementRateLimit,
  cleanupExpiredCodes,
} from "../database/queries/verification";
import { getUserById } from "../database/queries/user";
import { VERIFICATION_CONFIG } from "../config/verification";

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "development-secret-key-change-in-production";

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSensitiveDataToken(userId: number): {
  token: string;
  expiresAt: Date;
} {
  const expiresAt = new Date(
    Date.now() + VERIFICATION_CONFIG.JWT_EXPIRY_MINUTES * 60 * 1000
  );

  const token = jwt.sign(
    {
      userId,
      type: "sensitive_data_access",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    },
    JWT_SECRET
  );

  return { token, expiresAt };
}

function getClientIpAddress(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string) ||
    (req.connection && (req.connection as any).remoteAddress) ||
    req.ip ||
    "unknown"
  );
}

function getUserAgent(req: Request): string {
  return req.headers["user-agent"] || "unknown";
}

router.post(
  "/request-code",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const ipAddress = getClientIpAddress(req);
      const userAgent = getUserAgent(req);

      await cleanupExpiredCodes();

      const rateLimitCheck = await checkRateLimit(
        userId,
        "code_request",
        VERIFICATION_CONFIG.RATE_LIMITS.CODE_REQUEST.MAX_ATTEMPTS,
        VERIFICATION_CONFIG.RATE_LIMITS.CODE_REQUEST.WINDOW_MINUTES
      );
      if (!rateLimitCheck) {
        await createAuditLog(
          userId,
          "CODE_REQUEST_RATE_LIMITED",
          undefined,
          ipAddress,
          userAgent
        );
        return res.status(429).json({
          error: "Rate limit exceeded. Please try again later.",
          retryAfter:
            VERIFICATION_CONFIG.RATE_LIMITS.CODE_REQUEST.WINDOW_MINUTES * 60,
        });
      }

      const code = generateVerificationCode();
      const expiresAt = new Date(
        Date.now() + VERIFICATION_CONFIG.CODE_EXPIRY_MINUTES * 60 * 1000
      );

      await createVerificationCode(userId, code, expiresAt);

      await incrementRateLimit(userId, "code_request");

      const user = await getUserById(userId);
      console.log("\n=== VERIFICATION CODE EMAIL SIMULATION ===");
      console.log(`To: ${user?.email}`);
      console.log("Subject: Verification Code for Sensitive Data Access");
      console.log(
        `Your ${VERIFICATION_CONFIG.CODE_LENGTH}-digit verification code is: ${code}`
      );
      console.log(
        `This code will expire in ${VERIFICATION_CONFIG.CODE_EXPIRY_MINUTES} minutes.`
      );
      console.log("==========================================\n");

      await createAuditLog(
        userId,
        "CODE_REQUESTED",
        JSON.stringify({ email: user?.email }),
        ipAddress,
        userAgent
      );

      res.json({
        message: "Verification code sent to your email address",
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      console.error("Error requesting verification code:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/verify-code",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { code } = req.body;
      const ipAddress = getClientIpAddress(req);
      const userAgent = getUserAgent(req);

      if (
        !code ||
        typeof code !== "string" ||
        code.length !== VERIFICATION_CONFIG.CODE_LENGTH
      ) {
        await createAuditLog(
          userId,
          "CODE_VERIFY_INVALID_FORMAT",
          JSON.stringify({ code: code?.substring(0, 2) + "****" }),
          ipAddress,
          userAgent
        );
        return res
          .status(400)
          .json({ error: "Invalid verification code format" });
      }

      await cleanupExpiredCodes();

      const rateLimitCheck = await checkRateLimit(
        userId,
        "code_verify",
        VERIFICATION_CONFIG.RATE_LIMITS.CODE_VERIFY.MAX_ATTEMPTS,
        VERIFICATION_CONFIG.RATE_LIMITS.CODE_VERIFY.WINDOW_MINUTES
      );
      if (!rateLimitCheck) {
        await createAuditLog(
          userId,
          "CODE_VERIFY_RATE_LIMITED",
          undefined,
          ipAddress,
          userAgent
        );
        return res.status(429).json({
          error: "Too many verification attempts. Please try again later.",
          retryAfter:
            VERIFICATION_CONFIG.RATE_LIMITS.CODE_VERIFY.WINDOW_MINUTES * 60,
        });
      }

      const verificationCode = await getVerificationCode(userId, code);

      if (!verificationCode) {
        await incrementRateLimit(userId, "code_verify");
        await createAuditLog(
          userId,
          "CODE_VERIFY_INVALID",
          JSON.stringify({ code: code.substring(0, 2) + "****" }),
          ipAddress,
          userAgent
        );
        return res
          .status(400)
          .json({ error: "Invalid or expired verification code" });
      }

      const now = new Date();
      const expiresAt = new Date(verificationCode.expires_at);
      if (now > expiresAt) {
        await incrementRateLimit(userId, "code_verify");
        await createAuditLog(
          userId,
          "CODE_VERIFY_EXPIRED",
          JSON.stringify({ code: code.substring(0, 2) + "****" }),
          ipAddress,
          userAgent
        );
        return res.status(400).json({ error: "Verification code has expired" });
      }

      await markVerificationCodeAsUsed(verificationCode.id);

      await createAuditLog(
        userId,
        "CODE_VERIFIED_SUCCESS",
        JSON.stringify({ code: code.substring(0, 2) + "****" }),
        ipAddress,
        userAgent
      );

      const { token, expiresAt: jwtExpiresAt } =
        generateSensitiveDataToken(userId);

      res.json({
        message: "Verification successful",
        sensitiveDataAccess: {
          granted: true,
          expiresAt: jwtExpiresAt.toISOString(),
          sessionDuration: VERIFICATION_CONFIG.JWT_EXPIRY_MINUTES * 60 * 1000,
          token: token,
        },
      });
    } catch (error) {
      console.error("Error verifying code:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
