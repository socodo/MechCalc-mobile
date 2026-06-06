import assert from "node:assert/strict";
import test from "node:test";

import { calculateBevelGearStage } from "../src/lib/gearDriveCalculation";

const input = {
  T_I: 28735.7454,
  n_I: 2950,
  u_1: 4.7,
  L_h: 4800,
  c: 1,
};

type Check = {
  name: string;
  actual: number;
  expected: number;
  tolerance: number;
};

function degrees(rad: number) {
  return (rad * 180) / Math.PI;
}

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
        name.padEnd(42),
        `expected=${fixed(expected)}`.padEnd(26),
        `actual=${fixed(actual)}`.padEnd(24),
        `diff=${fixed(diff)}`.padEnd(20),
        `tol=${tolerance}`,
      ].join(" | ");
    })
    .join("\n");

  assert.fail(`Module 3 differs from Excel testcase:\n${report}`);
}

test("module 3 bevel gear calculation matches Excel testcase", () => {
  const result = calculateBevelGearStage(input);
  const material1 = result.materialDatabase[0];
  const material2 = result.materialDatabase[1];

  const checks: Check[] = [
    // Thông số hình học chính
    { name: "Độ cứng bánh dẫn H1", actual: material1.hardnessHB, expected: 300, tolerance: 0 },
    { name: "Độ cứng bánh bị dẫn H2", actual: material2.hardnessHB, expected: 290, tolerance: 0 },
    { name: "Số răng z1", actual: result.z1, expected: 26, tolerance: 0 },
    { name: "Số răng z2", actual: result.z2, expected: 120, tolerance: 0 },
    { name: "Đường kính chia ngoài de1", actual: result.geometry.de1, expected: 52, tolerance: 0 },
    { name: "Đường kính chia ngoài de2", actual: result.geometry.de2, expected: 240, tolerance: 0 },
    { name: "Đường kính trung bình dm1", actual: result.dm1, expected: 44.46, tolerance: 5e-3 },
    { name: "Đường kính trung bình dm2", actual: result.dm2, expected: 205.2, tolerance: 5e-3 },
    { name: "Góc côn chia delta1", actual: degrees(result.delta1), expected: 12.2251, tolerance: 5e-4 },
    { name: "Góc côn chia delta2", actual: degrees(result.delta2), expected: 77.7749, tolerance: 5e-4 },
    { name: "Chiều cao đầu răng hae1", actual: result.geometry.hae1, expected: 2.776, tolerance: 5e-4 },
    { name: "Chiều cao đầu răng hae2", actual: result.geometry.hae2, expected: 1.224, tolerance: 5e-4 },
    { name: "Hệ số dịch chỉnh pháp X1", actual: result.step3.x_n1, expected: 0.388, tolerance: 5e-4 },
    { name: "Hệ số dịch chỉnh pháp X2", actual: result.step3.x_n2, expected: -0.388, tolerance: 5e-4 },
    { name: "Chiều cao chân răng hfe1", actual: result.geometry.hfe1, expected: 1.624, tolerance: 5e-4 },
    { name: "Chiều cao chân răng hfe2", actual: result.geometry.hfe2, expected: 3.176, tolerance: 5e-4 },
    { name: "Đường kính đỉnh răng dae1", actual: result.geometry.dae1, expected: 51.8958, tolerance: 5e-4 },
    { name: "Đường kính đỉnh răng dae2", actual: result.geometry.dae2, expected: 77.1009, tolerance: 1e-4 },
    { name: "Hệ số dịch chỉnh tiếp tuyến xt1", actual: result.step3.x_tau1, expected: 0.0476, tolerance: 5e-5 },
    { name: "Hệ số dịch chỉnh tiếp tuyến xt2", actual: result.step3.x_tau2, expected: -0.0476, tolerance: 5e-5 },
    { name: "Góc chân răng theta_f1", actual: degrees(result.geometry.theta_f1), expected: 0.7578, tolerance: 5e-4 },
    { name: "Góc chân răng theta_f2", actual: degrees(result.geometry.theta_f2), expected: 1.4817, tolerance: 5e-4 },
    { name: "Góc côn đỉnh delta_a1", actual: degrees(result.geometry.delta_a1), expected: 10.7434, tolerance: 5e-4 },
    { name: "Góc côn đỉnh delta_a2", actual: degrees(result.geometry.delta_a2), expected: 77.0171, tolerance: 5e-4 },
    { name: "Góc côn đáy delta_f1", actual: degrees(result.geometry.delta_f1), expected: 11.4673, tolerance: 5e-4 },
    { name: "Góc côn đáy delta_f2", actual: degrees(result.geometry.delta_f2), expected: 76.2932, tolerance: 5e-4 },

    // Kiểm bền và tuổi thọ
    { name: "Giới hạn mỏi tiếp xúc sigma_Hlim", actual: result.step1.sigmaHlim0, expected: 650, tolerance: 0 },
    { name: "Giới hạn mỏi uốn sigma_Flim", actual: result.step1.sigmaFlim0, expected: 522, tolerance: 0 },
    { name: "Chu kỳ N_HO", actual: result.step1.N_HO, expected: 2.44e7, tolerance: 5e4 },
    { name: "Chu kỳ N_FO", actual: result.step1.N_FO, expected: 4.0e6, tolerance: 0 },
    { name: "Chu kỳ N_HE sau giới hạn", actual: result.step1.N_HE, expected: 2.44e7, tolerance: 5e4 },
    { name: "Chu kỳ N_FE sau giới hạn", actual: result.step1.N_FE, expected: 4.0e6, tolerance: 0 },
    { name: "Thời gian làm việc Lh", actual: input.L_h, expected: 4800, tolerance: 0 },
    { name: "Hệ số tuổi thọ KHL", actual: result.step1.K_HL, expected: 1, tolerance: 0 },
    { name: "Hệ số tuổi thọ KFL", actual: result.step1.K_FL, expected: 1, tolerance: 0 },
    { name: "Ứng suất tiếp xúc cho phép", actual: result.allowable_sigma_H, expected: 590.9091, tolerance: 5e-4 },
    { name: "Ứng suất tiếp xúc tính toán", actual: result.sigma_H, expected: 521.1488, tolerance: 0.1 },
    { name: "Ứng suất uốn cho phép", actual: result.allowable_sigma_F1, expected: 298.2857, tolerance: 5e-4 },
    { name: "Ứng suất uốn bánh dẫn", actual: result.sigma_F1, expected: 143.2709, tolerance: 0.05 },
    { name: "Ứng suất uốn bánh bị dẫn", actual: result.sigma_F2, expected: 171.7645, tolerance: 0.05 },

    // Module, hệ số và vận tốc/lực
    { name: "Module vòng ngoài sơ bộ", actual: result.step3.mte_prelim, expected: 1.7873, tolerance: 5e-4 },
    { name: "Module vòng ngoài thực", actual: result.mte, expected: 2, tolerance: 0 },
    { name: "Module vòng trung bình sơ bộ", actual: result.step3.mtm_prelim, expected: 1.5281, tolerance: 5e-4 },
    { name: "Module vòng trung bình thực", actual: result.mtm, expected: 1.71, tolerance: 5e-4 },
    { name: "Module pháp trung bình", actual: result.step3.mnm, expected: 1.71, tolerance: 5e-4 },
    { name: "delta_H", actual: result.step5.delta_H, expected: 0.006, tolerance: 0 },
    { name: "delta_F", actual: result.step6.delta_F, expected: 0.016, tolerance: 0 },
    { name: "g0", actual: result.step5.g0, expected: 47, tolerance: 0 },
    { name: "Kbe", actual: result.step2.K_be, expected: 0.29, tolerance: 0 },
    { name: "epsilon_alpha", actual: result.step5.eps_alpha, expected: 1.7303, tolerance: 1e-3 },
    { name: "Zepsilon", actual: result.step5.Z_eps, expected: 0.8698, tolerance: 5e-4 },
    { name: "Yepsilon", actual: result.step6.Y_eps, expected: 0.5779, tolerance: 5e-4 },
    { name: "KHv", actual: result.step5.K_Hv, expected: 1.332, tolerance: 5e-4 },
    { name: "KFv", actual: result.step6.K_Fv, expected: 1.6018, tolerance: 5e-4 },
    { name: "KH", actual: result.step5.K_H, expected: 1.5717, tolerance: 5e-4 },
    { name: "KF", actual: result.step6.K_F, expected: 2.1625, tolerance: 5e-4 },
    { name: "Tỉ số chiều rộng vành răng", actual: result.step2.widthRatio, expected: 0.7971, tolerance: 5e-4 },
    { name: "KHbeta", actual: result.step2.K_Hbeta, expected: 1.18, tolerance: 0 },
    { name: "KFbeta", actual: result.step6.K_Fbeta, expected: 1.35, tolerance: 0 },

    // Các giá trị hình học còn lại
    { name: "Chiều dài côn trung bình Rm", actual: result.geometry.Rm, expected: 108.9362, tolerance: 5e-4 },
    { name: "Chiều dài côn ngoài Re", actual: result.Re, expected: 122.7844, tolerance: 5e-4 },
    { name: "Chiều rộng vành răng b", actual: result.b, expected: 35.6075, tolerance: 5e-4 },
    { name: "Chiều cao răng ngoài he", actual: result.geometry.he, expected: 4.4, tolerance: 5e-4 },
    { name: "Đường kính ngoài bánh côn 1", actual: result.step2.de1_prelim, expected: 46.4697, tolerance: 5e-4 },

    // Sai số, vận tốc và lực
    { name: "Sai số ứng suất tiếp xúc", actual: result.allowable_sigma_H - result.sigma_H, expected: 69.7603, tolerance: 0.1 },
    { name: "Số răng tương đương zvn", actual: result.step4.z_vn, expected: 26.6033, tolerance: 5e-4 },
    { name: "Sai số khi tính lại tỉ số truyền", actual: Math.abs(input.u_1 - result.u_actual), expected: 0.0846, tolerance: 5e-4 },
    { name: "Vận tốc tiếp xúc tương đương vH", actual: result.step5.v_H, expected: 14.2204, tolerance: 5e-4 },
    { name: "Vận tốc tải trọng động uốn vF", actual: result.step6.v_F, expected: 37.9211, tolerance: 5e-4 },
    { name: "Vận tốc vòng v", actual: result.v, expected: 6.8674, tolerance: 5e-4 },
    { name: "Lực vòng Ft", actual: result.Ft, expected: 1292.6561, tolerance: 5e-4 },
    { name: "Lực pháp tuyến Fn", actual: result.step7.Fn1, expected: 1375.6159, tolerance: 5e-4 },
    { name: "Lực hướng tâm Fr1", actual: result.Fr1, expected: 459.8191, tolerance: 5e-4 },
    { name: "Lực dọc trục Fa1", actual: result.Fa1, expected: 99.6275, tolerance: 5e-4 },
  ];

  assertMatchesExcel(checks);
});
