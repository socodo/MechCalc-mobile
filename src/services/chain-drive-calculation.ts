export interface ChainDriveInput {
  P: number; // Công suất trên trục III (kW)
  n: number; // Số vòng quay trên trục III (vòng/phút)
  u: number; // Tỉ số truyền
}

export interface ChainSpec {
  p_c: number;
  d_0: number;
  b_0: number;
  Q_sb: number;
  q: number;
}

export interface ChainGeometry {
  d1: number;
  d2: number;
  da1: number;
  da2: number;
  a_sb: number;
  X_sb: number;
  X: number;
  a_temp: number;
  delta_a: number;
  a: number;
  L: number;
}

export interface ChainValidations {
  pass_impact: boolean;
  pass_strength: boolean;
  pass_contact: boolean;
  pass_pressure: boolean;
  metrics: {
    v: number;
    i: number;
    s: number;
    sigma: number;
    p_calc: number;
  };
}

export interface ChainDriveResult {
  z1: number;
  z2: number;
  chainSpec: ChainSpec;
  geometry: ChainGeometry;
  validations: ChainValidations;
}

// Constants
const K = 0.896;
const K_x = 1.7;
const k_d = 1.2;
const k_f = 6;
const k_r = 0.42;
const K_d = 2;
const E = 2.1 * Math.pow(10, 5);
const A = 180;
const p_0_max = 31;

/**
 * Mock function to look up chain specifications.
 * Replace with actual data lookup implementation later.
 */
function lookupChainSpec(P_t: number, n_01: number): ChainSpec {
  return {
    p_c: 25.4,
    d_0: 7.95,
    b_0: 22.61,
    Q_sb: 56.7,
    q: 2.6,
  };
}

function calculateTeeth(u: number): { z1: number; z2: number } {
  let z1 = Math.round(29 - 2 * u);
  if (z1 < 19) {
    z1 = 19;
  }

  let z2 = Math.round(u * z1);
  if (z2 > 120) {
    z2 = 120;
  }

  return { z1, z2 };
}

function calculatePitch(
  P: number,
  n: number,
  z1: number
): { n_01: number; P_t: number; chainSpec: ChainSpec } {
  const K_z = 25 / z1;

  const n_01_options = [50, 200, 400, 600, 800, 1000, 1200, 1600];
  let n_01 = n_01_options.find((val) => val >= n);
  if (n_01 === undefined) {
    n_01 = n_01_options[n_01_options.length - 1]; // Fallback to largest if exceeds
  }

  const K_n = n_01 / n;
  const P_t = (K * K_z * K_n * P) / K_x;

  const chainSpec = lookupChainSpec(P_t, n_01);

  return { n_01, P_t, chainSpec };
}

function calculateGeometry(
  z1: number,
  z2: number,
  chainSpec: ChainSpec
): ChainGeometry {
  const { p_c } = chainSpec;

  const d1 = (p_c * z1) / Math.PI;
  const d2 = (p_c * z2) / Math.PI;
  const da1 = p_c * (0.5 + 1 / Math.tan(Math.PI / z1));
  const da2 = p_c * (0.5 + 1 / Math.tan(Math.PI / z2));

  const a_sb = 44 * p_c;
  const X_sb =
    (2 * a_sb) / p_c +
    (z1 + z2) / 2 +
    Math.pow((z2 - z1) / (2 * Math.PI), 2) * (p_c / a_sb);

  // Round to nearest even integer
  const X = 2 * Math.round(X_sb / 2);

  const M = (z1 + z2) / 2;
  const N = Math.pow((z2 - z1) / (2 * Math.PI), 2);
  const a_temp =
    0.25 * p_c * (X - M + Math.sqrt(Math.pow(X - M, 2) - 8 * N));

  const delta_a = 0.002 * a_temp;
  const a = a_temp - delta_a;
  const L = X * p_c;

  return {
    d1,
    d2,
    da1,
    da2,
    a_sb,
    X_sb,
    X,
    a_temp,
    delta_a,
    a,
    L,
  };
}

function runValidations(
  input: ChainDriveInput,
  z1: number,
  X: number,
  a: number,
  P_t: number,
  chainSpec: ChainSpec
): ChainValidations {
  const { P, n } = input;
  const { p_c, Q_sb, q } = chainSpec;

  const v = (n * z1 * p_c) / 60000;
  const i = (z1 * n) / (15 * X);
  const pass_impact = i <= 20;

  const Q = Q_sb * 10;
  const F_t = 1000 * (P / v);
  const F_v = q * Math.pow(v, 2);
  const F_o = 9.81 * k_f * q * a * Math.pow(10, -3);

  const s = Q / (k_d * F_t + F_v + F_o);
  const pass_strength = s >= 8.2;

  const F_vd = 13 * Math.pow(10, -7) * n * Math.pow(p_c, 3) * 13.2;
  const sigma =
    0.47 * Math.sqrt((k_r * (F_t * k_d + F_vd) * E) / (A * K_d));
  const pass_contact = sigma <= 600;

  const p_calc =
    (P_t * K) / (z1 * n * K_x * Math.pow(p_c / 600, 3));
  const pass_pressure = p_calc <= p_0_max;

  return {
    pass_impact,
    pass_strength,
    pass_contact,
    pass_pressure,
    metrics: {
      v,
      i,
      s,
      sigma,
      p_calc,
    },
  };
}

/**
 * Main function to calculate chain drive parameters and validate them.
 */
export function calculateChainDrive(
  P: number,
  n: number,
  u: number
): ChainDriveResult {
  const input: ChainDriveInput = { P, n, u };

  // Step 1: Calculate teeth
  const { z1, z2 } = calculateTeeth(u);

  // Step 2: Calculate pitch and chain spec
  const { P_t, chainSpec } = calculatePitch(P, n, z1);

  // Step 3: Calculate geometry
  const geometry = calculateGeometry(z1, z2, chainSpec);

  // Step 4: Run validations
  const validations = runValidations(
    input,
    z1,
    geometry.X,
    geometry.a,
    P_t,
    chainSpec
  );

  return {
    z1,
    z2,
    chainSpec,
    geometry,
    validations,
  };
}
