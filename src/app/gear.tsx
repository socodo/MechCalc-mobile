import { calculateBevelGearStage, type BevelGearResult } from "@/lib/gearDriveCalculation";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import Button from "@/components/common/button";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalNavigationState } from "@/lib/globalState";

function fmt(n: number, digits: number) {
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
}

function fmtTrunc(n: number, digits: number) {
  if (!Number.isFinite(n)) return "—";
  const factor = 10 ** digits;
  return (Math.trunc(n * factor) / factor).toFixed(digits);
}

function fmtSci(n: number) {
  return Number.isFinite(n) ? n.toExponential(2) : "—";
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
        <View className="h-4 w-1 rounded-full bg-[#3b82f6]" />
        <Text className="text-xs font-inter-black uppercase tracking-wider text-[#3b82f6]">
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
    <View className="flex-row items-start justify-between gap-3 border-b border-dashed border-zinc-100 py-1.5 last:border-b-0">
      <Text className="flex-1 pr-2 text-xs font-inter text-zinc-600 leading-5">
        {label}
      </Text>
      <Text className={`shrink-0 text-right text-[13px] font-inter leading-5 ${error ? 'text-red-600 font-inter-black' : 'text-zinc-900'}`} style={{ fontWeight: error ? "bold" : "500", fontFamily: "monospace" }}>
        {value}
      </Text>
    </View>
  );
}

