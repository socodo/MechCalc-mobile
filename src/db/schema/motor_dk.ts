import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Bảng dk_motors — thông số động cơ ĐK */
export const Motors_Dk = sqliteTable("motors_dk", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  model: text("model").notNull(),
  powerKw: real("power_kw").notNull(),
  speedRpm: integer("speed_rpm").notNull(),
  cosPhi: real("cos_phi").notNull(),
  startingTorqueRatio: real("starting_torque_ratio").notNull(),
  maxTorqueRatio: real("max_torque_ratio").notNull(),
  rotorInertiaGd2: real("rotor_inertia_gd2").notNull(),
  weightKg: real("weight_kg").notNull(),
  poles: integer("poles").notNull(),
  syncSpeedRpm: integer("sync_speed_rpm").notNull(),
});
