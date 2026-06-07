import { motorCalculationService, type MotorCalculationResponse } from "@/services/api/motor-calculation.service";
import { chainCalculationService, type ChainCalculationResponse } from "@/services/api/chain-calculation.service";
import { gearCalculationService, type GearCalculationResponse } from "@/services/api/gear-calculation.service";
import { projectService, type ProjectResponse } from "@/services/api/project.service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function fmt(n: number | null | undefined, digits: number) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}
function fmtInt(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return Math.round(n).toString();
}

function SectionCard({ title, icon, color, children }: {
  title: string; icon: string; color: string; children: React.ReactNode;
}) {
  return (
    <View className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <View className="flex-row items-center gap-2 px-4 py-3 border-b border-zinc-100" style={{ backgroundColor: color + "10" }}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text className="text-sm font-inter" style={{ fontWeight: "700", color }}>{title}</Text>
      </View>
      <View className="px-4 py-3 gap-0.5">{children}</View>
    </View>
  );
}

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <View className="flex-row justify-between items-baseline py-1.5 border-b border-dashed border-zinc-100 last:border-0">
      <Text className="text-xs font-inter text-zinc-500 flex-1 pr-2">{label}</Text>
      <Text className="text-xs text-zinc-900" style={{ fontWeight: "600", fontFamily: mono ? "monospace" : undefined }}>
        {value}
      </Text>
    </View>
  );
}

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-1.5 border-b border-dashed border-zinc-100 last:border-0">
      <Text className="text-xs font-inter text-zinc-500">{label}</Text>
      <View className={`rounded-full px-2 py-0.5 ${ok ? "bg-green-100" : "bg-red-100"}`}>
        <Text className={`text-[10px] font-inter ${ok ? "text-green-700" : "text-red-600"}`} style={{ fontWeight: "700" }}>
          {ok ? "ĐẠT" : "KHÔNG ĐẠT"}
        </Text>
      </View>
    </View>
  );
}

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "Đang làm",
  COMPLETED: "Hoàn thành",
  ARCHIVED: "Lưu trữ",
};
const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: "#3B82F6",
  COMPLETED: "#22c55e",
  ARCHIVED: "#a1a1aa",
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [motor, setMotor] = useState<MotorCalculationResponse | null>(null);
  const [gear, setGear] = useState<GearCalculationResponse | null>(null);
  const [chain, setChain] = useState<ChainCalculationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [proj, mot, ge, ch] = await Promise.allSettled([
        projectService.getProject(id),
        motorCalculationService.get(id),
        gearCalculationService.get(id),
        chainCalculationService.get(id),
      ]);
      if (proj.status === "fulfilled") setProject(proj.value);
      else { setError("Không tải được dự án"); return; }
      if (mot.status === "fulfilled") setMotor(mot.value);
      if (ge.status === "fulfilled") setGear(ge.value);
      if (ch.status === "fulfilled") setChain(ch.value);
    } catch {
      setError("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0047AB" />
        <Text className="mt-3 text-sm font-inter text-zinc-500">Đang tải kết quả...</Text>
      </SafeAreaView>
    );
  }

  if (error || !project) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center px-5 gap-4">
        <Text className="text-center font-inter text-zinc-500">{error || "Không tìm thấy dự án"}</Text>
        <Pressable onPress={() => router.back()} className="px-4 py-2 rounded-xl bg-zinc-200">
          <Text className="font-inter text-zinc-700">Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLOR[project.status] ?? "#a1a1aa";

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 pt-5 pb-3">
        <Pressable onPress={() => router.back()} hitSlop={8} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#18181b" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-space-bold text-zinc-900" numberOfLines={1}>{project.name}</Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: statusColor + "20" }}>
              <Text className="text-xs font-inter" style={{ color: statusColor, fontWeight: "600" }}>
                {STATUS_LABEL[project.status] ?? project.status}
              </Text>
            </View>
            <Text className="text-xs font-inter text-zinc-400">
              {new Date(project.updatedAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── MODULE 1: ĐỘNG CƠ ──────────────────────────────────────────────── */}
        {motor ? (
          <SectionCard title="Module 1 — Chọn động cơ" icon="flash-outline" color="#1d4ed8">
            <Row label="Mã động cơ" value={motor.selectedMotor?.motorCode ?? `ID ${motor.selectedMotorId}`} />
            <Row label="Công suất động cơ (P_đc)" value={`${fmt(motor.selectedMotor?.power, 2)} kW`} />
            <Row label="Tốc độ (n_đc)" value={`${fmtInt(motor.selectedMotor?.speed)} v/p`} />
            <Row label="Công suất làm việc (P_lv)" value={`${fmt(motor.pWorking, 2)} kW`} />
            <Row label="Tốc độ làm việc (n_lv)" value={`${fmt(motor.nWorking, 0)} v/p`} />
            <Row label="Hiệu suất tổng (η)" value={fmt(motor.etaTotal, 5)} />
            <Row label="u_1 (cấp nhanh)" value={fmt(motor.u1, 3)} />
            <Row label="u_2 (cấp chậm)" value={fmt(motor.u2, 4)} />
            <Row label="u_x (xích)" value={fmt(motor.ux, 4)} />
            <Text className="text-[11px] font-inter text-zinc-400 mt-2 mb-1" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Ma trận động học</Text>
            <View className="overflow-hidden rounded-lg border border-zinc-200">
              <View className="flex-row bg-zinc-100">
                {["Trục", "ĐC", "I", "II", "III", "Lv"].map(h => (
                  <View key={h} className="flex-1 items-center py-1.5 border-r border-zinc-200 last:border-0">
                    <Text className="text-[10px] font-inter text-zinc-600" style={{ fontWeight: "700" }}>{h}</Text>
                  </View>
                ))}
              </View>
              {[
                ["P (kW)", motor.kinematicTable.motor.power, motor.kinematicTable.shaft1.power, motor.kinematicTable.shaft2.power, motor.kinematicTable.shaft3.power, motor.kinematicTable.workingShaft.power, 2],
                ["n (v/p)", motor.kinematicTable.motor.speed, motor.kinematicTable.shaft1.speed, motor.kinematicTable.shaft2.speed, motor.kinematicTable.shaft3.speed, motor.kinematicTable.workingShaft.speed, 0],
                ["T (N·mm)", motor.kinematicTable.motor.torque, motor.kinematicTable.shaft1.torque, motor.kinematicTable.shaft2.torque, motor.kinematicTable.shaft3.torque, motor.kinematicTable.workingShaft.torque, 0],
              ].map(([name, v0, v1, v2, v3, v4, dp]) => (
                <View key={name as string} className="flex-row border-t border-zinc-200">
                  <View className="flex-1 items-center py-1.5 border-r border-zinc-200 bg-zinc-50">
                    <Text className="text-[9px] font-inter text-zinc-500">{name as string}</Text>
                  </View>
                  {[v0, v1, v2, v3, v4].map((v, i) => (
                    <View key={i} className="flex-1 items-center py-1.5 border-r border-zinc-200 last:border-0">
                      <Text className="text-[10px] text-zinc-800" style={{ fontFamily: "monospace" }}>
                        {fmt(v as number, dp as number)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </SectionCard>
        ) : (
          <EmptyModule title="Module 1 — Chọn động cơ" icon="flash-outline" color="#1d4ed8" />
        )}

        {/* ── MODULE 3: BÁNH RĂNG ─────────────────────────────────────────────── */}
        {gear ? (
          <SectionCard title="Module 3 — Bộ truyền bánh răng" icon="settings-outline" color="#7c3aed">
            <Text className="text-[11px] font-inter text-zinc-400 mb-1" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Cấp nhanh — Bánh răng côn</Text>
            <Row label="Số răng bánh dẫn (z1)" value={fmtInt(gear.fastZ1)} />
            <Row label="Số răng bánh bị dẫn (z2)" value={fmtInt(gear.fastZ2)} />
            <Row label="Mô-đun ngoài (mte)" value={fmt(gear.fastMte, 3)} />
            <Row label="Mô-đun trung bình (mtm)" value={fmt(gear.fastMtm, 3)} />
            <Row label="Chiều dài côn ngoài (Re)" value={`${fmt(gear.fastRe, 2)} mm`} />
            <Row label="Chiều rộng vành răng (b)" value={`${fmt(gear.fastB, 2)} mm`} />
            <Row label="d_m1 / d_m2" value={`${fmt(gear.fastDm1, 2)} / ${fmt(gear.fastDm2, 2)} mm`} />
            <Row label="δ1 / δ2" value={`${fmt(gear.fastDelta1 * 180 / Math.PI, 2)}° / ${fmt(gear.fastDelta2 * 180 / Math.PI, 2)}°`} />
            <Row label="Lực vòng Ft1" value={`${fmt(gear.fastFt1, 1)} N`} />
            <Row label="Fr1 / Fa1" value={`${fmt(gear.fastFr1, 1)} / ${fmt(gear.fastFa1, 1)} N`} />
            <CheckRow label={`σH = ${fmt(gear.fastSigmaH, 1)} ≤ [σH] = ${fmt(gear.allowableSigmaH, 1)} MPa`} ok={gear.fastSigmaH <= gear.allowableSigmaH} />
            <CheckRow label={`σF1 = ${fmt(gear.fastSigmaF1, 1)} MPa`} ok={gear.fastSigmaF1 <= gear.allowableSigmaF} />
            <CheckRow label={`σF2 = ${fmt(gear.fastSigmaF2, 1)} MPa`} ok={gear.fastSigmaF2 <= gear.allowableSigmaF} />
            {gear.fastWarning ? (
              <Text className="text-xs font-inter text-amber-700 mt-1">{gear.fastWarning}</Text>
            ) : null}

            <View className="my-2 h-px bg-zinc-100" />
            <Text className="text-[11px] font-inter text-zinc-400 mb-1" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Cấp chậm — Bánh răng trụ</Text>
            <Row label="Số răng z1 / z2" value={`${fmtInt(gear.slowZ1)} / ${fmtInt(gear.slowZ2)}`} />
            <Row label="Mô-đun (m)" value={fmt(gear.slowM, 2)} />
            <Row label="Khoảng cách trục (aw)" value={`${fmt(gear.slowAw, 2)} mm`} />
            <Row label="Chiều rộng vành răng (bw)" value={`${fmt(gear.slowBw, 2)} mm`} />
            <Row label="dw1 / dw2" value={`${fmt(gear.slowDw1, 2)} / ${fmt(gear.slowDw2, 2)} mm`} />
            <Row label="da1 / da2" value={`${fmt(gear.slowDa1, 2)} / ${fmt(gear.slowDa2, 2)} mm`} />
            <Row label="df1 / df2" value={`${fmt(gear.slowDf1, 2)} / ${fmt(gear.slowDf2, 2)} mm`} />
            <Row label="Lực vòng Ft1" value={`${fmt(gear.slowFt1, 1)} N`} />
            <Row label="Fr1" value={`${fmt(gear.slowFr1, 1)} N`} />
            <CheckRow label={`σH = ${fmt(gear.slowSigmaH, 1)} MPa`} ok={gear.slowSigmaH <= gear.allowableSigmaH} />
            <CheckRow label={`σF1 = ${fmt(gear.slowSigmaF1, 1)} MPa`} ok={gear.slowSigmaF1 <= gear.allowableSigmaF} />
            <CheckRow label={`σF2 = ${fmt(gear.slowSigmaF2, 1)} MPa`} ok={gear.slowSigmaF2 <= gear.allowableSigmaF} />
            {gear.slowWarning ? (
              <Text className="text-xs font-inter text-amber-700 mt-1">{gear.slowWarning}</Text>
            ) : null}
          </SectionCard>
        ) : (
          <EmptyModule title="Module 3 — Bộ truyền bánh răng" icon="settings-outline" color="#7c3aed" />
        )}

        {/* ── MODULE 2: XÍCH ──────────────────────────────────────────────────── */}
        {chain ? (
          <SectionCard title="Module 2 — Bộ truyền xích" icon="link-outline" color="#059669">
            <Row label="Bước xích (p_c)" value={`${fmt(chain.pc, 2)} mm`} />
            <Row label="Số răng đĩa dẫn / bị dẫn" value={`${fmtInt(chain.z1)} / ${fmtInt(chain.z2)}`} />
            <Row label="d1 / d2" value={`${fmt(chain.d1, 2)} / ${fmt(chain.d2, 2)} mm`} />
            <Row label="da1 / da2" value={`${fmt(chain.da1, 2)} / ${fmt(chain.da2, 2)} mm`} />
            <Row label="Khoảng cách trục (a)" value={`${fmt(chain.a, 2)} mm`} />
            <Row label="Số mắt xích (X)" value={fmtInt(chain.x)} />
            <Row label="Chiều dài xích (L)" value={`${fmt(chain.chainLength, 1)} mm`} />
            <Row label="Công suất tính toán (Pt)" value={`${fmt(chain.pt, 4)} kW`} />
            <Row label="Công suất cho phép [P]" value={`${fmt(chain.allowablePower, 2)} kW`} />
            <CheckRow label={`Bước xích p_c ≤ [p_c]max = ${fmt(chain.pcMax, 2)} mm`} ok={chain.pc <= chain.pcMax} />
          </SectionCard>
        ) : (
          <EmptyModule title="Module 2 — Bộ truyền xích" icon="link-outline" color="#059669" />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyModule({ title, icon, color }: { title: string; icon: string; color: string }) {
  return (
    <View className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <View className="flex-row items-center gap-2 px-4 py-3 border-b border-zinc-100" style={{ backgroundColor: color + "10" }}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text className="text-sm font-inter" style={{ fontWeight: "700", color }}>{title}</Text>
      </View>
      <View className="px-4 py-5 items-center">
        <Text className="text-xs font-inter text-zinc-400">Chưa có dữ liệu lưu cho module này</Text>
      </View>
    </View>
  );
}
