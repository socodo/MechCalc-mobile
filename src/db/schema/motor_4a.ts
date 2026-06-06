import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Bảng P1.3 — thông số động cơ 4A */
export const Motors_4a = sqliteTable("motors_4a", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  model: text("model").notNull(),
  powerKw: real("power_kw").notNull(),
  speedRpm: integer("speed_rpm").notNull(),
  cosPhi: real("cos_phi").notNull(),
  efficiencyPct: real("efficiency_pct").notNull(),
  maxTorqueRatio: real("max_torque_ratio").notNull(),
  startingTorqueRatio: real("starting_torque_ratio").notNull(),
  poles: integer("poles").notNull(),
  syncSpeedRpm: integer("sync_speed_rpm").notNull(),
});
