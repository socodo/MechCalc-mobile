import assert from "node:assert/strict";
import test from "node:test";

import { motorDkSeedRows } from "../src/db/seed/motor-dk-data";
import {
  EFFICIENCY,
  PRELIMINARY_RATIO,
  calculateEtaTotal,
  calculateN_I_Step6,
  calculateN_II_Step6,
  calculateN_III_Step6,
  calculateNsb,
  calculateP_I_Step6,
  calculateP_II_Step6,
  calculateP_III_Step6,
  calculatePct,
  calculateTorqueStep6,
  calculateU1Step5,
  calculateU2Step5,
  calculateUhStep5,
  calculateUtStep5,
} from "../src/services/motor-dk-selection";

const input = {
  P_lv: 7.5,
  n_lv: 75,
  L: 10,
};

type Check = {
  name: string;
  actual: number;
  expected: number;
  tolerance: number;
};

function fixed(value: number) {
  if (!Number.isFinite(value)) return String(value);
  const abs = Math.abs(value);
  if (abs >= 1e6 || (abs > 0 && abs < 1e-3)) return value.toExponential(6);
  return value.toFixed(6);
}

function assertMatchesExcel(checks: Check[]) {
  const mismatches = checks.filter(
    ({ actual, expected, tolerance }) => Math.abs(actual - expected) > tolerance
  );

  if (mismatches.length === 0) return;

  const report = mismatches
    .map(({ name, actual, expected, tolerance }) => {
      const diff = actual - expected;
      return [
        name.padEnd(38),
        `expected=${fixed(expected)}`.padEnd(26),
        `actual=${fixed(actual)}`.padEnd(24),
        `diff=${fixed(diff)}`.padEnd(20),
        `tol=${tolerance}`,
      ].join(" | ");
    })
    .join("\n");

  assert.fail(`Module 1 motor calculation differs from Excel testcase:\n${report}`);
}