export default function GearScreen() {
  const params = useLocalSearchParams<{
    t?: string;
    n?: string;
    u?: string;
    chainP?: string;
    chainN?: string;
    chainU?: string;
  }>();
  
  const [torqueNmm, setTorqueNmm] = useState(params.t || "");
  const [nRpm, setNRpm] = useState(params.n || "");
  const [uRatio, setURatio] = useState(params.u || "");
  const [lhHours, setLhHours] = useState("4800");
  const [result, setResult] = useState<BevelGearResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const runCalculation = useCallback(() => {
    setCalcError(null);
    setResult(null);

    if (torqueNmm.trim() === "" || nRpm.trim() === "" || uRatio.trim() === "" || lhHours.trim() === "") {
      return;
    }

    const T_I = parseFloat(torqueNmm.replace(",", "."));
    const n_I = parseFloat(nRpm.replace(",", "."));
    const u_1 = parseFloat(uRatio.replace(",", "."));
    const L_h = parseFloat(lhHours.replace(",", "."));

    if (!Number.isFinite(T_I) || T_I <= 0) {
      setCalcError("Nhập Mô-men xoắn T (N.mm) là số dương.");
      return;
    }
    if (!Number.isFinite(n_I) || n_I <= 0) {
      setCalcError("Nhập số vòng quay n (vòng/phút) là số dương.");
      return;
    }
    if (!Number.isFinite(u_1) || u_1 <= 0) {
      setCalcError("Nhập tỉ số truyền u là số dương.");
      return;
    }
    if (!Number.isFinite(L_h) || L_h <= 0) {
      setCalcError("Nhập tuổi thọ Lh (giờ) là số dương.");
      return;
    }

    try {
      const res = calculateBevelGearStage({ T_I, n_I, u_1, L_h, c: 1 });
      setResult(res);
    } catch (e: any) {
      setCalcError(e.message || "Lỗi trong quá trình tính toán.");
    }
  }, [torqueNmm, nRpm, uRatio, lhHours]);

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
        {/* Input Card */}
        <View className="rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm">
          <View className="flex-row items-center gap-2 border-b border-zinc-100 pb-3">
            <Ionicons name="options-outline" size={20} color="#52525b" />
            <Text className="text-base font-inter-black text-zinc-900">Thông số đầu vào</Text>
          </View>
          <Text className="mt-3 text-[13px] font-inter text-zinc-500 leading-5">
            Nhập các thông số cơ bản cho bộ truyền bánh răng.
          </Text>

          <View className="mt-5 gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="mb-2 text-[13px] font-inter text-zinc-700" style={{ fontWeight: "600" }}>
                  Mô-men T <Text className="font-normal text-zinc-400 font-inter">(N.mm)</Text>
                </Text>
                <View className="h-[46px] flex-row items-center overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 px-3 focus-within:border-[#3b82f6] focus-within:bg-white">
                  <TextInput
                    value={torqueNmm}
                    onChangeText={setTorqueNmm}
                    placeholder="VD: 28736"
                    keyboardType="numeric"
                    className="flex-1 text-[15px] font-inter text-zinc-900"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="mb-2 text-[13px] font-inter text-zinc-700" style={{ fontWeight: "600" }}>
                  Số vòng quay n <Text className="font-normal text-zinc-400 font-inter">(v/ph)</Text>
                </Text>
                <View className="h-[46px] flex-row items-center overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 px-3 focus-within:border-[#3b82f6] focus-within:bg-white">
                  <TextInput
                    value={nRpm}
                    onChangeText={setNRpm}
                    placeholder="VD: 2950"
                    keyboardType="numeric"
                    className="flex-1 text-[15px] font-inter text-zinc-900"
                  />
                </View>
              </View>
            </View>
            
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="mb-2 text-[13px] font-inter text-zinc-700" style={{ fontWeight: "600" }}>
                  Tỉ số truyền u
                </Text>
                <View className="h-[46px] flex-row items-center overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 px-3 focus-within:border-[#3b82f6] focus-within:bg-white">
                  <TextInput
                    value={uRatio}
                    onChangeText={setURatio}
                    placeholder="VD: 4.7"
                    keyboardType="numeric"
                    className="flex-1 text-[15px] font-inter text-zinc-900"
                  />
                </View>
              </View>
              
              <View className="flex-1">
                <Text className="mb-2 text-[13px] font-inter text-zinc-700" style={{ fontWeight: "600" }}>
                  Tuổi thọ Lh <Text className="font-normal text-zinc-400 font-inter">(giờ)</Text>
                </Text>
                <View className="h-[46px] flex-row items-center overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 px-3 focus-within:border-[#3b82f6] focus-within:bg-white">
                  <TextInput
                    value={lhHours}
                    onChangeText={setLhHours}
                    placeholder="VD: 12000"
                    keyboardType="numeric"
                    className="flex-1 text-[15px] font-inter text-zinc-900"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Error Alert */}
        {calcError ? (
          <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 shadow-sm">
            <Ionicons name="warning-outline" size={20} color="#dc2626" />
            <Text className="flex-1 text-sm font-inter text-red-800 leading-5" style={{ fontWeight: "500" }}>{calcError}</Text>
          </View>
        ) : null}

        {/* Results */}
        {result ? (
          <View className="mt-5 rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm">
            <View className="flex-row items-center justify-between border-b border-zinc-100 pb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="analytics-outline" size={20} color="#3b82f6" />
                <Text className="text-base font-inter-black text-zinc-900">Chi tiết quy trình tính</Text>
              </View>
              <View className="rounded-full bg-blue-50 px-2.5 py-1 flex-row items-center gap-1 border border-blue-100">
                <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <Text className="text-[10px] uppercase tracking-wide font-inter-black text-blue-700">Module 3</Text>
              </View>
            </View>

            <StepCard step="BƯỚC 1" title="Chọn vật liệu và xác định ứng suất cho phép">
              <StepLine label="Độ rắn bánh dẫn (HB1)" value={`${fmt(result.step1.HB1, 0)} HB`} />
              <StepLine label="Độ rắn bánh bị dẫn (HB2)" value={`${fmt(result.step1.HB2, 0)} HB`} />
              <StepLine label="Giới hạn mỏi tiếp xúc (σHlim0 = 2HB2 + 70)" value={`${fmt(result.step1.sigmaHlim0, 0)} MPa`} />
              <StepLine label="Giới hạn mỏi uốn (σFlim0 = 1.8HB2)" value={`${fmt(result.step1.sigmaFlim0, 0)} MPa`} />
              <StepLine label="Số chu kỳ cơ sở tiếp xúc (NHO)" value={fmtSci(result.step1.N_HO)} />
              <StepLine label="Số chu kỳ cơ sở uốn (NFO)" value={fmtSci(result.step1.N_FO)} />
              <StepLine label="Số chu kỳ làm việc tương đương sau giới hạn (NHE)" value={fmtSci(result.step1.N_HE)} />
              <StepLine label="Số chu kỳ uốn sau giới hạn (NFE)" value={fmtSci(result.step1.N_FE)} />
              <StepLine label="Hệ số tuổi thọ tiếp xúc (KHL)" value={fmt(result.step1.K_HL, 3)} />
              <StepLine label="Hệ số tuổi thọ uốn (KFL)" value={fmt(result.step1.K_FL, 3)} />
              <StepLine label="Ứng suất tiếp xúc cho phép ([σH])" value={`${fmt(result.allowable_sigma_H, 1)} MPa`} />
              <StepLine label="Ứng suất uốn cho phép bánh dẫn ([σF1])" value={`${fmt(result.allowable_sigma_F1, 1)} MPa`} />
              <StepLine label="Ứng suất uốn cho phép bánh bị dẫn ([σF2])" value={`${fmt(result.allowable_sigma_F2, 1)} MPa`} />
            </StepCard>

            <StepCard step="BƯỚC 2" title="Xác định thông số hình học sơ bộ">
              <StepLine label="Hệ số chiều rộng vành răng (Kbe)" value={fmt(result.step2.K_be, 2)} />
              <StepLine label="Tỉ số hệ số chiều rộng vành răng (Kbe × u / (2 - Kbe))" value={fmt(result.step2.widthRatio, 3)} />
              <StepLine label="Hệ số phân bố tải theo chiều rộng (KHβ)" value={fmt(result.step2.K_Hbeta, 2)} />
              <StepLine label="Hệ số đường kính bánh côn thép (Kd)" value={fmt(result.step2.Kd, 0)} />
              <StepLine label="Hệ số vật liệu và loại răng (Kr = 0.5Kd)" value={fmt(result.step2.Kr, 0)} />
              <StepLine label="Chiều dài côn ngoài sơ bộ (Re)" value={`${fmt(result.step2.Re_prelim, 2)} mm`} />
              <StepLine label="Đường kính chia ngoài sơ bộ bánh dẫn (de1)" value={`${fmt(result.step2.de1_prelim, 2)} mm`} />
            </StepCard>

            <StepCard step="BƯỚC 3" title="Xác định số răng và mô-đun">
              <StepLine label="Số răng sơ bộ z1p" value={fmtInt(result.step3.z1p)} />
              <StepLine label="Số răng bánh dẫn (z1)" value={fmtInt(result.z1)} />
              <StepLine label="Số răng bánh bị dẫn (z2)" value={fmtInt(result.z2)} />
              <StepLine label="Tỉ số truyền thực tế (u_act)" value={fmt(result.u_actual, 3)} />
              <StepLine label="Sai số tỉ số truyền (Δu)" value={fmtTrunc(result.u_error, 4)} error={!result.step3.isRatioValid} />
              <StepLine label="Kết quả sai số" value={result.step3.isRatioValid ? "ĐẠT" : "CẦN KIỂM TRA"} error={!result.step3.isRatioValid} />
              <StepLine label="Hệ số dịch chỉnh tiếp tuyến bánh dẫn (xτ1)" value={fmt(result.step3.x_tau1, 4)} />
              <StepLine label="Hệ số dịch chỉnh tiếp tuyến bánh bị dẫn (xτ2)" value={fmt(result.step3.x_tau2, 4)} />
              <StepLine label="Hệ số dịch chỉnh pháp bánh dẫn chọn theo bảng (xn1)" value={fmt(result.step3.x_n1, 3)} />
              <StepLine label="Hệ số dịch chỉnh pháp bánh bị dẫn (xn2)" value={fmt(result.step3.x_n2, 3)} />
              <StepLine label="Đường kính trung bình sơ bộ bánh dẫn (dm1)" value={`${fmt(result.step3.dm1_prelim, 2)} mm`} />
              <StepLine label="Mô-đun vòng trung bình sơ bộ (mtm)" value={fmt(result.step3.mtm_prelim, 3)} />
              <StepLine label="Mô-đun vòng ngoài sơ bộ (mte sơ bộ)" value={fmt(result.step3.mte_prelim, 3)} />
              <StepLine label="Mô-đun vòng ngoài tiêu chuẩn đã chọn (mte)" value={fmt(result.mte, 3)} />
              <StepLine label="Mô-đun vòng trung bình tính lại (mtm)" value={fmt(result.mtm, 3)} />
              <StepLine label="Đường kính trung bình bánh dẫn (dm1)" value={`${fmt(result.dm1, 2)} mm`} />
              <StepLine label="Đường kính trung bình bánh bị dẫn (dm2)" value={`${fmt(result.dm2, 2)} mm`} />
              <StepLine label="Mô-đun pháp trung bình (mnm)" value={fmt(result.step3.mnm, 3)} />
              <StepLine label="Chiều dài côn ngoài tính lại (Re)" value={`${fmt(result.Re, 4)} mm`} />
              <StepLine label="Chiều rộng vành răng (b = Kbe × Re)" value={`${fmt(result.b, 4)} mm`} />
            </StepCard>

            <StepCard step="BƯỚC 4" title="Xác định các góc và thông số hình học">
              <StepLine label="Góc côn chia bánh dẫn (δ1)" value={`${fmt(result.delta1 * 180 / Math.PI, 4)}°`} />
              <StepLine label="Góc côn chia bánh bị dẫn (δ2)" value={`${fmt(result.delta2 * 180 / Math.PI, 4)}°`} />
              <StepLine label="Số răng tương đương (zvn)" value={fmt(result.step4.z_vn, 2)} />
              <StepLine label="Vận tốc vòng (v)" value={`${fmt(result.v, 2)} m/s`} />
              <StepLine label="Chiều dài côn trung bình (Rm)" value={`${fmt(result.geometry.Rm, 4)} mm`} />
              <StepLine label="Đường kính chia ngoài bánh dẫn (de1)" value={`${fmt(result.geometry.de1, 0)} mm`} />
              <StepLine label="Đường kính chia ngoài bánh bị dẫn (de2)" value={`${fmt(result.geometry.de2, 0)} mm`} />
              <StepLine label="Chiều cao răng ngoài (he)" value={`${fmt(result.geometry.he, 1)} mm`} />
              <StepLine label="Chiều cao đầu răng ngoài bánh dẫn (hae1)" value={`${fmt(result.geometry.hae1, 3)} mm`} />
              <StepLine label="Chiều cao đầu răng ngoài bánh bị dẫn (hae2)" value={`${fmt(result.geometry.hae2, 3)} mm`} />
              <StepLine label="Chiều cao chân răng ngoài bánh dẫn (hfe1)" value={`${fmt(result.geometry.hfe1, 3)} mm`} />
              <StepLine label="Chiều cao chân răng ngoài bánh bị dẫn (hfe2)" value={`${fmt(result.geometry.hfe2, 3)} mm`} />
              <StepLine label="Đường kính đỉnh răng ngoài bánh dẫn (dae1)" value={`${fmt(result.geometry.dae1, 4)} mm`} />
              <StepLine label="Đường kính đỉnh răng ngoài bánh bị dẫn (dae2)" value={`${fmt(result.geometry.dae2, 4)} mm`} />
              <StepLine label="Góc chân răng bánh dẫn (θf1)" value={`${fmt(result.geometry.theta_f1 * 180 / Math.PI, 4)}°`} />
              <StepLine label="Góc chân răng bánh bị dẫn (θf2)" value={`${fmt(result.geometry.theta_f2 * 180 / Math.PI, 4)}°`} />
              <StepLine label="Góc côn đỉnh bánh dẫn (δa1)" value={`${fmt(result.geometry.delta_a1 * 180 / Math.PI, 4)}°`} />
              <StepLine label="Góc côn đỉnh bánh bị dẫn (δa2)" value={`${fmt(result.geometry.delta_a2 * 180 / Math.PI, 4)}°`} />
              <StepLine label="Góc côn đáy bánh dẫn (δf1)" value={`${fmt(result.geometry.delta_f1 * 180 / Math.PI, 4)}°`} />
              <StepLine label="Góc côn đáy bánh bị dẫn (δf2)" value={`${fmt(result.geometry.delta_f2 * 180 / Math.PI, 4)}°`} />
            </StepCard>

            <StepCard step="BƯỚC 5" title="Kiểm nghiệm độ bền tiếp xúc">
              <StepLine label="Hệ số cơ tính vật liệu (ZM)" value={fmt(result.step5.Z_M, 0)} />
              <StepLine label="Hệ số hình dạng tiếp xúc (ZH)" value={fmt(result.step5.Z_H, 2)} />
              <StepLine label="Hệ số trùng khớp ngang (εα)" value={fmt(result.step5.eps_alpha, 3)} />
              <StepLine label="Hệ số trùng khớp tiếp xúc (Zε)" value={fmt(result.step5.Z_eps, 3)} />
              <StepLine label="Vận tốc tiếp xúc tương đương (vH)" value={fmt(result.step5.v_H, 3)} />
              <StepLine label="Hệ số phân bố tải theo phương tiếp tuyến (KHα)" value={fmt(result.step5.K_Halpha, 2)} />
              <StepLine label="Hệ số phân bố tải theo chiều rộng (KHβ)" value={fmt(result.step2.K_Hbeta, 2)} />
              <StepLine label="Hệ số tải trọng động tiếp xúc (KHv)" value={fmt(result.step5.K_Hv, 3)} />
              <StepLine label="Hệ số tải trọng tiếp xúc (KH)" value={fmt(result.step5.K_H, 3)} />
              <StepLine label="Giá trị cho phép tiếp xúc ([σH])" value={`${fmt(result.allowable_sigma_H, 4)} MPa`} />
              <StepLine label="Giá trị tính toán tiếp xúc (σH)" value={`${fmt(result.sigma_H, 4)} MPa`} error={!result.step5.isContactValid} />
              <StepLine label="Kết quả" value={result.step5.isContactValid ? "ĐẠT" : "KHÔNG ĐẠT"} error={!result.step5.isContactValid} />
            </StepCard>

            <StepCard step="BƯỚC 6" title="Kiểm nghiệm độ bền uốn">
              <StepLine label="Hệ số trùng khớp răng (Yε)" value={fmt(result.step6.Y_eps, 3)} />
              <StepLine label="Hệ số độ nghiêng răng (Yβ)" value={fmt(result.step6.Y_beta, 2)} />
              <StepLine label="Hệ số dạng răng bánh dẫn (YF1)" value={fmt(result.step6.Y_F1, 2)} />
              <StepLine label="Hệ số dạng răng bánh bị dẫn (YF2)" value={fmt(result.step6.Y_F2, 2)} />
              <StepLine label="Hệ số phân bố tải uốn theo phương tiếp tuyến (KFα)" value={fmt(result.step6.K_Falpha, 2)} />
              <StepLine label="Hệ số phân bố tải uốn theo chiều rộng (KFβ)" value={fmt(result.step6.K_Fbeta, 2)} />
              <StepLine label="Vận tốc tải trọng động uốn (vF)" value={fmt(result.step6.v_F, 3)} />
              <StepLine label="Hệ số tải trọng động uốn (KFv)" value={fmt(result.step6.K_Fv, 4)} />
              <StepLine label="Hệ số tải trọng uốn (KF)" value={fmt(result.step6.K_F, 4)} />
              <StepLine label="Giá trị cho phép uốn bánh dẫn ([σF1])" value={`${fmt(result.allowable_sigma_F1, 4)} MPa`} />
              <StepLine label="Giá trị tính toán uốn bánh dẫn (σF1)" value={`${fmt(result.sigma_F1, 4)} MPa`} error={!result.step6.isBending1Valid} />
              <StepLine label="Kết quả bánh 1" value={result.step6.isBending1Valid ? "ĐẠT" : "KHÔNG ĐẠT"} error={!result.step6.isBending1Valid} />
              <StepLine label="Giá trị cho phép uốn bánh bị dẫn ([σF2])" value={`${fmt(result.allowable_sigma_F2, 4)} MPa`} />
              <StepLine label="Giá trị tính toán uốn bánh bị dẫn (σF2)" value={`${fmt(result.sigma_F2, 4)} MPa`} error={!result.step6.isBending2Valid} />
              <StepLine label="Kết quả bánh 2" value={result.step6.isBending2Valid ? "ĐẠT" : "KHÔNG ĐẠT"} error={!result.step6.isBending2Valid} />
            </StepCard>

            <StepCard step="BƯỚC 7" title="Tính lực tác dụng">
              <StepLine label="Góc áp lực (α)" value={`${fmt(result.step7.alpha * 180 / Math.PI, 0)}°`} />
              <StepLine label="Lực vòng bánh dẫn và bánh bị dẫn (Ft1 = Ft2)" value={`${fmt(result.Ft, 1)} N`} />
              <StepLine label="Lực pháp tuyến bánh dẫn (Fn1)" value={`${fmt(result.step7.Fn1, 1)} N`} />
              <StepLine label="Lực hướng tâm bánh dẫn, lực dọc trục bánh bị dẫn (Fr1 = Fa2)" value={`${fmt(result.Fr1, 1)} N`} />
              <StepLine label="Lực dọc trục bánh dẫn, lực hướng tâm bánh bị dẫn (Fa1 = Fr2)" value={`${fmt(result.Fa1, 1)} N`} />
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
              title="Tính bộ truyền xích"
              variant="success"
              icon="link"
              onPress={() => {
                router.push({
                  pathname: "/chain",
                  params: {
                    p: params.chainP || "",
                    n: params.chainN || "",
                    u: params.chainU || "",
                    gearT: torqueNmm,
                    gearN: nRpm,
                    gearU: uRatio,
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
