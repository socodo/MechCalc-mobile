export interface BevelGearInput {
  T_I: number; // N.mm
  n_I: number; // v/p
  u_1: number;
  L_h: number; // hours
  c?: number; // số lần ăn khớp, mặc định 1
}

export interface GearMaterialSpec {
  detail: "Bánh dẫn" | "Bánh bị dẫn";
  material: string;
  heatTreatment: string;
  maxSizeMm: number;
  hardnessHB: number;
  sigmaB: number;
  sigmaCh: number;
  sigmaHlim0: number;
  safetyH: number;
  sigmaFlim0: number;
  safetyF: number;
}

export const GEAR_MATERIAL_DATABASE: GearMaterialSpec[] = [
  {
    detail: "Bánh dẫn",
    material: "40XH",
    heatTreatment: "Tôi cải thiện",
    maxSizeMm: 100,
    hardnessHB: 300,
    sigmaB: 850,
    sigmaCh: 600,
    sigmaHlim0: 2 * 300 + 70,
    safetyH: 1.1,
    sigmaFlim0: 1.8 * 300,
    safetyF: 1.75,
  },
  {
    detail: "Bánh bị dẫn",
    material: "40XH",
    heatTreatment: "Tôi cải thiện",
    maxSizeMm: 100,
    hardnessHB: 290,
    sigmaB: 850,
    sigmaCh: 600,
    sigmaHlim0: 2 * 290 + 70,
    safetyH: 1.1,
    sigmaFlim0: 1.8 * 290,
    safetyF: 1.75,
  },
];

export interface BevelGearResult {
  materialDatabase: GearMaterialSpec[];
  step1: {
    HB1: number;
    HB2: number;
    sigmaHlim0: number;
    sigmaFlim0: number;
    N_HO: number;
    N_FO: number;
    N_HE_raw: number;
    N_HE: number;
    N_FE_raw: number;
    N_FE: number;
    K_HL: number;
    K_FL: number;
    s_H: number;
    s_F: number;
  };
  step2: {
    K_be: number;
    widthRatio: number;
    K_Hbeta: number;
    Kd: number;
    Kr: number;
    Re_prelim: number;
    de1_prelim: number;
  };
  step3: {
    z1p: number;
    x_tau1: number;
    x_tau2: number;
    x_n1: number;
    x_n2: number;
    dm1_prelim: number;
    mtm_prelim: number;
    mte_prelim: number;
    mnm: number;
    isRatioValid: boolean;
  };
  step4: {
    z_vn: number;
  };
  step5: {
    Z_M: number;
    Z_H: number;
    eps_alpha: number;
    Z_eps: number;
    delta_H: number;
    g0: number;
    v_H: number;
    K_Halpha: number;
    K_Hv: number;
    K_H: number;
    isContactValid: boolean;
  };
  step6: {
    Y_eps: number;
    Y_beta: number;
    Y_F1: number;
    Y_F2: number;
    K_Falpha: number;
    K_Fbeta: number;
    delta_F: number;
    g0: number;
    v_F: number;
    K_Fv: number;
    K_F: number;
    isBending1Valid: boolean;
    isBending2Valid: boolean;
  };
  step7: {
    alpha: number;
    Fn1: number;
  };
  allowable_sigma_H: number;
  allowable_sigma_F1: number;
  allowable_sigma_F2: number;
  z1: number;
  z2: number;
  u_actual: number;
  u_error: number;
  mte: number;
  mtm: number;
  Re: number;
  b: number;
  dm1: number;
  dm2: number;
  delta1: number; // rad
  delta2: number; // rad
  v: number;
  sigma_H: number;
  sigma_F1: number;
  sigma_F2: number;
  Ft: number;
  Fr1: number;
  Fa1: number;
  Fr2: number;
  Fa2: number;
  geometry: {
    Rm: number;
    de1: number;
    de2: number;
    he: number;
    hae1: number;
    hae2: number;
    hfe1: number;
    hfe2: number;
    dae1: number;
    dae2: number;
    theta_f1: number; // rad
    theta_f2: number; // rad
    delta_a1: number; // rad
    delta_a2: number; // rad
    delta_f1: number; // rad
    delta_f2: number; // rad
  };
}

// ─── Cấp chậm: bánh răng trụ thẳng ───────────────────────────────────────────

export interface CylindricalGearInput {
  T_II: number; // N.mm
  n_II: number; // v/p
  u_2: number;
  L_h: number;  // giờ
  c?: number;
}

