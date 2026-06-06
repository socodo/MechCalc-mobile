import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";

export const sqlite = SQLite.openDatabaseSync("mechcalc.db");
export const db = drizzle(sqlite, { schema });

