export interface ChainDriveInput {
  P: number; // Công suất trên trục III (kW)
  n: number; // Số vòng quay trên trục III (vòng/phút)
  u: number; // Tỉ số truyền
}

export interface ChainDriveConstants {
  K: number;
  K_x: number;
  k_d: number;
  k_f: number;
  k_r: number;
  K_d: number;
  E: number;
  A: number;
  p_0_max: number;
  m: number;
  i_max: number;
  s_min: number;
  sigma_H_max: number;
}

export const DEFAULT_CONSTANTS: ChainDriveConstants = {
  K: 0.896,
  K_x: 1.7,
  k_d: 1.2,
  k_f: 6,
  k_r: 0.42,
  K_d: 2,
  E: 2.1 * 10 ** 5,
  A: 180,
  p_0_max: 31,
  m: 13.2,
  i_max: 20,
  s_min: 8.2,
  sigma_H_max: 600,
};

export interface ChainDriveGeometry {
  z1: number;
  z2: number;
  p_c: number;
  d1: number;
  d2: number;
  da1: number;
  da2: number;
  asb: number;
  xsb: number;
  a: number;
  deltaA: number;
  X: number;
  L: number;
  v: number;
  F_t: number;
}

export interface ChainDriveValidations {
  v: number;
  i: number;
  s: number;
  sigma: number;
  p_calc: number;
  isPcValid: boolean;
  isImpactValid: boolean;
  isStrengthValid: boolean;
  isContactValid: boolean;
  isPressureValid: boolean;
}

export interface ChainDrivePowerParams {
  K_z: number;
  n_01: number;
  K_n: number;
  P_t: number;
  K: number;
  K_x: number;
  d0: number;
  b0: number;
  allowablePower: number;
  pcMax: number;
}

export interface ChainDriveResult {
  powerParams: ChainDrivePowerParams;
  geometry: ChainDriveGeometry;
  validations: ChainDriveValidations;
}

export interface ChainStepParams {
  p_c: number;
  d_0: number;
  b_0: number;
  P_max: number;
}

export interface ChainPhysicalProps {
  Q_sb: number;
  q: number;
}

const TABLE_5_4 = [
  { p_c: 12.7, d_0: 3.66, b_0: 5.80, powers: { 50: 0.19, 200: 0.68, 400: 1.23, 600: 1.68, 800: 2.06, 1000: 2.42, 1200: 2.72, 1600: 3.20 } },
  { p_c: 12.7, d_0: 4.45, b_0: 8.90, powers: { 50: 0.35, 200: 1.27, 400: 2.29, 600: 3.13, 800: 3.86, 1000: 4.52, 1200: 5.06, 1600: 5.95 } },
  { p_c: 12.7, d_0: 4.45, b_0: 10.11, powers: { 50: 0.45, 200: 1.61, 400: 2.91, 600: 3.98, 800: 4.90, 1000: 5.74, 1200: 6.43, 1600: 7.55 } },
  { p_c: 15.875, d_0: 5.08, b_0: 11.30, powers: { 50: 0.57, 200: 2.06, 400: 3.72, 600: 5.08, 800: 6.26, 1000: 7.34, 1200: 8.22, 1600: 9.65 } },
  { p_c: 15.875, d_0: 5.08, b_0: 13.28, powers: { 50: 0.75, 200: 2.70, 400: 4.88, 600: 6.67, 800: 8.22, 1000: 9.63, 1200: 10.8, 1600: 12.7 } },
  { p_c: 19.05, d_0: 5.96, b_0: 17.75, powers: { 50: 1.41, 200: 4.80, 400: 8.38, 600: 11.4, 800: 13.5, 1000: 15.3, 1200: 16.9, 1600: 19.3 } },
  { p_c: 25.4, d_0: 7.95, b_0: 22.61, powers: { 50: 3.20, 200: 11.0, 400: 19.0, 600: 25.7, 800: 30.7, 1000: 34.7, 1200: 38.3, 1600: 43.8 } },
  { p_c: 31.75, d_0: 9.55, b_0: 27.46, powers: { 50: 5.83, 200: 19.3, 400: 32.0, 600: 42.0, 800: 49.3, 1000: 54.9, 1200: 60.0, 1600: 0 } },
  { p_c: 38.1, d_0: 11.12, b_0: 35.46, powers: { 50: 10.5, 200: 34.8, 400: 57.7, 600: 75.7, 800: 88.9, 1000: 99.2, 1200: 108.0, 1600: 0 } },
  { p_c: 44.45, d_0: 12.72, b_0: 37.19, powers: { 50: 14.7, 200: 43.7, 400: 70.6, 600: 88.3, 800: 101.0, 1000: 0, 1200: 0, 1600: 0 } },
  { p_c: 50.8, d_0: 14.29, b_0: 45.21, powers: { 50: 22.9, 200: 68.1, 400: 110.0, 600: 138.0, 800: 157.0, 1000: 0, 1200: 0, 1600: 0 } },
];