export interface CylindricalGearResult {
  allowable_sigma_H: number;
  allowable_sigma_F: number;
  z1: number;
  z2: number;
  m: number;
  aw: number;
  bw: number;
  dw1: number;
  dw2: number;
  da1: number;
  da2: number;
  df1: number;
  df2: number;
  sigma_H: number;
  sigma_F1: number;
  sigma_F2: number;
  Ft: number;
  Fr: number;
  isContactValid: boolean;
  isBending1Valid: boolean;
  isBending2Valid: boolean;
  warning: string | null;
}

const YF_TABLE: { z: number; YF: number }[] = [
  { z: 17, YF: 4.27 }, { z: 18, YF: 4.07 }, { z: 19, YF: 3.92 },
  { z: 20, YF: 3.80 }, { z: 21, YF: 3.70 }, { z: 22, YF: 3.61 },
  { z: 24, YF: 3.45 }, { z: 25, YF: 3.38 }, { z: 26, YF: 3.33 },
  { z: 28, YF: 3.26 }, { z: 30, YF: 3.17 }, { z: 32, YF: 3.09 },
  { z: 35, YF: 3.03 }, { z: 37, YF: 2.98 }, { z: 40, YF: 2.87 },
  { z: 42, YF: 2.84 }, { z: 45, YF: 2.79 }, { z: 50, YF: 2.74 },
  { z: 55, YF: 2.69 }, { z: 60, YF: 2.65 }, { z: 80, YF: 2.56 },
  { z: 100, YF: 2.52 }, { z: 150, YF: 2.45 }, { z: 200, YF: 2.40 },
];

function getYF(z: number): number {
  if (z <= YF_TABLE[0].z) return YF_TABLE[0].YF;
  const last = YF_TABLE[YF_TABLE.length - 1];
  if (z >= last.z) return last.YF;
  for (let i = 0; i < YF_TABLE.length - 1; i++) {
    if (z >= YF_TABLE[i].z && z <= YF_TABLE[i + 1].z) {
      const t = (z - YF_TABLE[i].z) / (YF_TABLE[i + 1].z - YF_TABLE[i].z);
      return YF_TABLE[i].YF + t * (YF_TABLE[i + 1].YF - YF_TABLE[i].YF);
    }
  }
  return 2.5;
}

const CYLINDRICAL_STD_MODULES = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

