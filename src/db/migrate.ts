import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "./client";
import { migrationConfig } from "./migration-config";

export function runMigrations(): Promise<void> {
  return migrate(db, migrationConfig);
}
