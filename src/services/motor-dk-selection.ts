import { Motors_Dk } from "@/db/schema/motor_dk";
import type { InferSelectModel } from "drizzle-orm";

/** Một dòng catalog `motors_dk` (tra P1.2 / bảng ĐK). */
export type MotorDkRow = InferSelectModel<typeof Motors_Dk>;

export const EFFICIENCY = {
  NT: 0.98,    // Nối trục đàn hồi [cite: 14]
  BRC: 0.96,   // Bánh răng côn [cite: 14]
  BRT: 0.98,   // Bánh răng trụ [cite: 14]
  X: 0.92,     // Bộ truyền xích [cite: 14]
  OL: 0.992,   // Một cặp ổ lăn [cite: 14]
};

export const PRELIMINARY_RATIO = {
  UX: 2,       // Tỷ số truyền xích [cite: 17]
  UNT: 1,      // Tỷ số truyền nối trục [cite: 19]
  UHGT: 14,    // Tỷ số truyền HGT sơ bộ [cite: 21]
  U_TOTAL: 28, // Tỷ số truyền chung sơ bộ [cite: 22]
};

/** Bước 1: Tính hiệu suất truyền động tổng η */
export const calculateEtaTotal = (): number => {
  const { NT, BRC, BRT, X, OL } = EFFICIENCY;
  // η = ηnt . ηbrc . ηbrt . ηx . ηol³ [cite: 25]
  return NT * BRC * BRT * X * Math.pow(OL, 3);
};

/** Bước 2: Tính công suất cần thiết trên trục động cơ Pct */
export const calculatePct = (Plv: number, eta: number): number => {
  // Pct = Plv / η [cite: 27]
  return Plv / eta;
};

/** Bước 3: Xác định số vòng quay sơ bộ nsb */
export const calculateNsb = (nlv: number): number => {
  // nsb = 28 . nlv [cite: 29]
  return PRELIMINARY_RATIO.U_TOTAL * nlv;
};

/**
 * Danh sách động cơ thỏa Bước 4, đã sắp từ ưu tiên cao → thấp:
 * n_đb gần n_sb nhất → P_đc tăng dần (nhỏ trước) → `model`.
 */
function rankMotorsForStep4(
  motors: MotorDkRow[],
  P_ct: number,
  n_sb: number,
): MotorDkRow[] {
  if (motors.length === 0 || !Number.isFinite(P_ct) || !Number.isFinite(n_sb)) {
    return [];
  }
  const ok = motors.filter((m) => m.powerKw >= P_ct);
  if (ok.length === 0) return [];

  ok.sort((a, b) => {
    const da = Math.abs(a.syncSpeedRpm - n_sb);
    const db = Math.abs(b.syncSpeedRpm - n_sb);
    if (da !== db) return da - db;
    if (a.powerKw !== b.powerKw) return a.powerKw - b.powerKw;
    return a.model.localeCompare(b.model);
  });

  return ok;
}

/**
 * Bước 4: Chọn **một** động cơ (ứng viên tốt nhất).
 * Trả về `null` nếu không có máy đủ P_đc ≥ P_ct.
 */
export function selectMotorDkStep4(
  motors: MotorDkRow[],
  P_ct: number,
  n_sb: number,
): MotorDkRow | null {
  const ranked = rankMotorsForStep4(motors, P_ct, n_sb);
  return ranked[0] ?? null;
}

/**
 * Bước 4: Lấy **nhiều** ứng viên (mặc định 2 máy đứng đầu, cùng tiêu chí xếp hạng).
 * Mảng có thể có 0 hoặc 1 phần tử nếu catalog không đủ máy thỏa điều kiện.
 */
export function selectMotorDkStep4Top(
  motors: MotorDkRow[],
  P_ct: number,
  n_sb: number,
  count = 2,
): MotorDkRow[] {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return [];
  return rankMotorsForStep4(motors, P_ct, n_sb).slice(0, n);
}

// ——— Bước 5: Tỷ số truyền thực tế ———

