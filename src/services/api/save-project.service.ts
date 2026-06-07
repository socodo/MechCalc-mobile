import { calculateCylindricalGearStage } from "@/lib/gearDriveCalculation";
import { chainCalculationService, type ChainCalculationRequest } from "./chain-calculation.service";
import { gearCalculationService, type GearCalculationRequest } from "./gear-calculation.service";
import { motorCalculationService, type MotorCalculationRequest } from "./motor-calculation.service";

export type SaveCalculationsResult = {
  motor: boolean;
  gear: boolean;
  chain: boolean;
  errors: string[];
};

async function upsertCalculation<T>(
  get: () => Promise<T>,
  save: () => Promise<void>,
  update: () => Promise<void>,
): Promise<void> {
  try {
    await get();
    await update();
  } catch {
    await save();
  }
}

export async function saveAllCalculations(
  projectId: string,
  motorSnapshot: any,
  fullGearState: { result: any; inputTI: number; inputNI: number; inputU1: number; inputLh: number } | null,
  fullChainState: { result: any; inputP: number; inputN: number; inputU: number } | null,
): Promise<SaveCalculationsResult> {
  const errors: string[] = [];
  const saved = { motor: false, gear: false, chain: false };

  // ── Module 1: Động cơ ─────────────────────────────────────────────────────
  if (motorSnapshot) {
    try {
      const payload: MotorCalculationRequest = {
        pWorking: motorSnapshot.P_lv,
        pRequired: motorSnapshot.P_ct,
        nWorking: motorSnapshot.n_lv,
        nPreliminary: motorSnapshot.n_sb,
        etaTotal: motorSnapshot.eta,
        unt: 1,
        u1: motorSnapshot.u_1,
        u2: motorSnapshot.u_2,
        ux: motorSnapshot.n_III / motorSnapshot.n_lv,
        uTotalReal: motorSnapshot.u_t,
        uHReal: motorSnapshot.u_h,
        selectedMotorId: motorSnapshot.motor.id,
        kinematicTable: {
          motor: { power: motorSnapshot.P_dc, ratio: 1, speed: motorSnapshot.n_dc, torque: motorSnapshot.T_dc },
          shaft1: { power: motorSnapshot.P_I, ratio: motorSnapshot.u_1, speed: motorSnapshot.n_I, torque: motorSnapshot.T_I },
          shaft2: { power: motorSnapshot.P_II, ratio: motorSnapshot.u_2, speed: motorSnapshot.n_II, torque: motorSnapshot.T_II },
          shaft3: { power: motorSnapshot.P_III, ratio: motorSnapshot.n_III / motorSnapshot.n_lv, speed: motorSnapshot.n_III, torque: motorSnapshot.T_III },
          workingShaft: { power: motorSnapshot.P_lv, ratio: 1, speed: motorSnapshot.n_lv, torque: motorSnapshot.T_lv },
        },
      };
      await upsertCalculation(
        () => motorCalculationService.get(projectId),
        () => motorCalculationService.save(projectId, payload),
        () => motorCalculationService.update(projectId, payload),
      );
      saved.motor = true;
    } catch (e: any) {
      errors.push(`Động cơ: ${e?.message ?? "Lỗi không xác định"}`);
    }
  }

  // ── Module 2: Xích ────────────────────────────────────────────────────────
  if (fullChainState) {
    try {
      const { result, inputP, inputN, inputU } = fullChainState;
      const payload: ChainCalculationRequest = {
        p: inputP,
        n: inputN,
        u: inputU,
        k: result.powerParams.K,
        z1: result.geometry.z1,
        z2: result.geometry.z2,
        n01: result.powerParams.n_01,
        pt: result.powerParams.P_t,
        allowablePower: result.powerParams.allowablePower,
        pc: result.geometry.p_c,
        d0: result.powerParams.d0,
        b0: result.powerParams.b0,
        pcMax: result.powerParams.pcMax,
        d1: result.geometry.d1,
        d2: result.geometry.d2,
        da1: result.geometry.da1,
        da2: result.geometry.da2,
        asb: result.geometry.asb,
        xsb: result.geometry.xsb,
        x: result.geometry.X,
        a: result.geometry.a,
        deltaA: result.geometry.deltaA,
        chainLength: result.geometry.L,
      };
      await upsertCalculation(
        () => chainCalculationService.get(projectId),
        () => chainCalculationService.save(projectId, payload),
        () => chainCalculationService.update(projectId, payload),
      );
      saved.chain = true;
    } catch (e: any) {
      errors.push(`Xích: ${e?.message ?? "Lỗi không xác định"}`);
    }
  }

  // ── Module 3: Bánh răng ───────────────────────────────────────────────────
  if (fullGearState && motorSnapshot) {
    try {
      const { result: r, inputLh } = fullGearState;

      // Tính cấp chậm (bánh răng trụ) từ dữ liệu trục II
      const slow = calculateCylindricalGearStage({
        T_II: motorSnapshot.T_II,
        n_II: motorSnapshot.n_II,
        u_2: motorSnapshot.u_2,
        L_h: inputLh,
        c: 1,
      });

      const fastWarnings: string[] = [];
      if (!r.step5.isContactValid) fastWarnings.push(`σH=${r.sigma_H.toFixed(1)}>[σH]`);
      if (!r.step6.isBending1Valid) fastWarnings.push("σF1 không đạt");
      if (!r.step6.isBending2Valid) fastWarnings.push("σF2 không đạt");

      const payload: GearCalculationRequest = {
        nI: motorSnapshot.n_I,
        nII: motorSnapshot.n_II,
        tI: motorSnapshot.T_I,
        tII: motorSnapshot.T_II,
        u1: motorSnapshot.u_1,
        u2: motorSnapshot.u_2,
        lifeHours: inputLh,
        allowableSigmaH: r.allowable_sigma_H,
        allowableSigmaF: r.allowable_sigma_F1,
        // Cấp nhanh (bánh răng côn)
        fastZ1: r.z1,
        fastZ2: r.z2,
        fastMte: r.mte,
        fastMtm: r.mtm,
        fastMnm: r.step3.mnm,
        fastRe: r.Re,
        fastB: r.b,
        fastDm1: r.dm1,
        fastDm2: r.dm2,
        fastDelta1: r.delta1,
        fastDelta2: r.delta2,
        fastSigmaH: r.sigma_H,
        fastSigmaF1: r.sigma_F1,
        fastSigmaF2: r.sigma_F2,
        fastFt1: r.Ft,
        fastFr1: r.Fr1,
        fastFa1: r.Fa1,
        fastWarning: fastWarnings.length > 0 ? fastWarnings.join("; ") : null,
        // Cấp chậm (bánh răng trụ)
        slowZ1: slow.z1,
        slowZ2: slow.z2,
        slowM: slow.m,
        slowAw: slow.aw,
        slowBw: slow.bw,
        slowDw1: slow.dw1,
        slowDw2: slow.dw2,
        slowDa1: slow.da1,
        slowDa2: slow.da2,
        slowDf1: slow.df1,
        slowDf2: slow.df2,
        slowSigmaH: slow.sigma_H,
        slowSigmaF1: slow.sigma_F1,
        slowSigmaF2: slow.sigma_F2,
        slowFt1: slow.Ft,
        slowFr1: slow.Fr,
        slowWarning: slow.warning,
      };
      await upsertCalculation(
        () => gearCalculationService.get(projectId),
        () => gearCalculationService.save(projectId, payload),
        () => gearCalculationService.update(projectId, payload),
      );
      saved.gear = true;
    } catch (e: any) {
      errors.push(`Bánh răng: ${e?.message ?? "Lỗi không xác định"}`);
    }
  }

  return { ...saved, errors };
}
