/* eslint-disable no-console */
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../../config/jwt";
import { SensitiveDataToken } from "../../types/verification";
import { VERIFICATION_CONFIG } from "../../config/verification";

const calculateTokenExpiry = (expiryMinutes: number): Date => {
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

const createSensitiveDataTokenPayload = (
  userId: number,
  expiresAt: Date
): object => ({
  userId,
  type: JWT_CONFIG.SENSITIVE_DATA_TOKEN_TYPE,
  exp: expiresAt.getTime() / 1000,
});

const signToken = (payload: object, secret: string): string => {
  return jwt.sign(payload, secret);
};

export const generateSensitiveDataToken = (
  userId: number
): SensitiveDataToken => {
  const expiresAt = calculateTokenExpiry(
    VERIFICATION_CONFIG.JWT_EXPIRY_MINUTES
  );
  const payload = createSensitiveDataTokenPayload(userId, expiresAt);
  const token = signToken(payload, JWT_CONFIG.SECRET);

  return {
    token,
    expiresAt,
  };
};

const decodeToken = (
  token: string,
  secret: string
): { userId: number; type: string } | null => {
  try {
    return jwt.verify(token, secret) as { userId: number; type: string };
  } catch {
    return null;
  }
};

const isValidTokenType = (tokenType: string): boolean => {
  return tokenType === JWT_CONFIG.SENSITIVE_DATA_TOKEN_TYPE;
};

export const validateSensitiveDataToken = (
  token: string
): {
  userId: number;
  valid: boolean;
  error?: string;
} => {
  const decoded = decodeToken(token, JWT_CONFIG.SECRET);

  if (!decoded) {
    return {
      userId: 0,
      valid: false,
      error: "Token verification failed",
    };
  }

  const valid = isValidTokenType(decoded.type);

  return {
    userId: decoded.userId,
    valid,
    ...(valid ? {} : { error: "Invalid token type" }),
  };
};
