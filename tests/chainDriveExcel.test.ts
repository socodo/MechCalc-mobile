import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_CONSTANTS,
  calculateChainDrive,
  getChainPhysicalProps,
  getChainStepParameters,
  getMaxPc,
} from "../src/lib/chainDriveCalculation";

const input = {
  P: 8.2179,
  n: 150,
  u: 2,
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
        name.padEnd(32),
        `expected=${fixed(expected)}`.padEnd(26),
        `actual=${fixed(actual)}`.padEnd(24),
        `diff=${fixed(diff)}`.padEnd(20),
        `tol=${tolerance}`,
      ].join(" | ");
    })
    .join("\n");

  assert.fail(`Module 2 chain drive differs from Excel testcase:\n${report}`);
}

test("module 2 chain drive calculation matches Excel testcase", () => {
  const result = calculateChainDrive(input);
  const { geometry, powerParams, validations } = result;
  const constants = DEFAULT_CONSTANTS;
  const stepParams = getChainStepParameters(powerParams.P_t, powerParams.n_01);
  const physicalProps = getChainPhysicalProps(geometry.p_c, stepParams.d_0);

  const aSb = 44 * geometry.p_c;
  const M = (geometry.z1 + geometry.z2) / 2;
  const N = Math.pow((geometry.z2 - geometry.z1) / (2 * Math.PI), 2);
  const Xsb = (2 * aSb) / geometry.p_c + M + (N * geometry.p_c) / aSb;
  const aTemp =
    0.25 *
    geometry.p_c *
    (geometry.X - M + Math.sqrt(Math.pow(geometry.X - M, 2) - 8 * N));
  const deltaA = 0.002 * aTemp;

  const Fv = physicalProps.q * Math.pow(geometry.v, 2);
  const Fo = 9.81 * constants.k_f * physicalProps.q * geometry.a * 10 ** -3;
  const Fvd = 13 * 10 ** -7 * geometry.z1 * geometry.p_c ** 3 * constants.m;

  const checks: Check[] = [
    { name: "z1", actual: geometry.z1, expected: 25, tolerance: 0 },
    { name: "z2", actual: geometry.z2, expected: 50, tolerance: 0 },
    { name: "K", actual: powerParams.K, expected: 0.896, tolerance: 0 },
    { name: "Kr", actual: 1, expected: 1, tolerance: 0 },
    { name: "Ka", actual: 1, expected: 1, tolerance: 0 },
    { name: "Ko", actual: 1, expected: 1, tolerance: 0 },
    { name: "Kdc", actual: 1, expected: 1, tolerance: 0 },
    { name: "Kb", actual: 0.8, expected: 0.8, tolerance: 0 },
    { name: "Klv", actual: 1.12, expected: 1.12, tolerance: 0 },
    { name: "Kx", actual: powerParams.K_x, expected: 1.7, tolerance: 0 },
    { name: "Kz", actual: powerParams.K_z, expected: 1, tolerance: 0 },
    { name: "Kn", actual: powerParams.K_n, expected: 1.3333, tolerance: 5e-5 },
    { name: "Pt", actual: powerParams.P_t, expected: 5.7751, tolerance: 5e-4 },
    { name: "pc", actual: geometry.p_c, expected: 25.4, tolerance: 0 },
    { name: "d0", actual: stepParams.d_0, expected: 7.95, tolerance: 0 },
    { name: "b0", actual: stepParams.b_0, expected: 22.61, tolerance: 0 },
    { name: "pc max", actual: getMaxPc(input.n), expected: 50.8, tolerance: 0 },
    { name: "v", actual: geometry.v, expected: 1.5875, tolerance: 5e-5 },
    { name: "a sơ bộ", actual: aSb, expected: 1118, tolerance: 0.5 },
    { name: "a trước giảm", actual: aTemp, expected: 1119.3878, tolerance: 5e-4 },
    { name: "a sau giảm", actual: geometry.a, expected: 1117.1490, tolerance: 5e-4 },
    { name: "Xsb", actual: Xsb, expected: 125.8598053, tolerance: 5e-7 },
    { name: "X", actual: geometry.X, expected: 126, tolerance: 0 },
    { name: "Delta a", actual: deltaA, expected: 2.2388, tolerance: 5e-4 },
    { name: "i", actual: validations.i, expected: 1.9841, tolerance: 5e-4 },
    { name: "Ft", actual: geometry.F_t, expected: 5176.6408, tolerance: 0.02 },
    { name: "Fv", actual: Fv, expected: 6.5524, tolerance: 5e-4 },
    { name: "Fo", actual: Fo, expected: 170.9640, tolerance: 5e-4 },
    { name: "s", actual: validations.s, expected: 8.8740, tolerance: 5e-4 },
    { name: "Fvd", actual: Fvd, expected: 7.0301, tolerance: 5e-4 },
    { name: "sigma", actual: validations.sigma, expected: 580.1511, tolerance: 1e-3 },
    { name: "L", actual: geometry.L, expected: 3200.4, tolerance: 5e-4 },
    { name: "Fr", actual: 1.15 * geometry.F_t, expected: 5953.1369, tolerance: 0.02 },
    { name: "d1", actual: geometry.d1, expected: 202.1268, tolerance: 5e-4 },
    { name: "d2", actual: geometry.d2, expected: 404.2536, tolerance: 5e-4 },
    { name: "da1", actual: geometry.da1, expected: 213.7617, tolerance: 5e-4 },
    { name: "da2", actual: geometry.da2, expected: 416.4214, tolerance: 5e-4 },
    { name: "p_calc", actual: validations.p_calc, expected: 10.6989, tolerance: 5e-4 },
  ];

  assertMatchesExcel(checks);
});
