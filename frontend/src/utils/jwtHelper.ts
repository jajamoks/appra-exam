import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  userId: number;
  type: string;
  exp: number;
  iat?: number;
}

interface TokenInfo {
  valid: boolean;
  expiresAt?: string;
  timeRemaining?: number;
}

const STORAGE_KEY = "sensitive_data_token";

export function saveSensitiveToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearSensitiveToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isValidSensitiveToken(): TokenInfo {
  try {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      return { valid: false };
    }

    const decoded = jwtDecode<JWTPayload>(token);
    
    if (decoded.type !== "sensitive_data_access") {
      return { valid: false };
    }

    const now = Date.now() / 1000;
    if (decoded.exp <= now) {
      clearSensitiveToken();
      return { valid: false };
    }

    const expiresAt = new Date(decoded.exp * 1000).toISOString();
    const timeRemaining = Math.max(0, Math.floor(decoded.exp - now));

    return {
      valid: true,
      expiresAt,
      timeRemaining,
    };
  } catch {
    clearSensitiveToken();
    return { valid: false };
  }
}

export function getSensitiveToken(): string | null {
  const tokenInfo = isValidSensitiveToken();
  return tokenInfo.valid ? localStorage.getItem(STORAGE_KEY) : null;
}