/** u_t = n_dc / n_lv (tỷ số truyền chung thực tế). */
export function calculateUtStep5(n_dc: number, n_lv: number): number {
  if (!Number.isFinite(n_dc) || !Number.isFinite(n_lv) || n_lv <= 0) return NaN;
  return n_dc / n_lv;
}

/** u_h = u_t / u_x (tỷ số hộp giảm tốc; mặc định u_x = PRELIMINARY_RATIO.UX = 2). */
export function calculateUhStep5(u_t: number, u_x: number = PRELIMINARY_RATIO.UX): number {
  if (!Number.isFinite(u_t) || !Number.isFinite(u_x) || u_x === 0) return NaN;
  return u_t / u_x;
}

/** u_1 = 0,24 · u_h, làm tròn 1 chữ số thập phân (cấp nhanh trong HGT). */
export function calculateU1Step5(u_h: number): number {
  if (!Number.isFinite(u_h)) return NaN;
  return Math.round(0.24 * u_h * 10) / 10;
}

/** u_2 = u_h / u_1, làm tròn 4 chữ số thập phân (cấp chậm trong HGT). */
export function calculateU2Step5(u_h: number, u_1: number): number {
  if (!Number.isFinite(u_h) || !Number.isFinite(u_1) || u_1 === 0) return NaN;
  return Math.round((u_h / u_1) * 10000) / 10000;
}

// ——— Bước 6: P, n, T trên các trục ———

const TORQUE_K_STEP6 = 9.55e6; // T (N·mm) = k · P(kW) / n(v/ph)

/** P_III = P_lv / (η_x · η_ol) — công suất trục III (kW). */
export function calculateP_III_Step6(
  P_lv: number,
  etaX: number = EFFICIENCY.X,
  etaOl: number = EFFICIENCY.OL,
): number {
  const d = etaX * etaOl;
  if (!Number.isFinite(P_lv) || !Number.isFinite(d) || d === 0) return NaN;
  return P_lv / d;
}

/** P_II = P_III / (η_brt · η_ol) — công suất trục II (kW). */
export function calculateP_II_Step6(
  P_III: number,
  etaBrt: number = EFFICIENCY.BRT,
  etaOl: number = EFFICIENCY.OL,
): number {
  const d = etaBrt * etaOl;
  if (!Number.isFinite(P_III) || !Number.isFinite(d) || d === 0) return NaN;
  return P_III / d;
}

/** P_I = P_II / (η_brc · η_ol) — công suất trục I (kW). */
export function calculateP_I_Step6(
  P_II: number,
  etaBrc: number = EFFICIENCY.BRC,
  etaOl: number = EFFICIENCY.OL,
): number {
  const d = etaBrc * etaOl;
  if (!Number.isFinite(P_II) || !Number.isFinite(d) || d === 0) return NaN;
  return P_II / d;
}

/** n_I = n_dc / u_nt (thường u_nt = 1). */
export function calculateN_I_Step6(
  n_dc: number,
  u_nt: number = PRELIMINARY_RATIO.UNT,
): number {
  if (!Number.isFinite(n_dc) || !Number.isFinite(u_nt) || u_nt === 0) return NaN;
  return n_dc / u_nt;
}

/** n_II = n_I / u_1. */
export function calculateN_II_Step6(n_I: number, u_1: number): number {
  if (!Number.isFinite(n_I) || !Number.isFinite(u_1) || u_1 === 0) return NaN;
  return n_I / u_1;
}

/** n_III = n_II / u_2. */
export function calculateN_III_Step6(n_II: number, u_2: number): number {
  if (!Number.isFinite(n_II) || !Number.isFinite(u_2) || u_2 === 0) return NaN;
  return n_II / u_2;
}

/**
 * Mô-men xoắn T = 9,55·10⁶ · P / n (P kW, n vòng/phút → T N·mm).
 * Dùng cho T_đc, T_I, T_II, T_III, T_lv.
 */
export function calculateTorqueStep6(P_kW: number, n_rpm: number): number {
  if (!Number.isFinite(P_kW) || !Number.isFinite(n_rpm) || n_rpm <= 0) return NaN;
  return TORQUE_K_STEP6 * (P_kW / n_rpm);
}
