import "dotenv/config";
import { defineConfig } from "prisma/config";

const baseConfig = {
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
};

export default defineConfig(
  process.env.DIRECT_URL
    ? { ...baseConfig, datasource: { url: process.env.DIRECT_URL } }
    : baseConfig
);
