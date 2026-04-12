import type { InferInsertModel } from "drizzle-orm";
import { Motors_Dk } from "../schema/motor_dk";

export type MotorDkInsert = InferInsertModel<typeof Motors_Dk>;

export const motorDkSeedRows: MotorDkInsert[] = [
  { model: "DK.31-2", powerKw: 0.6, speedRpm: 2860, cosPhi: 0.85, startingTorqueRatio: 2.0, maxTorqueRatio: 2.4, rotorInertiaGd2: 0.01, weightKg: 24.0, poles: 2, syncSpeedRpm: 3000 },
  { model: "DK.32-2", powerKw: 1.0, speedRpm: 2850, cosPhi: 0.86, startingTorqueRatio: 2.0, maxTorqueRatio: 2.2, rotorInertiaGd2: 0.016, weightKg: 27.0, poles: 2, syncSpeedRpm: 3000 },
  { model: "DK.41-2", powerKw: 1.7, speedRpm: 2880, cosPhi: 0.87, startingTorqueRatio: 1.8, maxTorqueRatio: 2.4, rotorInertiaGd2: 0.03, weightKg: 39.0, poles: 2, syncSpeedRpm: 3000 },
  { model: "DK.42-2", powerKw: 2.8, speedRpm: 2880, cosPhi: 0.88, startingTorqueRatio: 1.9, maxTorqueRatio: 2.5, rotorInertiaGd2: 0.04, weightKg: 47.0, poles: 2, syncSpeedRpm: 3000 },
  { model: "DK.51-2", powerKw: 4.5, speedRpm: 2900, cosPhi: 0.88, startingTorqueRatio: 1.6, maxTorqueRatio: 2.4, rotorInertiaGd2: 0.12, weightKg: 84.0, poles: 2, syncSpeedRpm: 3000 },
  { model: "DK.52-2", powerKw: 7.0, speedRpm: 2900, cosPhi: 0.89, startingTorqueRatio: 1.7, maxTorqueRatio: 2.5, rotorInertiaGd2: 0.17, weightKg: 104.0, poles: 2, syncSpeedRpm: 3000 },
  { model: "DK.62-2", powerKw: 10.0, speedRpm: 2930, cosPhi: 0.89, startingTorqueRatio: 1.3, maxTorqueRatio: 2.5, rotorInertiaGd2: 0.41, weightKg: 170.0, poles: 2, syncSpeedRpm: 3000 },
  { model: "DK.63-2", powerKw: 14.0, speedRpm: 2930, cosPhi: 0.9, startingTorqueRatio: 1.5, maxTorqueRatio: 2.9, rotorInertiaGd2: 0.5, weightKg: 190.0, poles: 2, syncSpeedRpm: 3000 },
  { model: "DK.82-2", powerKw: 33.0, speedRpm: 2935, cosPhi: 0.91, startingTorqueRatio: 1.1, maxTorqueRatio: 2.5, rotorInertiaGd2: 1.8, weightKg: 477.0, poles: 2, syncSpeedRpm: 3000 },

  { model: "DK.31-4", powerKw: 0.6, speedRpm: 1410, cosPhi: 0.76, startingTorqueRatio: 1.8, maxTorqueRatio: 1.8, rotorInertiaGd2: 0.015, weightKg: 24.0, poles: 4, syncSpeedRpm: 1500 },
  { model: "DK.32-4", powerKw: 1.0, speedRpm: 1400, cosPhi: 0.79, startingTorqueRatio: 1.8, maxTorqueRatio: 2.0, rotorInertiaGd2: 0.021, weightKg: 27.0, poles: 4, syncSpeedRpm: 1500 },
  { model: "DK.41-4", powerKw: 1.7, speedRpm: 1420, cosPhi: 0.82, startingTorqueRatio: 1.8, maxTorqueRatio: 2.0, rotorInertiaGd2: 0.048, weightKg: 39.0, poles: 4, syncSpeedRpm: 1500 },
  { model: "DK.42-4", powerKw: 2.8, speedRpm: 1420, cosPhi: 0.84, startingTorqueRatio: 1.9, maxTorqueRatio: 2.0, rotorInertiaGd2: 0.067, weightKg: 47.0, poles: 4, syncSpeedRpm: 1500 },
  { model: "DK.51-4", powerKw: 4.5, speedRpm: 1440, cosPhi: 0.85, startingTorqueRatio: 1.4, maxTorqueRatio: 2.0, rotorInertiaGd2: 0.2, weightKg: 84.0, poles: 4, syncSpeedRpm: 1500 },
  { model: "DK.52-4", powerKw: 7.0, speedRpm: 1440, cosPhi: 0.85, startingTorqueRatio: 1.5, maxTorqueRatio: 2.0, rotorInertiaGd2: 0.28, weightKg: 104.0, poles: 4, syncSpeedRpm: 1500 },
  { model: "DK.62-4", powerKw: 10.0, speedRpm: 1460, cosPhi: 0.88, startingTorqueRatio: 1.3, maxTorqueRatio: 2.3, rotorInertiaGd2: 0.6, weightKg: 170.0, poles: 4, syncSpeedRpm: 1500 },
  { model: "DK.63-4", powerKw: 14.0, speedRpm: 1460, cosPhi: 0.88, startingTorqueRatio: 1.4, maxTorqueRatio: 2.3, rotorInertiaGd2: 0.75, weightKg: 190.0, poles: 4, syncSpeedRpm: 1500 },
  { model: "DK.72-4", powerKw: 20.0, speedRpm: 1460, cosPhi: 0.88, startingTorqueRatio: 1.3, maxTorqueRatio: 2.3, rotorInertiaGd2: 1.5, weightKg: 280.0, poles: 4, syncSpeedRpm: 1500 },
  { model: "DK.73-4", powerKw: 28.0, speedRpm: 1460, cosPhi: 0.88, startingTorqueRatio: 1.4, maxTorqueRatio: 2.3, rotorInertiaGd2: 1.9, weightKg: 310.0, poles: 4, syncSpeedRpm: 1500 },

  { model: "DK.32-6", powerKw: 0.6, speedRpm: 930, cosPhi: 0.69, startingTorqueRatio: 1.2, maxTorqueRatio: 1.9, rotorInertiaGd2: 0.02, weightKg: 27.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.41-6", powerKw: 1.0, speedRpm: 930, cosPhi: 0.72, startingTorqueRatio: 1.3, maxTorqueRatio: 1.8, rotorInertiaGd2: 0.048, weightKg: 39.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.42-6", powerKw: 1.7, speedRpm: 930, cosPhi: 0.75, startingTorqueRatio: 1.4, maxTorqueRatio: 1.8, rotorInertiaGd2: 0.067, weightKg: 47.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.51-6", powerKw: 2.8, speedRpm: 950, cosPhi: 0.78, startingTorqueRatio: 1.3, maxTorqueRatio: 1.8, rotorInertiaGd2: 0.2, weightKg: 84.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.52-6", powerKw: 4.5, speedRpm: 950, cosPhi: 0.8, startingTorqueRatio: 1.5, maxTorqueRatio: 1.8, rotorInertiaGd2: 0.28, weightKg: 104.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.62-6", powerKw: 7.0, speedRpm: 960, cosPhi: 0.81, startingTorqueRatio: 1.4, maxTorqueRatio: 2.2, rotorInertiaGd2: 0.6, weightKg: 170.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.63-6", powerKw: 10.0, speedRpm: 960, cosPhi: 0.82, startingTorqueRatio: 1.4, maxTorqueRatio: 2.2, rotorInertiaGd2: 0.75, weightKg: 190.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.72-6", powerKw: 14.0, speedRpm: 980, cosPhi: 0.83, startingTorqueRatio: 1.4, maxTorqueRatio: 2.2, rotorInertiaGd2: 2.3, weightKg: 280.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.73-6", powerKw: 20.0, speedRpm: 975, cosPhi: 0.84, startingTorqueRatio: 1.4, maxTorqueRatio: 2.2, rotorInertiaGd2: 3.0, weightKg: 310.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.83-6", powerKw: 33.0, speedRpm: 980, cosPhi: 0.88, startingTorqueRatio: 1.4, maxTorqueRatio: 2.4, rotorInertiaGd2: 5.7, weightKg: 540.0, poles: 6, syncSpeedRpm: 1000 },
  { model: "DK.84-6", powerKw: 40.0, speedRpm: 980, cosPhi: 0.86, startingTorqueRatio: 1.5, maxTorqueRatio: 2.2, rotorInertiaGd2: 6.5, weightKg: 590.0, poles: 6, syncSpeedRpm: 1000 },

  { model: "DK.73-8", powerKw: 14.0, speedRpm: 730, cosPhi: 0.81, startingTorqueRatio: 1.3, maxTorqueRatio: 2.0, rotorInertiaGd2: 3.0, weightKg: 310.0, poles: 8, syncSpeedRpm: 750 },
  { model: "DK.82-8", powerKw: 22.0, speedRpm: 730, cosPhi: 0.85, startingTorqueRatio: 1.4, maxTorqueRatio: 2.0, rotorInertiaGd2: 5.0, weightKg: 450.0, poles: 8, syncSpeedRpm: 750 },
  { model: "DK.83-8", powerKw: 30.0, speedRpm: 730, cosPhi: 0.83, startingTorqueRatio: 1.4, maxTorqueRatio: 2.0, rotorInertiaGd2: 6.5, weightKg: 830.0, poles: 8, syncSpeedRpm: 750 },
  { model: "DK.94-8", powerKw: 55.0, speedRpm: 735, cosPhi: 0.85, startingTorqueRatio: 1.8, maxTorqueRatio: 2.0, rotorInertiaGd2: 14.0, weightKg: 950.0, poles: 8, syncSpeedRpm: 750 },
  { model: "DK.103-8", powerKw: 75.0, speedRpm: 735, cosPhi: 0.85, startingTorqueRatio: 1.3, maxTorqueRatio: 2.4, rotorInertiaGd2: 26.0, weightKg: 1240.0, poles: 8, syncSpeedRpm: 750 },
];
