export const JWT_CONFIG = {
  SECRET:
    process.env.JWT_SECRET || "development-secret-key-change-in-production",
  SENSITIVE_DATA_TOKEN_TYPE: "sensitive_data_access",
} as const;
