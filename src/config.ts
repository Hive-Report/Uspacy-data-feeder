import "dotenv/config";

const required = (name: string, value: unknown): string => {
  if (value === undefined || value === null) {
    if (isTestEnvironment) {
      return getTestDefault(name);
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value as string;
};

const isTestEnvironment =
  process.env.NODE_ENV === "test" ||
  process.env.JEST_WORKER_ID !== undefined ||
  process.env.CI === "true";

const getTestDefault = (name: string): string => {
  const defaults: Record<string, string> = {
    ADMIN_EMAIL: "test@example.com",
    ADMIN_PASSWORD: "testpassword",
  };

  return defaults[name] || "mock-value";
};

export const config = {
  NODE_ENV: required("NODE_ENV", process.env.NODE_ENV) || "production",
  PORT: required("PORT", process.env.PORT) || "3030",
  SPACE: required("SPACE", process.env.SPACE),
  // PARSER: required("PARSER", process.env.PARSER),
  CERT_SERVICE: required("CERT_SERVICE", process.env.CERT_SERVICE),
  ADMIN_EMAIL: required("ADMIN_EMAIL", process.env.ADMIN_EMAIL),
  ADMIN_PASSWORD: required("ADMIN_PASSWORD", process.env.ADMIN_PASSWORD),
  SERVICE_ACCOUNT_PATH: required("SERVICE_ACCOUNT_PATH", process.env.SERVICE_ACCOUNT_PATH),
  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID),
};
