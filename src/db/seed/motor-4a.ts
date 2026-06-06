import { count } from "drizzle-orm";
import { db } from "../client";
import { Motors_4a } from "../schema/motor_4a";
import { motor4aSeedRows } from "./motor-4a-data";

/** Chèn bản ghi 4A khi `motors_4a` đang trống (idempotent). */
export function seedMotors4aIfEmpty(): void {
  const row = db.select({ n: count() }).from(Motors_4a).get();
  if ((row?.n ?? 0) > 0) return;
  db.insert(Motors_4a).values(motor4aSeedRows).run();
}