test("module 1 motor calculation matches Excel testcase", () => {
  const motor = motorDkSeedRows.find((row) => row.model === "IE3-W41R 160 M2");
  assert.ok(motor, "Missing testcase motor IE3-W41R 160 M2 in seed data");

  const eta = calculateEtaTotal();
  const P_ct = calculatePct(input.P_lv, eta);
  const n_ct = calculateNsb(input.n_lv);

  const n_dc = motor.speedRpm;
  const P_dc = motor.powerKw;
  const u_t = calculateUtStep5(n_dc, input.n_lv);
  const u_h = calculateUhStep5(u_t);
  const u_1_raw = 0.24 * u_h;
  const u_1 = calculateU1Step5(u_h);
  const u_2 = calculateU2Step5(u_h, u_1);

  const P_III = calculateP_III_Step6(input.P_lv);
  const P_II = calculateP_II_Step6(P_III);
  const P_I = calculateP_I_Step6(P_II);

  const n_I = calculateN_I_Step6(n_dc);
  const n_II = calculateN_II_Step6(n_I, u_1);
  const n_III = calculateN_III_Step6(n_II, u_2);

  const T_dc = calculateTorqueStep6(P_dc, n_dc);
  const T_I = calculateTorqueStep6(P_I, n_I);
  const T_II = calculateTorqueStep6(P_II, n_II);
  const T_III = calculateTorqueStep6(P_III, n_III);
  const T_lv = calculateTorqueStep6(input.P_lv, input.n_lv);

  const checks: Check[] = [
    // Hệ số và thông số chọn động cơ
    { name: "Hiệu suất nối trục", actual: EFFICIENCY.NT, expected: 0.98, tolerance: 0 },
    { name: "Hiệu suất bánh răng côn", actual: EFFICIENCY.BRC, expected: 0.96, tolerance: 0 },
    { name: "Hiệu suất bánh răng trụ", actual: EFFICIENCY.BRT, expected: 0.98, tolerance: 0 },
    { name: "Hiệu suất bộ truyền xích", actual: EFFICIENCY.X, expected: 0.92, tolerance: 0 },
    { name: "Hiệu suất ổ lăn", actual: EFFICIENCY.OL, expected: 0.992, tolerance: 0 },
    { name: "Hiệu suất hệ", actual: eta, expected: 0.8280, tolerance: 5e-4 },
    { name: "Công suất làm việc Plv", actual: input.P_lv, expected: 7.5, tolerance: 0 },
    { name: "Số vòng quay làm việc nlv", actual: input.n_lv, expected: 75, tolerance: 0 },
    { name: "Thời gian L", actual: input.L, expected: 10, tolerance: 0 },
    { name: "Công suất cần thiết Pct", actual: P_ct, expected: 9.0576, tolerance: 5e-4 },
    { name: "Tỉ số U hộp giảm tốc sơ bộ", actual: PRELIMINARY_RATIO.UHGT, expected: 14, tolerance: 0 },
    { name: "Tỉ số truyền xích Ux", actual: PRELIMINARY_RATIO.UX, expected: 2, tolerance: 0 },
    { name: "Tỉ số truyền hệ sơ bộ", actual: PRELIMINARY_RATIO.U_TOTAL, expected: 28, tolerance: 0 },
    { name: "Số vòng quay cần thiết nct", actual: n_ct, expected: 2100, tolerance: 0 },

    // Động cơ được chọn theo testcase Excel
    { name: "Công suất động cơ Pdc", actual: P_dc, expected: 11, tolerance: 0 },
    { name: "Tốc độ động cơ ndc", actual: n_dc, expected: 2950, tolerance: 0 },
    { name: "Tốc độ đồng bộ", actual: motor.syncSpeedRpm, expected: 3000, tolerance: 0 },
    { name: "Hệ số công suất cosphi", actual: motor.cosPhi, expected: 0.9, tolerance: 0 },
    { name: "Tỉ số moment mở máy Ma/Mb", actual: motor.startingTorqueRatio, expected: 2.2, tolerance: 0 },
    { name: "Tỉ số moment cực đại Mk/Mb", actual: motor.maxTorqueRatio, expected: 3.2, tolerance: 0 },
    { name: "Moment quán tính rotor J", actual: motor.rotorInertiaGd2, expected: 0.0575, tolerance: 0 },
    { name: "Khối lượng động cơ", actual: motor.weightKg, expected: 125, tolerance: 0 },

    // Tỉ số truyền thực tế
    { name: "Tỉ số truyền chung thực tế U hệ mới", actual: u_t, expected: 39.3333, tolerance: 5e-4 },
    { name: "Tỉ số hộp giảm tốc thực tế U hgt", actual: u_h, expected: 19.6667, tolerance: 5e-4 },
    { name: "U1 cấp nhanh trước làm tròn", actual: u_1_raw, expected: 4.72, tolerance: 5e-4 },
    { name: "U1 cấp nhanh", actual: u_1, expected: 4.7, tolerance: 0 },
    { name: "U2 cấp chậm", actual: u_2, expected: 4.1844, tolerance: 5e-5 },

    // Công suất trên các trục
    { name: "P động cơ", actual: P_dc, expected: 11, tolerance: 0 },
    { name: "P trục I", actual: P_I, expected: 8.8765, tolerance: 5e-4 },
    { name: "P trục II", actual: P_II, expected: 8.4533, tolerance: 5e-4 },
    { name: "P trục III", actual: P_III, expected: 8.2179, tolerance: 5e-4 },
    { name: "P công tác", actual: input.P_lv, expected: 7.5, tolerance: 0 },

    // Số vòng quay trên các trục
    { name: "n động cơ", actual: n_dc, expected: 2950, tolerance: 0 },
    { name: "n trục I", actual: n_I, expected: 2950, tolerance: 0 },
    { name: "n trục II", actual: n_II, expected: 628, tolerance: 0.5 },
    { name: "n trục III", actual: n_III, expected: 150, tolerance: 0.5 },
    { name: "n công tác", actual: input.n_lv, expected: 75, tolerance: 0 },

    // Mô-men xoắn trên các trục
    { name: "T động cơ", actual: T_dc, expected: 35610.1695, tolerance: 5e-4 },
    { name: "T trục I", actual: T_I, expected: 28735.7454, tolerance: 5e-4 },
    { name: "T trục II", actual: T_II, expected: 128618.4376, tolerance: 5e-4 },
    { name: "T trục III", actual: T_III, expected: 523207.3983, tolerance: 0.5 },
    { name: "T công tác", actual: T_lv, expected: 955000, tolerance: 0 },
  ];

  assertMatchesExcel(checks);
});