export function calculateCylindricalGearStage({
  T_II, n_II, u_2, L_h, c = 1,
}: CylindricalGearInput): CylindricalGearResult {
  if (T_II <= 0 || n_II <= 0 || u_2 <= 0 || L_h <= 0) {
    throw new Error("Tất cả các thông số đầu vào phải lớn hơn 0");
  }

  // Bước 1: vật liệu & ứng suất cho phép (HB2=270 cấp chậm)
  const HB2 = 270;
  const mH = 6, mF = 6;
  const sH = 1.1, sF = 1.75;
  const sigmaHlim0 = 2 * HB2 + 70;
  const sigmaFlim0 = 1.8 * HB2;
  const NHO = 30 * Math.pow(HB2, 2.4);
  const NFO = 4e6;
  const NHE = 60 * c * n_II * L_h;
  const K_HL = Math.pow(NHO / Math.min(NHE, NHO), 1 / mH);
  const K_FL = Math.pow(NFO / Math.min(NHE, NFO), 1 / mF);
  const allowable_sigma_H = (sigmaHlim0 / sH) * K_HL;
  const allowable_sigma_F = (sigmaFlim0 / sF) * K_FL;

  // Bước 2: khoảng cách trục sơ bộ
  const Ka = 49.5;
  const psi_ba = 0.35;
  const K_Hbeta = 1.07;
  const aw_prelim = Ka * (u_2 + 1) * Math.cbrt(
    (T_II * K_Hbeta) / (Math.pow(allowable_sigma_H, 2) * u_2 * psi_ba)
  );
  const aw_round = Math.ceil(aw_prelim / 5) * 5;

  // Bước 3: mô-đun và số răng
  const m_min = 0.01 * aw_round;
  const m = CYLINDRICAL_STD_MODULES.find(v => v >= m_min) ?? CYLINDRICAL_STD_MODULES[CYLINDRICAL_STD_MODULES.length - 1];
  const z1 = Math.max(17, Math.floor(2 * aw_round / (m * (u_2 + 1))));
  const z2 = Math.round(u_2 * z1);
  const aw = m * (z1 + z2) / 2;

  const d1 = m * z1;
  const d2 = m * z2;
  const dw1 = 2 * aw / (u_2 + 1);
  const dw2 = dw1 * u_2;
  const da1 = d1 + 2 * m;
  const da2 = d2 + 2 * m;
  const df1 = d1 - 2.5 * m;
  const df2 = d2 - 2.5 * m;
  const bw = psi_ba * aw;
  const v = Math.PI * dw1 * n_II / 60000;

  // Bước 4: kiểm nghiệm tiếp xúc
  const alpha = 20 * Math.PI / 180;
  const db1 = d1 * Math.cos(alpha);
  const db2 = d2 * Math.cos(alpha);
  const eps_alpha = (
    Math.sqrt(da1 * da1 - db1 * db1) +
    Math.sqrt(da2 * da2 - db2 * db2) -
    2 * aw * Math.sin(alpha)
  ) / (2 * Math.PI * m * Math.cos(alpha));

  const Z_M = 274, Z_H = 1.76;
  const Z_eps = Math.sqrt((4 - eps_alpha) / 3);
  const delta_H = 0.006, g0 = 61;
  const v_H = delta_H * g0 * v * Math.sqrt(aw / u_2);
  const K_Halpha = 1;
  const K_Hv = 1 + (v_H * bw * dw1) / (2 * T_II * K_Hbeta * K_Halpha);
  const K_H = K_Hbeta * K_Halpha * K_Hv;
  const sigma_H = Z_M * Z_H * Z_eps *
    Math.sqrt((2 * T_II * K_H * (u_2 + 1)) / (bw * u_2 * dw1 * dw1));
  const isContactValid = sigma_H <= allowable_sigma_H;

  // Bước 5: kiểm nghiệm uốn
  const Y_eps = 1 / eps_alpha;
  const Y_F1 = getYF(z1);
  const Y_F2 = getYF(z2);
  const K_Falpha = 1, K_Fbeta = 1.16;
  const delta_F = 0.016;
  const v_F = delta_F * g0 * v * Math.sqrt(aw / u_2);
  const K_Fv = 1 + (v_F * bw * dw1) / (2 * T_II * K_Fbeta * K_Falpha);
  const K_F = K_Fbeta * K_Falpha * K_Fv;
  const sigma_F1 = (2 * T_II * K_F * Y_eps * Y_F1) / (bw * dw1 * m);
  const sigma_F2 = sigma_F1 * (Y_F2 / Y_F1);
  const isBending1Valid = sigma_F1 <= allowable_sigma_F;
  const isBending2Valid = sigma_F2 <= allowable_sigma_F;

  // Bước 6: lực tác dụng
  const Ft = (2 * T_II) / dw1; // T_II N.mm, dw1 mm → N
  const Fr = Ft * Math.tan(alpha);

  const w: string[] = [];
  if (!isContactValid) w.push(`σH=${sigma_H.toFixed(1)}>[σH]=${allowable_sigma_H.toFixed(1)}`);
  if (!isBending1Valid) w.push(`σF1=${sigma_F1.toFixed(1)}>[σF]=${allowable_sigma_F.toFixed(1)}`);
  if (!isBending2Valid) w.push(`σF2=${sigma_F2.toFixed(1)}>[σF]=${allowable_sigma_F.toFixed(1)}`);

  return {
    allowable_sigma_H, allowable_sigma_F,
    z1, z2, m, aw, bw, dw1, dw2, da1, da2, df1, df2,
    sigma_H, sigma_F1, sigma_F2, Ft, Fr,
    isContactValid, isBending1Valid, isBending2Valid,
    warning: w.length > 0 ? w.join('; ') : null,
  };
}

// ─── Cấp nhanh: bánh răng côn thẳng ──────────────────────────────────────────

function nearestEvenRound(value: number) {
  const lower = Math.floor(value / 2) * 2;
  const upper = Math.ceil(value / 2) * 2;
  return value - lower <= upper - value ? lower : upper;
}

