import Button from "@/components/common/button";
import { calculateChainDrive, getMaxPc, type ChainDriveResult } from "@/lib/chainDriveCalculation";
import { globalNavigationState } from "@/lib/globalState";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function fmt(n: number, digits: number) {
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
}

function fmtInt(n: number) {
  return Number.isFinite(n) ? Math.round(n).toString() : "—";
}

function StepCard({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <View className="flex-row items-center gap-2.5 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
        <View className="h-4 w-1 rounded-full bg-[#22c55e]" />
        <Text className="text-xs font-inter-black uppercase tracking-wider text-[#22c55e]">
          {step}
        </Text>
        <View className="h-3 w-[1px] bg-zinc-300" />
        <Text className="shrink text-sm font-inter text-zinc-900" style={{ fontWeight: "600" }}>
          {title}
        </Text>
      </View>
      <View className="gap-y-1 px-4 py-3">{children}</View>
    </View>
  );
}

function StepLine({ label, value, error }: { label: string; value: string; error?: boolean }) {
  return (
    <View className="flex-row flex-wrap items-baseline justify-between gap-4 border-b border-dashed border-zinc-100 py-1.5 last:border-b-0">
      <Text className="shrink text-xs font-inter text-zinc-600 leading-5">
        {label}
      </Text>
      <Text
        className={`text-right text-[13px] font-inter leading-5 ${error ? "text-red-600 font-inter-black" : "text-zinc-900"}`}
        style={{ fontWeight: error ? "bold" : "500", fontFamily: "monospace" }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ChainScreen() {
  const params = useLocalSearchParams<{
    p?: string;
    n?: string;
    u?: string;
    gearT?: string;
    gearN?: string;
    gearU?: string;
  }>();

  const [powerKw, setPowerKw] = useState(params.p || "");
  const [nRpm, setNRpm] = useState(params.n || "");
  const [uRatio, setURatio] = useState(params.u || "");
  const [result, setResult] = useState<ChainDriveResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const runCalculation = useCallback(() => {
    setCalcError(null);
    setResult(null);

    if (powerKw.trim() === "" || nRpm.trim() === "" || uRatio.trim() === "") {
      return;
    }

    const P = parseFloat(powerKw.replace(",", "."));
    const n = parseFloat(nRpm.replace(",", "."));
    const u = parseFloat(uRatio.replace(",", "."));

    if (!Number.isFinite(P) || P <= 0) {
      setCalcError("Nhập P (kW) là số dương.");
      return;
    }
    if (!Number.isFinite(n) || n <= 0) {
      setCalcError("Nhập n (vòng/phút) là số dương.");
      return;
    }
    if (!Number.isFinite(u) || u <= 0) {
      setCalcError("Nhập tỉ số truyền u là số dương.");
      return;
    }

    try {
      const res = calculateChainDrive({ P, n, u });
      setResult(res);
    } catch (e: any) {
      setCalcError(e.message || "Lỗi trong quá trình tính toán.");
    }
  }, [powerKw, nRpm, uRatio]);

  useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-5 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm">
          <View className="flex-row items-center gap-2 border-b border-zinc-100 pb-3">
            <Ionicons name="options-outline" size={20} color="#52525b" />
            <Text className="text-base font-inter-black text-zinc-900">Thông số đầu vào trục III</Text>
          </View>
          <Text className="mt-3 text-[13px] font-inter text-zinc-500 leading-5">
            Nhập các thông số cơ bản cho bộ truyền xích.
          </Text>

          <View className="mt-5 gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="mb-2 text-[13px] font-inter text-zinc-700" style={{ fontWeight: "600" }}>
                  Công suất P <Text className="font-normal text-zinc-400 font-inter">(kW)</Text>
                </Text>
                <View className="h-[46px] flex-row items-center overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 px-3 focus-within:border-[#22c55e] focus-within:bg-white">
                  <TextInput
                    value={powerKw}
                    onChangeText={setPowerKw}
                    placeholder="VD: 8.2179"
                    keyboardType="decimal-pad"
                    className="flex-1 text-[15px] font-inter text-zinc-900"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="mb-2 text-[13px] font-inter text-zinc-700" style={{ fontWeight: "600" }}>
                  Số vòng quay n <Text className="font-normal text-zinc-400 font-inter">(v/ph)</Text>
                </Text>
                <View className="h-[46px] flex-row items-center overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 px-3 focus-within:border-[#22c55e] focus-within:bg-white">
                  <TextInput
                    value={nRpm}
                    onChangeText={setNRpm}
                    placeholder="VD: 150"
                    keyboardType="number-pad"
                    className="flex-1 text-[15px] font-inter text-zinc-900"
                  />
                </View>
              </View>
            </View>

            <View className="w-1/2 pr-2">
              <Text className="mb-2 text-[13px] font-inter text-zinc-700" style={{ fontWeight: "600" }}>
                Tỉ số truyền u
              </Text>
              <View className="h-[46px] flex-row items-center overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 px-3 focus-within:border-[#22c55e] focus-within:bg-white">
                <TextInput
                  value={uRatio}
                  onChangeText={setURatio}
                  placeholder="VD: 2"
                  keyboardType="decimal-pad"
                  className="flex-1 text-[15px] font-inter text-zinc-900"
                />
              </View>
            </View>
          </View>
        </View>

        {calcError ? (
          <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 shadow-sm">
            <Ionicons name="warning-outline" size={20} color="#dc2626" />
            <Text className="flex-1 text-sm font-inter text-red-800 leading-5" style={{ fontWeight: "500" }}>
              {calcError}
            </Text>
          </View>
        ) : null}

        {result ? (
          <View className="mt-5 rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm">
            <View className="flex-row items-center justify-between border-b border-zinc-100 pb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="analytics-outline" size={20} color="#10b981" />
                <Text className="text-base font-inter-black text-zinc-900">Chi tiết quy trình tính</Text>
              </View>
              <View className="rounded-full bg-green-50 px-2.5 py-1 flex-row items-center gap-1 border border-green-100">
                <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <Text className="text-[10px] uppercase tracking-wide font-inter-black text-green-700">Module 2</Text>
              </View>
            </View>

            <StepCard step="BƯỚC 1" title="Tính số răng đĩa xích">
              <StepLine label="Số răng đĩa dẫn (z1)" value={fmtInt(result.geometry.z1)} />
              <StepLine label="Số răng đĩa bị dẫn (z2)" value={fmtInt(result.geometry.z2)} />
            </StepCard>

            <StepCard step="BƯỚC 2" title="Công suất tính toán (Pt)">
              <StepLine label="Hệ số làm việc (K)" value={fmt(result.powerParams.K, 3)} />
              <StepLine
                label={`Hệ số vòng quay (Kn = ${result.powerParams.n_01}/${fmt(result.powerParams.n_01 / result.powerParams.K_n, 0)})`}
                value={fmt(result.powerParams.K_n, 4)}
              />
              <StepLine label="Hệ số ảnh hưởng số răng (Kz = 25/z1)" value={fmt(result.powerParams.K_z, 4)} />
              <StepLine label="Hệ số dãy xích (Kx)" value={fmt(result.powerParams.K_x, 1)} />
              <StepLine label="Công suất tính toán (Pt)" value={`${fmt(result.powerParams.P_t, 4)} kW`} />
            </StepCard>

            <StepCard step="BƯỚC 3" title="Kích thước hình học (mm)">
              <StepLine label="Bước xích (p_c)" value={fmt(result.geometry.p_c, 2)} error={!result.validations.isPcValid} />
              <StepLine label="Đường kính chia đĩa dẫn (d1)" value={fmt(result.geometry.d1, 2)} />
              <StepLine label="Đường kính chia đĩa bị dẫn (d2)" value={fmt(result.geometry.d2, 2)} />
              <StepLine label="Đường kính đỉnh đĩa dẫn (da1)" value={fmt(result.geometry.da1, 2)} />
              <StepLine label="Đường kính đỉnh đĩa bị dẫn (da2)" value={fmt(result.geometry.da2, 2)} />
            </StepCard>

            <StepCard step="BƯỚC 4" title="Khoảng cách và chiều dài xích">
              <StepLine label="Số mắt xích (X)" value={fmtInt(result.geometry.X)} />
              <StepLine label="Khoảng cách trục thực tế (a)" value={fmt(result.geometry.a, 2)} />
              <StepLine label="Chiều dài xích (L)" value={fmt(result.geometry.L, 2)} />
            </StepCard>

            <StepCard step="BƯỚC 5" title="Chỉ số kiểm nghiệm">
              <View className="mt-1 mb-2 bg-zinc-100 h-px w-full" />
              <Text className="mb-1 text-[11px] font-inter uppercase tracking-widest text-zinc-500" style={{ fontWeight: "600" }}>
                Vận tốc và lực vòng
              </Text>
              <StepLine label="Vận tốc trung bình (v)" value={`${fmt(result.geometry.v, 2)} m/s`} />
              <StepLine label="Lực vòng (F_t)" value={`${fmt(result.geometry.F_t, 2)} N`} />

              <View className="my-2 bg-zinc-100 h-px w-full" />
              <Text className="mb-1 text-[11px] font-inter uppercase tracking-widest text-zinc-500" style={{ fontWeight: "600" }}>
                Điều kiện bước xích
              </Text>
              <StepLine
                label={`Giới hạn p_c (≤ ${fmt(getMaxPc(parseFloat(nRpm.replace(",", ".")) || 0), 2)})`}
                value={fmt(result.geometry.p_c, 2)}
                error={!result.validations.isPcValid}
              />
              <StepLine label="Kết quả" value={result.validations.isPcValid ? "ĐẠT" : "KHÔNG ĐẠT"} error={!result.validations.isPcValid} />

              <View className="my-2 bg-zinc-100 h-px w-full" />
              <Text className="mb-1 text-[11px] font-inter uppercase tracking-widest text-zinc-500" style={{ fontWeight: "600" }}>
                Va đập bản lề
              </Text>
              <StepLine label="Số lần va đập (i)" value={fmt(result.validations.i, 2)} error={!result.validations.isImpactValid} />
              <StepLine label="Kết quả" value={result.validations.isImpactValid ? "ĐẠT (≤ 20)" : "KHÔNG ĐẠT"} error={!result.validations.isImpactValid} />

              <View className="my-2 bg-zinc-100 h-[1px] w-full" />
              <Text className="mb-1 text-[11px] font-inter uppercase tracking-widest text-zinc-500" style={{ fontWeight: "600" }}>
                Hệ số an toàn (s)
              </Text>
              <StepLine label="Hệ số s" value={fmt(result.validations.s, 2)} error={!result.validations.isStrengthValid} />
              <StepLine label="Kết quả" value={result.validations.isStrengthValid ? "ĐẠT (≥ 8.2)" : "KHÔNG ĐẠT"} error={!result.validations.isStrengthValid} />

              <View className="my-2 bg-zinc-100 h-[1px] w-full" />
              <Text className="mb-1 text-[11px] font-inter uppercase tracking-widest text-zinc-500" style={{ fontWeight: "600" }}>
                Ứng suất tiếp xúc (MPa)
              </Text>
              <StepLine label="Ứng suất (σ)" value={fmt(result.validations.sigma, 2)} error={!result.validations.isContactValid} />
              <StepLine label="Kết quả" value={result.validations.isContactValid ? "ĐẠT (≤ 600)" : "KHÔNG ĐẠT"} error={!result.validations.isContactValid} />

              <View className="my-2 bg-zinc-100 h-[1px] w-full" />
              <Text className="mb-1 text-[11px] font-inter uppercase tracking-widest text-zinc-500" style={{ fontWeight: "600" }}>
                Áp suất bản lề (MPa)
              </Text>
              <StepLine label="Áp suất (p0)" value={fmt(result.validations.p_calc, 2)} error={!result.validations.isPressureValid} />
              <StepLine label="Kết quả" value={result.validations.isPressureValid ? "ĐẠT (≤ 31)" : "KHÔNG ĐẠT"} error={!result.validations.isPressureValid} />
            </StepCard>
          </View>
        ) : null}

        <View className="mt-6 border-t border-zinc-200 pt-5">
          <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-3 border-b border-zinc-100 pb-2">
              <Ionicons name="arrow-forward-circle-outline" size={20} color="#0a7ea4" />
              <Text className="text-[17px] font-inter-black text-zinc-900 tracking-tight">Bước tiếp theo</Text>
            </View>
            <Button
              title="Tính bộ truyền bánh răng"
              variant="primary"
              icon="cog"
              onPress={() => {
                router.push({
                  pathname: "/gear",
                  params: {
                    t: params.gearT || "",
                    n: params.gearN || "",
                    u: params.gearU || "",
                    chainP: powerKw,
                    chainN: nRpm,
                    chainU: uRatio,
                  },
                });
              }}
            />
          </View>

          <View className="border-t border-zinc-200 pt-4">
          <Button
            title="Trở về và in kết quả"
            variant="outline"
            icon="arrow-back"
            onPress={() => {
              if (result) {
                globalNavigationState.chainResult = {
                  p_c: result.geometry.p_c,
                  z1: result.geometry.z1,
                  z2: result.geometry.z2,
                  d1: result.geometry.d1,
                  d2: result.geometry.d2,
                  a: result.geometry.a,
                  X: result.geometry.X,
                  isPcValid: result.validations.isPcValid,
                  isStrengthValid: result.validations.isStrengthValid,
                  isImpactValid: result.validations.isImpactValid,
                };
              }
              globalNavigationState.scrollToPrint = true;
              router.replace("/(tabs)/calc");
            }}
          />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