const TABLE_5_2 = [
  { p_c: 8, d_0: 2.31, q_sb: 4.6, q: 0.2 },
  { p_c: 9.525, d_0: 3.28, q_sb: 9.1, q: 0.45 },
  { p_c: 12.7, d_0: 3.66, q_sb: 9.0, q: 0.30 },
  { p_c: 12.7, d_0: 4.45, q_sb: 18.2, q: 0.65 },
  { p_c: 15.875, d_0: 5.08, q_sb: 22.7, q: 0.8 },
  { p_c: 19.05, d_0: 5.96, q_sb: 31.8, q: 1.9 },
  { p_c: 25.4, d_0: 7.95, q_sb: 56.7, q: 2.6 },
  { p_c: 31.75, d_0: 9.55, q_sb: 88.5, q: 3.8 },
  { p_c: 38.1, d_0: 11.1, q_sb: 127.0, q: 5.5 },
  { p_c: 44.45, d_0: 12.70, q_sb: 172.4, q: 7.5 },
  { p_c: 50.8, d_0: 14.29, q_sb: 226.8, q: 9.7 },
  { p_c: 63.5, d_0: 19.84, q_sb: 353.8, q: 16.0 },
];

export function getMaxPc(n: number): number {
  if (n >= 1250) return 12.7;
  if (n >= 1000) return 15.875;
  if (n >= 900) return 19.05;
  if (n >= 800) return 25.4;
  if (n >= 630) return 31.75;
  if (n >= 500) return 38.1;
  if (n >= 400) return 44.45;
  return 50.8;
}

export function getChainStepParameters(Pt: number, n01: number): ChainStepParams {
  for (const row of TABLE_5_4) {
    const P_max = (row.powers as Record<number, number>)[n01] || 0;
    if (P_max >= Pt) {
      return { p_c: row.p_c, d_0: row.d_0, b_0: row.b_0, P_max };
    }
  }

  const last = TABLE_5_4[TABLE_5_4.length - 1];
  return {
    p_c: last.p_c,
    d_0: last.d_0,
    b_0: last.b_0,
    P_max: (last.powers as Record<number, number>)[n01] || 0,
  };
}

export function getChainPhysicalProps(p_c: number, d_0: number): ChainPhysicalProps {
  for (const row of TABLE_5_2) {
    if (Math.abs(row.p_c - p_c) < 0.001 && Math.abs(row.d_0 - d_0) < 0.05) {
      return { Q_sb: row.q_sb, q: row.q };
    }
  }

  return { Q_sb: 56.7, q: 2.6 };
}

export function findStandardSpeed(n: number): number {
  const standardSpeeds = [50, 200, 400, 600, 800, 1000, 1200, 1600];
  for (const speed of standardSpeeds) {
    if (speed >= n) return speed;
  }

  return standardSpeeds[standardSpeeds.length - 1];
}