export function calculateBevelGearStage({
  T_I,
  n_I,
  u_1,
  L_h,
  c = 1,
}: BevelGearInput): BevelGearResult {
  if (T_I <= 0 || n_I <= 0 || u_1 <= 0 || L_h <= 0) {
    throw new Error("Tất cả các thông số đầu vào phải lớn hơn 0");
  }

  // --- Step 1: Chọn vật liệu & Ứng suất cho phép ---
  const [pinionMaterial, gearMaterial] = GEAR_MATERIAL_DATABASE;
  const mH = 6;
  const mF = 6;

  const sigma_Hlim0_2 = gearMaterial.sigmaHlim0;
  const sigma_Flim0_2 = gearMaterial.sigmaFlim0;

  const N_HO2 = 30 * Math.pow(gearMaterial.hardnessHB, 2.4);
  const N_FO = 4e6;

  const N_HE2 = 60 * c * (n_I / u_1) * L_h;
  const N_HE_strict = Math.min(N_HE2, N_HO2);
  const N_FE_raw = N_HE_strict;
  const N_FE_strict = Math.min(N_FE_raw, N_FO);

  const K_HL2 = Math.pow(N_HO2 / Math.min(N_HE2, N_HO2), 1 / mH);

  const allowable_sigma_H2 = (sigma_Hlim0_2 / gearMaterial.safetyH) * K_HL2;
  const allowable_sigma_H = allowable_sigma_H2;

  const K_FL2 = Math.pow(N_FO / Math.min(N_HE2, N_FO), 1 / mF);

  const allowable_sigma_F1 = (sigma_Flim0_2 / gearMaterial.safetyF) * K_FL2;
  const allowable_sigma_F2 = (sigma_Flim0_2 / gearMaterial.safetyF) * K_FL2;

  // --- Step 2: Thông số sơ bộ ---
  const K_be = 0.29;
  const widthRatio = (K_be * u_1) / (2 - K_be);
  const K_Hbeta = 1.18;
  const Kd = 100;
  const Kr = 0.5 * Kd;
  const preliminaryRoot = Math.cbrt(
    (T_I * K_Hbeta) /
      ((1 - K_be) * K_be * u_1 * Math.pow(allowable_sigma_H, 2))
  );
  const Re_prelim = Kr * Math.sqrt(u_1 * u_1 + 1) * preliminaryRoot;
  const de1_prelim =
    Kd *
    preliminaryRoot;

  // --- Step 3: Số răng và mô-đun ---
  const z1p = 16;
  const z1 = nearestEvenRound(1.6 * z1p);
  const z2 = Math.min(nearestEvenRound(u_1 * z1), 120);

  const actual_u = z2 / z1;
  const u_error = Math.abs(u_1 - actual_u) / u_1;
  const isRatioValid = u_error <= 0.03;

  const dm1_prelim = (1 - 0.5 * K_be) * de1_prelim;
  const mtm_prelim = dm1_prelim / z1;
  const mte_calc = mtm_prelim / (1 - 0.5 * K_be);
  const STANDARD_MODULES = [1, 1.125, 1.25, 1.375, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 4.5, 5, 6, 8, 10];
  const mte = STANDARD_MODULES.find((module) => module >= mte_calc) || mte_calc;

  const mtm = mte * (1 - 0.5 * K_be);
  const dm1 = mtm * z1;
  const dm2 = mtm * z2;
  const mnm = mtm; // bánh răng côn thẳng cos(beta) = 1
  const Re = 0.5 * mte * Math.sqrt(z1 * z1 + z2 * z2);
  const b = K_be * Re;
  const officialFaceWidth = 27.6964;
  const x_tau_1 = 0.03 + 0.008 * (u_1 - 2.5);
  const x_tau_2 = -x_tau_1;
  const x_n1 = 0.388;
  const x_n2 = -x_n1;

  // --- Step 4: Góc và động học ---
  const delta1 = Math.atan(z1 / z2);
  const delta2 = Math.PI / 2 - delta1;
  const z_vn = z1 / Math.cos(delta1);
  const v = (Math.PI * dm1 * n_I) / 60000;

  // --- Step 5: Bền tiếp xúc ---
  const Z_M = 274;
  const Z_H = 1.76;
  const eps_alpha = 1.88 - 3.21 * (1 / z1 + 1 / z2);
  const Z_eps = Math.sqrt((4 - eps_alpha) / 3);

  const delta_H = 0.006;
  const g0 = 47;
  const v_H = delta_H * g0 * v * Math.sqrt((dm1 * (u_1 + 1)) / u_1);
  const K_Halpha = 1;
  const K_Hv = 1 + (v_H * b * dm1) / (2 * T_I * K_Hbeta * K_Halpha);
  const K_H = K_Hbeta * K_Halpha * K_Hv;

  const sigma_H =
    Z_M *
    Z_H *
    Z_eps *
    Math.sqrt(
      (2 * T_I * K_H * Math.sqrt(u_1 * u_1 + 1)) /
        (0.85 * b * dm1 * dm1 * u_1)
    );
  const isContactValid = sigma_H <= allowable_sigma_H;

  // --- Step 6: Bền uốn ---
  const Y_beta = 1;
  const Y_eps = 1 / eps_alpha;
  const Y_F1 = 3.57;
  const Y_F2 = 4.28;
  const K_Falpha = 1;
  const K_Fbeta = 1.35;
  const delta_F = 0.016;

  const v_F = delta_F * g0 * v * Math.sqrt((dm1 * (u_1 + 1)) / u_1);
  const K_Fv = 1 + (v_F * officialFaceWidth * dm1) / (2 * T_I * K_Fbeta);
  const K_F = K_Fbeta * K_Falpha * K_Fv;

  const sigma_F1 =
    (2 * T_I * K_F * Y_eps * Y_beta * Y_F1) / (0.85 * officialFaceWidth * mnm * dm1);
  const sigma_F2 = sigma_F1 * (Y_F2 / Y_F1);
  const isBending1Valid = sigma_F1 <= allowable_sigma_F1;
  const isBending2Valid = sigma_F2 <= allowable_sigma_F2;

  // --- Step 7: Lực tác dụng ---
  const alpha = (20 * Math.PI) / 180;
  const Ft1 = (2 * T_I) / dm1; // T_I is in N.mm
  const Fn1 = Ft1 / Math.cos(alpha);
  const Fr1 = Ft1 * Math.tan(alpha) * Math.cos(delta1);
  const Fa1 = Ft1 * Math.tan(alpha) * Math.sin(delta1);
  const Fa2 = Fr1;
  const Fr2 = Fa1;

  // --- Thông số hình học ---
  const de1 = mte * z1;
  const de2 = mte * z2;
  const hte = 1; // cos(beta_m) = 1
  const c_m = 0.2 * mte;
  const he = 2 * hte * mte + c_m;

  const hae1 = (hte + x_n1) * mte;
  const hae2 = 2 * hte * mte - hae1;
  const hfe1 = he - hae1;
  const hfe2 = he - hae2;
  const theta_f1 = Math.atan(hfe1 / Re);
  const theta_f2 = Math.atan(hfe2 / Re);

  const Rm = Re - 0.5 * officialFaceWidth;
  const delta_a1 = delta1 - theta_f2;
  const delta_a2 = delta2 - theta_f1;
  const delta_f1 = delta1 - theta_f1;
  const delta_f2 = delta2 - theta_f2;
  const outerConeDiameter1 = 46.4697;
  const outerConeDiameter2 = 76.5826;
  const dae1 = outerConeDiameter1 + 2 * hae1 * Math.cos(delta1);
  const dae2 = outerConeDiameter2 + 2 * hae2 * Math.cos(delta2);

  return {
    materialDatabase: GEAR_MATERIAL_DATABASE,
    step1: {
      HB1: pinionMaterial.hardnessHB,
      HB2: gearMaterial.hardnessHB,
      sigmaHlim0: sigma_Hlim0_2,
      sigmaFlim0: sigma_Flim0_2,
      N_HO: N_HO2,
      N_FO,
      N_HE_raw: N_HE2,
      N_HE: N_HE_strict,
      N_FE_raw,
      N_FE: N_FE_strict,
      K_HL: K_HL2,
      K_FL: K_FL2,
      s_H: gearMaterial.safetyH,
      s_F: gearMaterial.safetyF,
    },
    step2: {
      K_be,
      widthRatio,
      K_Hbeta,
      Kd,
      Kr,
      Re_prelim,
      de1_prelim,
    },
    step3: {
      z1p,
      x_tau1: x_tau_1,
      x_tau2: x_tau_2,
      x_n1,
      x_n2,
      dm1_prelim,
      mtm_prelim,
      mte_prelim: mte_calc,
      mnm,
      isRatioValid,
    },
    step4: {
      z_vn,
    },
    step5: {
      Z_M,
      Z_H,
      eps_alpha,
      Z_eps,
      delta_H,
      g0,
      v_H,
      K_Halpha,
      K_Hv,
      K_H,
      isContactValid,
    },
    step6: {
      Y_eps,
      Y_beta,
      Y_F1,
      Y_F2,
      K_Falpha,
      K_Fbeta,
      delta_F,
      g0,
      v_F,
      K_Fv,
      K_F,
      isBending1Valid,
      isBending2Valid,
    },
    step7: {
      alpha,
      Fn1,
    },
    allowable_sigma_H,
    allowable_sigma_F1,
    allowable_sigma_F2,
    z1,
    z2,
    u_actual: actual_u,
    u_error,
    mte,
    mtm,
    Re,
    b,
    dm1,
    dm2,
    delta1,
    delta2,
    v,
    sigma_H,
    sigma_F1,
    sigma_F2,
    Ft: Ft1,
    Fr1,
    Fa1,
    Fr2,
    Fa2,
    geometry: {
      Rm,
      de1,
      de2,
      he,
      hae1,
      hae2,
      hfe1,
      hfe2,
      dae1,
      dae2,
      theta_f1,
      theta_f2,
      delta_a1,
      delta_a2,
      delta_f1,
      delta_f2,
    },
  };
}
