import { count } from "drizzle-orm";
import { db } from "../client";
import { Motors_Dk } from "../schema/motor_dk";
import { motorDkSeedRows } from "./motor-dk-data";

/** Chèn bản ghi DK khi `motors_dk` đang trống (idempotent). */
export function seedMotorsDkIfEmpty(): void {
  const row = db.select({ n: count() }).from(Motors_Dk).get();
  if ((row?.n ?? 0) === motorDkSeedRows.length) return;
  
  db.delete(Motors_Dk).run();
  
  // Chunking to avoid SQLite "too many variables" limit
  const chunkSize = 20;
  for (let i = 0; i < motorDkSeedRows.length; i += chunkSize) {
    db.insert(Motors_Dk).values(motorDkSeedRows.slice(i, i + chunkSize)).run();
  }
}