export function roundToEven(num: number): number {
  return 2 * Math.round(num / 2);
}

export function calculateTeeth(u: number): { z1: number; z2: number } {
  let z1 = Math.round(29 - 2 * u);
  if (z1 < 19) z1 = 19;

  let z2 = Math.round(u * z1);
  if (z2 > 120) z2 = 120;

  return { z1, z2 };
}

export function calculateChainDrive(
  input: ChainDriveInput,
  constants: ChainDriveConstants = DEFAULT_CONSTANTS
): ChainDriveResult {
  const { P, n, u } = input;
  const { K, K_x, k_d, k_f, k_r, K_d, E, A, p_0_max, m, i_max, s_min, sigma_H_max } = constants;

  const { z1, z2 } = calculateTeeth(u);

  const K_z = 25 / z1;
  const n_01 = findStandardSpeed(n);
  const K_n = n_01 / n;
  const P_t = (K * K_z * K_n * P) / K_x;

  const { p_c, d_0, b_0, P_max } = getChainStepParameters(P_t, n_01);
  const p_c_max = getMaxPc(n);
  const isPcValid = p_c <= p_c_max;

  const d1 = (p_c * z1) / Math.PI;
  const d2 = (p_c * z2) / Math.PI;
  const da1 = p_c * (0.5 + 1 / Math.tan(Math.PI / z1));
  const da2 = p_c * (0.5 + 1 / Math.tan(Math.PI / z2));

  const a_sb = 44 * p_c;
  const M = (z1 + z2) / 2;
  const N = Math.pow((z2 - z1) / (2 * Math.PI), 2);
  const X_sb = (2 * a_sb / p_c) + M + (N * p_c / a_sb);
  const X = roundToEven(X_sb);
  const a_temp = 0.25 * p_c * (X - M + Math.sqrt(Math.pow(X - M, 2) - 8 * N));
  const delta_a = 0.002 * a_temp;
  const a = a_temp - delta_a;
  const L = X * p_c;

  const v = (n * z1 * p_c) / 60000;
  const i = (z1 * n) / (15 * X);
  const isImpactValid = i <= i_max;

  const { Q_sb, q } = getChainPhysicalProps(p_c, d_0);
  const Q = Q_sb * 1000;
  const F_t = 1000 * (P / v);
  const F_v = q * Math.pow(v, 2);
  const F_o = 9.81 * k_f * q * a * Math.pow(10, -3);
  const s = Q / (k_d * F_t + F_v + F_o);
  const isStrengthValid = s >= s_min;

  const F_vd = 13 * Math.pow(10, -7) * z1 * Math.pow(p_c, 3) * m;
  const sigma = 0.47 * Math.sqrt((k_r * (F_t * k_d + F_vd) * E) / (A * K_d));
  const isContactValid = sigma <= sigma_H_max;

  const p_calc = (P_t * K) / (z1 * n * K_x * Math.pow(p_c / 600, 3));
  const isPressureValid = p_calc <= p_0_max;

  const geometry: ChainDriveGeometry = {
    z1,
    z2,
    p_c,
    d1,
    d2,
    da1,
    da2,
    asb: a_sb,
    xsb: X_sb,
    a,
    deltaA: delta_a,
    X,
    L,
    v,
    F_t,
  };

  const validations: ChainDriveValidations = {
    v,
    i,
    s,
    sigma,
    p_calc,
    isPcValid,
    isImpactValid,
    isStrengthValid,
    isContactValid,
    isPressureValid,
  };

  const powerParams: ChainDrivePowerParams = {
    K_z,
    n_01,
    K_n,
    P_t,
    K,
    K_x,
    d0: d_0,
    b0: b_0,
    allowablePower: P_max,
    pcMax: p_c_max,
  };

  return { powerParams, geometry, validations };
}
