import { z } from "zod";

export interface Env {
  NODE_ENV: "development" | "production" | "test";
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  GROQ_API_KEY: string;
  CORS_ALLOWED_ORIGINS: string[];
  PORT: number;
}

const rawEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"], {
      errorMap: () => ({
        message: "NODE_ENV must be one of 'development', 'production', 'test'",
      }),
    })
    .default("development"),
  DATABASE_URL: z.string().default(""),
  JWT_SECRET: z.string().default(""),
  JWT_REFRESH_SECRET: z.string().default(""),
  GROQ_API_KEY: z
    .string({ required_error: "GROQ_API_KEY is required" })
    .min(1, "GROQ_API_KEY must not be empty"),
  CORS_ALLOWED_ORIGINS: z.string().default(""),
  PORT: z
    .string()
    .regex(/^\d+$/, "PORT must be a numeric string")
    .default("3000"),
});

function isProductionEnv(nodeEnv: string): boolean {
  return nodeEnv === "production";
}

function refineEnvironment(
  data: z.infer<typeof rawEnvSchema>,
  ctx: z.RefinementCtx
): void {
  const issues: Array<[string, string]> = [];

  if (isProductionEnv(data.NODE_ENV) && data.DATABASE_URL.length === 0) {
    issues.push(["DATABASE_URL", "DATABASE_URL is required in production"]);
  }
  if (isProductionEnv(data.NODE_ENV) && data.JWT_SECRET.length < 32) {
    issues.push([
      "JWT_SECRET",
      `JWT_SECRET must be at least 32 characters in production (received ${data.JWT_SECRET.length})`,
    ]);
  }
  if (
    isProductionEnv(data.NODE_ENV) &&
    data.JWT_REFRESH_SECRET.length < 32
  ) {
    issues.push([
      "JWT_REFRESH_SECRET",
      `JWT_REFRESH_SECRET must be at least 32 characters in production (received ${data.JWT_REFRESH_SECRET.length})`,
    ]);
  }

  for (const [path, message] of issues) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  }
}

function buildEnv(): Env {
  const result = rawEnvSchema.superRefine(refineEnvironment).safeParse({
    NODE_ENV: process.env.NODE_ENV || undefined,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
    PORT: process.env.PORT,
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${details}`);
  }

  const { data } = result;

  return {
    NODE_ENV: data.NODE_ENV,
    DATABASE_URL: data.DATABASE_URL,
    JWT_SECRET: data.JWT_SECRET,
    JWT_REFRESH_SECRET: data.JWT_REFRESH_SECRET,
    GROQ_API_KEY: data.GROQ_API_KEY,
    CORS_ALLOWED_ORIGINS: data.CORS_ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    PORT: Number.parseInt(data.PORT, 10),
  };
}

export function validateEnv(): Env {
  return buildEnv();
}

const env: Env = validateEnv();

export { env };
