import Button from "@/components/common/button";
import { db } from "@/db/client";
import { Motors_Dk } from "@/db/schema/motor_dk";
import {
  EFFICIENCY,
  PRELIMINARY_RATIO,
  calculateEtaTotal,
  calculateN_III_Step6,
  calculateN_II_Step6,
  calculateN_I_Step6,
  calculateNsb,
  calculateP_III_Step6,
  calculateP_II_Step6,
  calculateP_I_Step6,
  calculatePct,
  calculateTorqueStep6,
  calculateU1Step5,
  calculateU2Step5,
  calculateUhStep5,
  calculateUtStep5,
  selectMotorDkStep4,
  selectMotorDkStep4Top,
  type MotorDkRow,
} from "@/services/motor-dk-selection";
import { projectService, type ProjectResponse } from "@/services/api/project.service";
import { saveAllCalculations } from "@/services/api/save-project.service";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalNavigationState, type GearSummary, type ChainSummary } from "@/lib/globalState";

function fmt(n: number, digits: number) {
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
}

function fmtInt(n: number) {
  return Number.isFinite(n) ? Math.round(n).toString() : "—";
}

type MotorCalcSnapshot = {
  selectedMotorIndex: number;
  P_lv: number;
  n_lv: number;
  eta: number;
  P_ct: number;
  n_sb: number;
  motor: MotorDkRow;
  motorsTop2: MotorDkRow[];
  n_dc: number;
  P_dc: number;
  u_t: number;
  u_h: number;
  u_1: number;
  u_2: number;
  P_I: number;
  P_II: number;
  P_III: number;
  n_I: number;
  n_II: number;
  n_III: number;
  T_dc: number;
  T_I: number;
  T_II: number;
  T_III: number;
  T_lv: number;
};

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
        <View className="h-4 w-1 rounded-full bg-[#0a7ea4]" />
        <Text className="text-xs font-inter-black uppercase tracking-wider text-[#0a7ea4]">
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

function StepLine({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row flex-wrap items-baseline justify-between gap-4 border-b border-dashed border-zinc-100 py-1.5 last:border-b-0">
      <Text className="shrink text-xs font-inter text-zinc-600 leading-5">
        {label}
      </Text>
      <Text className="text-right text-[13px] font-inter text-zinc-900 leading-5" style={{ fontWeight: "500", fontFamily: "monospace" }}>
        {value}
      </Text>
    </View>
  );
}

function Badge({ ok, label }: { ok: boolean; label?: string }) {
  return (
    <View className={`rounded-full px-2 py-0.5 ${ok ? "bg-green-100" : "bg-red-100"}`}>
      <Text className={`text-[10px] font-inter ${ok ? "text-green-700" : "text-red-600"}`} style={{ fontWeight: "600" }}>
        {label ?? (ok ? "ĐẠT" : "KHÔNG ĐẠT")}
      </Text>
    </View>
  );
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1 border-b border-dashed border-zinc-100 last:border-0">
      <Text className="text-xs font-inter text-zinc-500">{label}</Text>
      <Text className="text-xs font-inter text-zinc-900" style={{ fontWeight: "600", fontFamily: "monospace" }}>{value}</Text>
    </View>
  );
}

function ResultsOverview({ snapshot }: { snapshot: MotorCalcSnapshot }) {
  const gear = globalNavigationState.gearResult as GearSummary | null;
  const chain = globalNavigationState.chainResult as ChainSummary | null;
  const [, forceRender] = React.useState(0);

  // ─── Save modal state ──────────────────────────────────────────────────────
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [useNewProject, setUseNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const openSaveModal = useCallback(async () => {
    setShowSaveModal(true);
    setSaveMsg(null);
    setSelectedProjectId(null);
    setUseNewProject(false);
    setNewProjectName("");
    setLoadingProjects(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      if (data.length === 0) setUseNewProject(true);
    } catch {
      setProjects([]);
      setUseNewProject(true);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      let projectId = selectedProjectId;

      if (useNewProject) {
        if (!newProjectName.trim()) {
          Alert.alert("Lỗi", "Nhập tên dự án mới.");
          return;
        }
        const created = await projectService.createProject({ name: newProjectName.trim() });
        projectId = created.id;
      }

      if (!projectId) {
        Alert.alert("Lỗi", "Chọn dự án hoặc tạo dự án mới.");
        return;
      }

      const result = await saveAllCalculations(
        projectId,
        snapshot,
        globalNavigationState.fullGearState,
        globalNavigationState.fullChainState,
      );

      if (result.errors.length > 0) {
        setSaveMsg({ ok: false, text: result.errors.join("\n") });
      } else {
        const modules: string[] = [];
        if (result.motor) modules.push("Động cơ");
        if (result.gear) modules.push("Bánh răng");
        if (result.chain) modules.push("Xích");
        setSaveMsg({ ok: true, text: `Đã lưu: ${modules.join(", ")}` });

        if (result.motor && result.gear && result.chain) {
          await projectService.updateProject(projectId, { name: useNewProject ? newProjectName.trim() : projects.find(p => p.id === projectId)?.name ?? "", status: "COMPLETED" }).catch(() => {});
        }
      }
    } catch (e: any) {
      setSaveMsg({ ok: false, text: e?.message ?? "Lỗi không xác định" });
    } finally {
      setSaving(false);
    }
  }, [selectedProjectId, useNewProject, newProjectName, snapshot, projects]);

  useFocusEffect(
    useCallback(() => {
      forceRender(n => n + 1);
    }, [])
  );

  const allOk =
    !!gear &&
    !!chain &&
    gear.isContactValid && gear.isBending1Valid && gear.isBending2Valid &&
    chain.isPcValid && chain.isStrengthValid && chain.isImpactValid;

  return (
    <View className="mt-6 border-t border-zinc-200 pt-5">
      {/* Tiêu đề */}
      <View className="flex-row items-center gap-2 mb-4">
        <Ionicons name="document-text-outline" size={20} color="#0a7ea4" />
        <Text className="text-[17px] font-inter-black text-zinc-900 tracking-tight">Tổng quan kết quả</Text>
        {allOk && (
          <View className="ml-auto rounded-full bg-green-100 px-2.5 py-0.5">
            <Text className="text-[11px] font-inter text-green-700" style={{ fontWeight: "700" }}>Tất cả đạt ✓</Text>
          </View>
        )}
      </View>

      <View className="gap-3">
        {/* MODULE 1: ĐỘNG CƠ */}
        <View className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <View className="flex-row items-center justify-between bg-blue-50 px-4 py-2.5 border-b border-blue-100">
            <View className="flex-row items-center gap-2">
              <Ionicons name="flash-outline" size={16} color="#1d4ed8" />
              <Text className="text-sm font-inter text-blue-800" style={{ fontWeight: "700" }}>Chọn động cơ</Text>
            </View>
            <View className="rounded-full bg-blue-100 px-2 py-0.5">
              <Text className="text-[11px] font-inter text-blue-700" style={{ fontWeight: "600" }}>{snapshot.motor.model}</Text>
            </View>
          </View>
          <View className="px-4 py-3 gap-0.5">
            <OverviewRow label="Công suất động cơ (P_đc)" value={`${fmt(snapshot.P_dc, 2)} kW`} />
            <OverviewRow label="Tốc độ động cơ (n_đc)" value={`${fmtInt(snapshot.n_dc)} v/p`} />
            <OverviewRow label="Tỷ số truyền chung (u_t)" value={fmt(snapshot.u_t, 3)} />
            <OverviewRow label="Tỷ số truyền HGT (u_h)" value={fmt(snapshot.u_h, 3)} />
            <OverviewRow label="Tỷ số truyền cấp nhanh (u_1)" value={fmt(snapshot.u_1, 3)} />
            <OverviewRow label="Tỷ số truyền cấp chậm (u_2)" value={fmt(snapshot.u_2, 4)} />
          </View>
        </View>

        {/* MODULE 2: BỘ TRUYỀN XÍCH */}
        <View className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <View className="flex-row items-center justify-between bg-emerald-50 px-4 py-2.5 border-b border-emerald-100">
            <View className="flex-row items-center gap-2">
              <Ionicons name="link-outline" size={16} color="#059669" />
              <Text className="text-sm font-inter text-emerald-800" style={{ fontWeight: "700" }}>Bộ truyền xích</Text>
            </View>
            {chain ? (
              <Badge ok={chain.isPcValid && chain.isStrengthValid && chain.isImpactValid} />
            ) : (
              <View className="rounded-full bg-zinc-100 px-2 py-0.5">
                <Text className="text-[10px] font-inter text-zinc-400">Chưa tính</Text>
              </View>
            )}
          </View>
          {chain ? (
            <View className="px-4 py-3 gap-0.5">
              <OverviewRow label="Bước xích (p_c)" value={`${fmt(chain.p_c, 2)} mm`} />
              <OverviewRow label="Số răng đĩa dẫn (z1)" value={fmtInt(chain.z1)} />
              <OverviewRow label="Số răng đĩa bị dẫn (z2)" value={fmtInt(chain.z2)} />
              <OverviewRow label="Đường kính chia d1" value={`${fmt(chain.d1, 2)} mm`} />
              <OverviewRow label="Đường kính chia d2" value={`${fmt(chain.d2, 2)} mm`} />
              <OverviewRow label="Khoảng cách trục (a)" value={`${fmt(chain.a, 2)} mm`} />
              <OverviewRow label="Số mắt xích (X)" value={fmtInt(chain.X)} />
              <View className="flex-row justify-between items-center pt-1">
                <Text className="text-xs font-inter text-zinc-500">Kiểm tra bền / va đập</Text>
                <View className="flex-row gap-1">
                  <Badge ok={chain.isStrengthValid} label="Bền" />
                  <Badge ok={chain.isImpactValid} label="Va đập" />
                </View>
              </View>
            </View>
          ) : (
            <View className="px-4 py-4 items-center">
              <Text className="text-xs font-inter text-zinc-400">Nhấn "Tính bộ truyền xích" để xem kết quả</Text>
            </View>
          )}
        </View>

        {/* MODULE 3: BÁNH RĂNG CÔN */}
        <View className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <View className="flex-row items-center justify-between bg-purple-50 px-4 py-2.5 border-b border-purple-100">
            <View className="flex-row items-center gap-2">
              <Ionicons name="settings-outline" size={16} color="#7c3aed" />
              <Text className="text-sm font-inter text-purple-800" style={{ fontWeight: "700" }}>Bộ truyền bánh răng côn</Text>
            </View>
            {gear ? (
              <Badge ok={gear.isContactValid && gear.isBending1Valid && gear.isBending2Valid} />
            ) : (
              <View className="rounded-full bg-zinc-100 px-2 py-0.5">
                <Text className="text-[10px] font-inter text-zinc-400">Chưa tính</Text>
              </View>
            )}
          </View>
          {gear ? (
            <View className="px-4 py-3 gap-0.5">
              <OverviewRow label="Số răng bánh dẫn (z1)" value={fmtInt(gear.z1)} />
              <OverviewRow label="Số răng bánh bị dẫn (z2)" value={fmtInt(gear.z2)} />
              <OverviewRow label="Chiều dài côn ngoài (Re)" value={`${fmt(gear.Re, 2)} mm`} />
              <OverviewRow label="Chiều rộng răng (b)" value={`${fmt(gear.b, 2)} mm`} />
              <OverviewRow label="Đường kính trung bình d_m1" value={`${fmt(gear.dm1, 2)} mm`} />
              <OverviewRow label="Đường kính trung bình d_m2" value={`${fmt(gear.dm2, 2)} mm`} />
              <View className="flex-row justify-between items-center pt-1">
                <Text className="text-xs font-inter text-zinc-500">Kiểm tra tiếp xúc / uốn</Text>
                <View className="flex-row gap-1">
                  <Badge ok={gear.isContactValid} label="Tiếp xúc" />
                  <Badge ok={gear.isBending1Valid && gear.isBending2Valid} label="Uốn" />
                </View>
              </View>
            </View>
          ) : (
            <View className="px-4 py-4 items-center">
              <Text className="text-xs font-inter text-zinc-400">Nhấn "Tính bộ truyền bánh răng" để xem kết quả</Text>
            </View>
          )}
        </View>
      </View>

      {/* 2 NÚT */}
      <View className="mt-5 gap-3">
        <Button
          title="Quản lý dự án"
          variant="outline"
          icon="folder-open-outline"
          onPress={() => router.push("/(tabs)/project")}
        />
        <Button
          title="Lưu vào dự án"
          variant="primary"
          icon="cloud-upload-outline"
          onPress={openSaveModal}
        />
      </View>

      {/* ── SAVE MODAL ──────────────────────────────────────────────────────── */}
      <Modal visible={showSaveModal} transparent animationType="slide" onRequestClose={() => setShowSaveModal(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => { if (!saving) setShowSaveModal(false); }}>
          <Pressable className="rounded-t-3xl bg-white px-5 pt-6 pb-10" onPress={e => e.stopPropagation()}>

            {/* Tiêu đề */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-space-bold text-zinc-900">Lưu vào dự án</Text>
              <Pressable onPress={() => { if (!saving) setShowSaveModal(false); }} hitSlop={8}>
                <Ionicons name="close-outline" size={24} color="#71717a" />
              </Pressable>
            </View>

            {/* Tóm tắt module */}
            <View className="mb-4 rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-3 gap-1.5">
              <Text className="text-xs font-inter text-zinc-500 mb-1" style={{ fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Dữ liệu sẽ lưu</Text>
              <ModuleBadge label="Module 1 — Động cơ" ready={true} />
              <ModuleBadge label="Module 3 — Bánh răng côn" ready={!!globalNavigationState.fullGearState} hint="Chưa tính hoặc chưa nhấn Trở về" />
              <ModuleBadge label="Module 2 — Xích" ready={!!globalNavigationState.fullChainState} hint="Chưa tính hoặc chưa nhấn Trở về" />
            </View>

            {/* Danh sách dự án */}
            {loadingProjects ? (
              <View className="items-center py-4">
                <ActivityIndicator color="#0047AB" />
              </View>
            ) : (
              <>
                {projects.length > 0 && (
                  <View className="mb-3">
                    <Text className="text-xs font-inter text-zinc-500 mb-2" style={{ fontWeight: "600" }}>Chọn dự án hiện có</Text>
                    <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                      {projects.map(p => {
                        const selected = !useNewProject && selectedProjectId === p.id;
                        return (
                          <Pressable
                            key={p.id}
                            onPress={() => { setSelectedProjectId(p.id); setUseNewProject(false); }}
                            className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 mb-2 ${selected ? "border-[#0047AB] bg-blue-50" : "border-zinc-200 bg-white"}`}
                          >
                            <View className={`h-5 w-5 rounded-full border items-center justify-center ${selected ? "border-[#0047AB] bg-[#0047AB]" : "border-zinc-300"}`}>
                              {selected && <View className="h-2 w-2 rounded-full bg-white" />}
                            </View>
                            <View className="flex-1">
                              <Text className={`text-sm font-inter ${selected ? "text-[#0047AB]" : "text-zinc-800"}`} style={{ fontWeight: "600" }} numberOfLines={1}>{p.name}</Text>
                              {p.description ? <Text className="text-xs font-inter text-zinc-400" numberOfLines={1}>{p.description}</Text> : null}
                            </View>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Tạo dự án mới */}
                <Pressable
                  onPress={() => { setUseNewProject(v => !v); setSelectedProjectId(null); }}
                  className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 mb-3 ${useNewProject ? "border-[#0047AB] bg-blue-50" : "border-zinc-200 bg-white"}`}
                >
                  <View className={`h-5 w-5 rounded-full border items-center justify-center ${useNewProject ? "border-[#0047AB] bg-[#0047AB]" : "border-zinc-300"}`}>
                    {useNewProject ? <View className="h-2 w-2 rounded-full bg-white" /> : <Ionicons name="add" size={12} color="#71717a" />}
                  </View>
                  <Text className={`text-sm font-inter ${useNewProject ? "text-[#0047AB]" : "text-zinc-700"}`} style={{ fontWeight: "600" }}>Tạo dự án mới</Text>
                </Pressable>

                {useNewProject && (
                  <View className="mb-3">
                    <View className="h-12 flex-row items-center rounded-xl border border-zinc-300 bg-zinc-50 px-4">
                      <TextInput
                        className="flex-1 font-inter text-[15px] text-zinc-900"
                        placeholder="Tên dự án"
                        placeholderTextColor="#a1a1aa"
                        value={newProjectName}
                        onChangeText={setNewProjectName}
                      />
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Kết quả lưu */}
            {saveMsg && (
              <View className={`mb-3 rounded-xl border px-4 py-3 ${saveMsg.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <Text className={`text-sm font-inter ${saveMsg.ok ? "text-green-800" : "text-red-700"}`} style={{ fontWeight: "500" }}>{saveMsg.text}</Text>
              </View>
            )}

            {/* Nút lưu */}
            <Button
              title={saving ? "Đang lưu..." : "Lưu"}
              variant="primary"
              icon={saving ? undefined : "cloud-upload-outline"}
              onPress={handleSave}
              disabled={saving || loadingProjects || (!selectedProjectId && (!useNewProject || !newProjectName.trim()))}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ModuleBadge({ label, ready, hint }: { label: string; ready: boolean; hint?: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name={ready ? "checkmark-circle" : "ellipse-outline"} size={16} color={ready ? "#22c55e" : "#a1a1aa"} />
      <Text className={`text-sm font-inter ${ready ? "text-zinc-800" : "text-zinc-400"}`} style={{ fontWeight: ready ? "500" : "400" }}>
        {label}{!ready && hint ? ` — ${hint}` : ""}
      </Text>
    </View>
  );
}

export default function MotorScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const savedMotorState = globalNavigationState.motorScreenState;

  useFocusEffect(
    useCallback(() => {
      if (globalNavigationState.scrollToPrint) {
        globalNavigationState.scrollToPrint = false;
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    }, [])
  );

  const [powerKw, setPowerKw] = useState(savedMotorState?.powerKw ?? "");
  const [nlvRpm, setNlvRpm] = useState(savedMotorState?.nlvRpm ?? "");
  const [isShow, setIsShow] = useState(savedMotorState?.isShow ?? false);
  const [catalog, setCatalog] = useState<MotorDkRow[]>([]);
  const [snapshot, setSnapshot] = useState<MotorCalcSnapshot | null>(
    (savedMotorState?.snapshot as MotorCalcSnapshot | null) ?? null
  );
  const [calcError, setCalcError] = useState<string | null>(savedMotorState?.calcError ?? null);

  useEffect(() => {
    const rows = db.select().from(Motors_Dk).all();
    setCatalog(rows);
  }, []);

  useEffect(() => {
    globalNavigationState.motorScreenState = {
      powerKw,
      nlvRpm,
      isShow,
      snapshot,
      calcError,
    };
  }, [powerKw, nlvRpm, isShow, snapshot, calcError]);

  const handleReset = useCallback(() => {
    setPowerKw("");
    setNlvRpm("");
    setIsShow(false);
    setSnapshot(null);
    setCalcError(null);
    globalNavigationState.motorScreenState = null;
    globalNavigationState.gearResult = null;
    globalNavigationState.chainResult = null;
    globalNavigationState.fullGearState = null;
    globalNavigationState.fullChainState = null;
  }, []);

  const recalculateDetailed = useCallback((base: any, motorIndex: number) => {
    const motor = base.motorsTop2[motorIndex];
    if (!motor) return;

    const n_dc = motor.speedRpm;
    const P_dc = motor.powerKw;

    const u_t = calculateUtStep5(n_dc, base.n_lv);
    const u_h = calculateUhStep5(u_t);
    const u_1 = calculateU1Step5(u_h);
    const u_2 = calculateU2Step5(u_h, u_1);

    if (![u_t, u_h, u_1, u_2].every(Number.isFinite)) {
      setCalcError("Bước 5: tỷ số truyền không hợp lệ (kiểm tra n_lv, u_1).");
      return;
    }

    const P_III = calculateP_III_Step6(base.P_lv);
    const P_II = calculateP_II_Step6(P_III);
    const P_I = calculateP_I_Step6(P_II);

    const n_I = calculateN_I_Step6(n_dc);
    const n_II = calculateN_II_Step6(n_I, u_1);
    const n_III = calculateN_III_Step6(n_II, u_2);

    const T_dc = calculateTorqueStep6(P_dc, n_dc);
    const T_I = calculateTorqueStep6(P_I, n_I);
    const T_II = calculateTorqueStep6(P_II, n_II);
    const T_III = calculateTorqueStep6(P_III, n_III);
    const T_lv = calculateTorqueStep6(base.P_lv, base.n_lv);

    setSnapshot({
      ...base,
      selectedMotorIndex: motorIndex,
      motor,
      n_dc, P_dc,
      u_t, u_h, u_1, u_2,
      P_I, P_II, P_III,
      n_I, n_II, n_III,
      T_dc, T_I, T_II, T_III, T_lv,
    });
  }, []);

  const runCalculation = useCallback(() => {
    setCalcError(null);
    setSnapshot(null);

    const P_lv = parseFloat(powerKw.replace(",", "."));
    const n_lv = parseFloat(nlvRpm.replace(",", "."));
    if (!Number.isFinite(P_lv) || P_lv <= 0) {
      setCalcError("Nhập P_lv (kW) là số dương.");
      return;
    }
    if (!Number.isFinite(n_lv) || n_lv <= 0) {
      setCalcError("Nhập n_lv (vòng/phút) là số dương.");
      return;
    }
    if (catalog.length === 0) {
      setCalcError("Chưa có dữ liệu motors_dk trong cơ sở dữ liệu.");
      return;
    }

    const eta = calculateEtaTotal();
    const P_ct = calculatePct(P_lv, eta);
    const n_sb = calculateNsb(n_lv);

    const motor = selectMotorDkStep4(catalog, P_ct, n_sb);
    if (!motor) {
      setCalcError(`Không có động cơ thỏa P_đc ≥ ${fmt(P_ct, 4)} kW.`);
      return;
    }
    const motorsTop2 = selectMotorDkStep4Top(catalog, P_ct, n_sb, 5);

    const base = {
      P_lv, n_lv, eta, P_ct, n_sb, motorsTop2
    };

    recalculateDetailed(base, 0);
  }, [powerKw, nlvRpm, catalog, recalculateDetailed]);

  const s = snapshot;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerClassName="px-5 pt-5 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm">
          <View className="flex-row items-center justify-between border-b border-zinc-100 pb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="options-outline" size={20} color="#52525b" />
              <Text className="text-base font-inter-black text-zinc-900">Thông số đầu vào</Text>
            </View>
            <Pressable
              onPress={handleReset}
              hitSlop={8}
              className="flex-row items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5"
            >
              <Ionicons name="refresh-outline" size={15} color="#71717a" />
              <Text className="text-[13px] font-inter text-zinc-500">Đặt lại</Text>
            </Pressable>
          </View>
          <Text className="mt-3 text-[13px] font-inter text-zinc-500 leading-5">
            Nhập nhanh các giá trị cơ bản của hệ thống để tiến hành tính toán.
          </Text>

          <View className="mt-5 flex-row gap-4">
            <View className="flex-1">
              <Text className="mb-2 text-[13px] font-inter text-zinc-700" style={{ fontWeight: "600" }}>
                P làm việc <Text className="font-normal text-zinc-400 font-inter">(kW)</Text>
              </Text>
              <View className="h-[46px] flex-row items-center overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 px-3 focus-within:border-[#0a7ea4] focus-within:bg-white">
                <TextInput
                  value={powerKw}
                  onChangeText={setPowerKw}
                  placeholder="VD: 7.5"
                  keyboardType="decimal-pad"
                  className="flex-1 text-[15px] font-inter text-zinc-900"
                />
              </View>
            </View>

            <View className="flex-1">
              <Text className="mb-2 text-[13px] font-inter text-zinc-700" style={{ fontWeight: "600" }}>
                n làm việc <Text className="font-normal text-zinc-400 font-inter">(v/ph)</Text>
              </Text>
              <View className="h-[46px] flex-row items-center overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 px-3 focus-within:border-[#0a7ea4] focus-within:bg-white">
                <TextInput
                  value={nlvRpm}
                  onChangeText={setNlvRpm}
                  placeholder="VD: 75"
                  keyboardType="number-pad"
                  className="flex-1 text-[15px] font-inter text-zinc-900"
                />
              </View>
            </View>
          </View>

          <View className="mt-6">
            <Button
              title="Thực hiện tính toán"
              variant="primary"
              icon="calculator"
              onPress={runCalculation}
            />
          </View>
        </View>

        {calcError ? (
          <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 shadow-sm">
            <Ionicons name="warning-outline" size={20} color="#dc2626" />
            <Text className="flex-1 text-sm font-inter text-red-800 leading-5" style={{ fontWeight: "500" }}>{calcError}</Text>
          </View>
        ) : null}

        {s ? (
          <View className="mt-5 rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm">
            <View className="flex-row items-center justify-between border-b border-zinc-100 pb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="analytics-outline" size={20} color="#10b981" />
                <Text className="text-base font-inter-black text-zinc-900">Chi tiết quy trình tính</Text>
              </View>
              <View className="rounded-full bg-emerald-50 px-2.5 py-1 flex-row items-center gap-1 border border-emerald-100">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <Text className="text-[10px] uppercase tracking-wide font-inter-black text-emerald-700">Module 1</Text>
              </View>
            </View>

            <StepCard step="Bước 1" title="Hiệu suất truyền động tổng η">
              <StepLine
                label="η = η_nt · η_brc · η_brt · η_x · η_ol³"
                value={fmt(s.eta, 5)}
              />
            </StepCard>

            <StepCard step="Bước 2" title="Công suất cần thiết trên trục động cơ">
              <StepLine label="P_ct = P_lv / η" value={`${fmt(s.P_ct, 4)} kW`} />
              <StepLine label="P_lv" value={`${fmt(s.P_lv, 4)} kW`} />
            </StepCard>

            <StepCard step="Bước 3" title="Số vòng quay sơ bộ n_sb">
              <StepLine
                label={`n_sb = ${PRELIMINARY_RATIO.U_TOTAL} · n_lv`}
                value={`${fmtInt(s.n_sb)} v/ph`}
              />
            </StepCard>

            <StepCard step="Bước 4" title="Chọn động cơ (tra mã motors_dk)">
              <View className="rounded-lg bg-zinc-50 p-2.5 border border-zinc-100 mb-3">
                <Text className="text-xs font-inter text-zinc-600 text-center">
                  Điều kiện: <Text style={{ fontWeight: "600", color: "#18181b" }}>P_đc ≥ P_ct</Text> ({fmt(s.P_ct, 4)} kW) ; <Text style={{ fontWeight: "600", color: "#18181b" }}>n_đb ≈ n_sb</Text> ({fmtInt(s.n_sb)})
                </Text>
              </View>

              <Text className="text-xs font-inter-semibold text-zinc-700 mb-2">Lựa chọn cấu hình</Text>
              <View className="gap-2.5 mb-1">
                {s.motorsTop2.map((m, index) => {
                  const isSelected = s.selectedMotorIndex === index;
                  return (
                    <Pressable
                      key={m.id || index}
                      onPress={() => recalculateDetailed(s, index)}
                      className={`flex-row items-center justify-between rounded-xl border p-3 transition-colors ${isSelected
                        ? "border-[#0a7ea4] bg-blue-50/50"
                        : "border-zinc-200 bg-white"
                        }`}
                    >
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-2 mb-1.5 flex-wrap">
                          <Text className={`text-sm font-inter-black ${isSelected ? "text-[#0a7ea4]" : "text-zinc-900"}`}>
                            {m.model}
                          </Text>
                          {index === 0 && (
                            <View className="rounded bg-amber-100 px-1.5 py-0.5 border border-amber-200">
                              <Text className="text-[9px] font-space-bold text-amber-700 uppercase tracking-wider">Khuyên dùng</Text>
                            </View>
                          )}
                        </View>
                        <View className="flex-row items-center gap-1">
                          <View className="flex-row items-center bg-white border border-zinc-200 rounded px-1.5 py-0.5">
                            <Text className="text-[10px] font-inter text-zinc-500">P:</Text>
                            <Text className="ml-1 text-[11px] font-inter-mono font-semibold text-zinc-800">{fmt(m.powerKw, 2)} kW</Text>
                          </View>
                          <View className="flex-row items-center bg-white border border-zinc-200 rounded px-1.5 py-0.5">
                            <Text className="text-[10px] font-inter text-zinc-500">n:</Text>
                            <Text className="ml-1 text-[11px] font-inter-mono font-semibold text-zinc-800">{fmtInt(m.speedRpm)} v/p</Text>
                          </View>
                        </View>
                      </View>

                      <View className={`h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-[#0a7ea4] bg-[#0a7ea4]" : "border-zinc-300 bg-zinc-50"}`}>
                        {isSelected && <View className="h-2 w-2 rounded-full bg-white" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </StepCard>

            <StepCard step="Bước 5" title="Phân phối tỷ số truyền">
              <StepLine label="Tỉ số chung (u_t = n_đc / n_lv)" value={fmt(s.u_t, 4)} />
              <StepLine label="Tỉ số hộp giảm tốc (u_h = u_t / u_x)" value={fmt(s.u_h, 4)} />
              <StepLine label="Cấp nhanh (u_1 = 0,24·u_h)" value={fmt(s.u_1, 1)} />
              <StepLine label="Cấp chậm (u_2 = u_h / u_1)" value={fmt(s.u_2, 4)} />
            </StepCard>

            <StepCard step="Bước 6" title="Thông số động lực học & Động học">
              <View className="mt-1 mb-2 bg-zinc-100 h-px w-full" />
              <Text className="mb-1 text-[11px] font-inter uppercase tracking-widest text-zinc-500" style={{ fontWeight: "600" }}>Công suất P (kW)</Text>
              <StepLine label="Trục III (P_III = P_lv/η)" value={fmt(s.P_III, 4)} />
              <StepLine label="Trục II (P_II = P_III/η)" value={fmt(s.P_II, 4)} />
              <StepLine label="Trục I (P_I = P_II/η)" value={fmt(s.P_I, 4)} />

              <View className="my-2 bg-zinc-100 h-[1px] w-full" />
              <Text className="mb-1 text-[11px] font-inter uppercase tracking-widest text-zinc-500" style={{ fontWeight: "600" }}>Tốc độ n (vòng/phút)</Text>
              <StepLine label="Trục I (n_I = n_đc/u_nt)" value={fmt(s.n_I, 2)} />
              <StepLine label="Trục II (n_II = n_I/u_1)" value={fmt(s.n_II, 2)} />
              <StepLine label="Trục III (n_III = n_II/u_2)" value={fmt(s.n_III, 2)} />

              <View className="my-2 bg-zinc-100 h-[1px] w-full" />
              <Text className="mb-1 text-[11px] font-inter uppercase tracking-widest text-zinc-500" style={{ fontWeight: "600" }}>Mô-men T (N·mm)</Text>
              <StepLine label="T_động cơ" value={fmt(s.T_dc, 0)} />
              <StepLine label="Trục I" value={fmt(s.T_I, 0)} />
              <StepLine label="Trục II" value={fmt(s.T_II, 0)} />
              <StepLine label="Trục III" value={fmt(s.T_III, 0)} />
              <StepLine label="T_làm việc" value={fmt(s.T_lv, 0)} />
            </StepCard>

            {/* BẢNG TỔNG HỢP (GRID TABLE) */}
            <View className="mt-8 mb-2">
              <View className="flex-row items-center gap-2 mb-3">
                <Ionicons name="grid-outline" size={18} color="#0a7ea4" />
                <Text className="text-[17px] font-inter-black text-zinc-900 tracking-tight">Bảng Tổng Hợp Thông Số</Text>
              </View>

              <View className="overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm">
                {/* Header Hành */}
                <View className="flex-row bg-[#f8fafc] border-b border-zinc-300">
                  <View className="flex-[1.5] justify-center px-3 py-2.5 border-r border-zinc-200">
                    <Text className="text-[11px] font-inter text-slate-500 uppercase tracking-widest" style={{ fontWeight: "600" }}>Trục</Text>
                  </View>
                  <View className="flex-1 justify-center items-center py-2.5 border-r border-zinc-200">
                    <Text className="text-[12px] font-inter-black text-slate-700">ĐC</Text>
                  </View>
                  <View className="flex-1 justify-center items-center py-2.5 border-r border-zinc-200">
                    <Text className="text-[12px] font-inter-black text-slate-700">I</Text>
                  </View>
                  <View className="flex-1 justify-center items-center py-2.5 border-r border-zinc-200">
                    <Text className="text-[12px] font-inter-black text-slate-700">II</Text>
                  </View>
                  <View className="flex-1 justify-center items-center py-2.5 border-r border-zinc-200">
                    <Text className="text-[12px] font-inter-black text-slate-700">III</Text>
                  </View>
                  <View className="flex-1 justify-center items-center py-2.5 bg-indigo-50/50">
                    <Text className="text-[12px] font-inter-black text-indigo-700">Lv</Text>
                  </View>
                </View>

                {/* Rows */}
                {(
                  [
                    ["P", "(kW)", s.P_dc, s.P_I, s.P_II, s.P_III, s.P_lv],
                    ["n", "(v/p)", s.n_dc, s.n_I, s.n_II, s.n_III, s.n_lv],
                    ["T", "(N·mm)", s.T_dc, s.T_I, s.T_II, s.T_III, s.T_lv],
                    ["u", "", NaN, s.n_dc / s.n_I, s.u_1, s.u_2, s.n_III / s.n_lv],
                  ] as const
                ).map(([name, unit, v0, v1, v2, v3, v4], index) => {
                  const isLast = index === 3;
                  const isT = name === "T";
                  const isN = name === "n";
                  const places = isT ? 0 : isN ? 1 : 2;

                  return (
                    <View key={name} className={`flex-row bg-white ${!isLast ? 'border-b border-zinc-200' : ''}`}>
                      {/* Cột Tên (Label) */}
                      <View className="flex-[1.5] flex-row items-baseline gap-1 justify-start px-3 py-3 border-r border-zinc-200 bg-slate-50/30">
                        <Text className="text-[13px] font-inter-black text-zinc-800">{name}</Text>
                        <Text className="text-[10px] font-inter text-zinc-500 mt-0.5">{unit}</Text>
                      </View>

                      {/* Các Cột Dữ Liệu */}
                      <View className="flex-1 justify-center items-center py-3 border-r border-zinc-200">
                        <Text className="text-[12px] text-zinc-800" style={{ fontFamily: "monospace", fontWeight: "600" }}>{fmt(v0, places)}</Text>
                      </View>
                      <View className="flex-1 justify-center items-center py-3 border-r border-zinc-200">
                        <Text className="text-[12px] text-zinc-800" style={{ fontFamily: "monospace", fontWeight: "600" }}>{fmt(v1, places)}</Text>
                      </View>
                      <View className="flex-1 justify-center items-center py-3 border-r border-zinc-200">
                        <Text className="text-[12px] text-zinc-800" style={{ fontFamily: "monospace", fontWeight: "600" }}>{fmt(v2, places)}</Text>
                      </View>
                      <View className="flex-1 justify-center items-center py-3 border-r border-zinc-200">
                        <Text className="text-[12px] text-zinc-800" style={{ fontFamily: "monospace", fontWeight: "600" }}>{fmt(v3, places)}</Text>
                      </View>
                      <View className="flex-1 justify-center items-center py-3 bg-indigo-50/30">
                        <Text className="text-[12px] text-indigo-900" style={{ fontFamily: "monospace", fontWeight: "700" }}>{fmt(v4, places)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* THÔNG SỐ CHI TIẾT 2 ĐỘNG CƠ */}
            <View className="mt-8 mb-4">
              <View className="flex-row items-center gap-2 mb-3">
                <Ionicons name="list-outline" size={18} color="#0a7ea4" />
                <Text className="text-[17px] font-inter-black text-zinc-900 tracking-tight">Chi Tiết Thông Số Động Cơ</Text>
              </View>

              <View className="gap-4">
                {s.motorsTop2.map((m, idx) => (
                  <View key={m.id || idx} className={`rounded-xl border ${idx === s.selectedMotorIndex ? 'border-[#0a7ea4] shadow-md shadow-blue-500/10' : 'border-zinc-200 shadow-sm'} bg-white overflow-hidden`}>
                    <View className={`${idx === s.selectedMotorIndex ? 'bg-blue-50/50 border-blue-100' : 'bg-zinc-50 border-zinc-200'} border-b px-4 py-3 flex-row items-center justify-between`}>
                      <Text className={`text-[14px] font-inter-black ${idx === s.selectedMotorIndex ? 'text-[#0a7ea4]' : 'text-zinc-700'}`}>
                        {m.model} {idx === s.selectedMotorIndex ? "(Đang chọn)" : ""}
                      </Text>
                      {idx === 0 && (
                        <View className="rounded bg-amber-100 px-1.5 py-0.5 border border-amber-200">
                          <Text className="text-[9px] font-space-bold text-amber-700 uppercase tracking-wider">Top 1</Text>
                        </View>
                      )}
                    </View>
                    <View className="px-4 pt-3 pb-1 flex-row flex-wrap">
                      <View className="w-1/2 mb-3 pr-2">
                        <Text className="text-[11px] font-inter text-zinc-500 mb-0.5">Công suất (P_đc)</Text>
                        <Text className="text-[13px] font-inter-mono text-zinc-900" style={{ fontWeight: "600" }}>{fmt(m.powerKw, 2)} kW</Text>
                      </View>
                      <View className="w-1/2 mb-3 pl-2">
                        <Text className="text-[11px] font-inter text-zinc-500 mb-0.5">Vận tốc (n_đc)</Text>
                        <Text className="text-[13px] font-inter-mono text-zinc-900" style={{ fontWeight: "600" }}>{fmtInt(m.speedRpm)} v/p</Text>
                      </View>
                      <View className="w-1/2 mb-3 pr-2">
                        <Text className="text-[11px] font-inter text-zinc-500 mb-0.5">Cos φ</Text>
                        <Text className="text-[13px] font-inter-mono text-zinc-900" style={{ fontWeight: "600" }}>{fmt(m.cosPhi, 2)}</Text>
                      </View>
                      <View className="w-1/2 mb-3 pl-2">
                        <Text className="text-[11px] font-inter text-zinc-500 mb-0.5">T_k / T_dn</Text>
                        <Text className="text-[13px] font-inter-mono text-zinc-900" style={{ fontWeight: "600" }}>{fmt(m.startingTorqueRatio, 1)}</Text>
                      </View>
                      <View className="w-1/2 mb-3 pr-2">
                        <Text className="text-[11px] font-inter text-zinc-500 mb-0.5">T_max / T_dn</Text>
                        <Text className="text-[13px] font-inter-mono text-zinc-900" style={{ fontWeight: "600" }}>{fmt(m.maxTorqueRatio, 1)}</Text>
                      </View>
                      <View className="w-1/2 mb-3 pl-2">
                        <Text className="text-[11px] font-inter text-zinc-500 mb-0.5">Khối lượng</Text>
                        <Text className="text-[13px] font-inter-mono text-zinc-900" style={{ fontWeight: "600" }}>{fmt(m.weightKg, 1)} kg</Text>
                      </View>
                      <View className="w-1/2 mb-3 pr-2">
                        <Text className="text-[11px] font-inter text-zinc-500 mb-0.5">Mô-men quán tính (GD²)</Text>
                        <Text className="text-[13px] font-inter-mono text-zinc-900" style={{ fontWeight: "600" }}>{m.rotorInertiaGd2 ? fmt(m.rotorInertiaGd2, 4) : "—"}</Text>
                      </View>
                      <View className="w-1/2 mb-3 pl-2">
                        <Text className="text-[11px] font-inter text-zinc-500 mb-0.5">Vận tốc đồng bộ</Text>
                        <Text className="text-[13px] font-inter-mono text-zinc-900" style={{ fontWeight: "600" }}>{m.syncSpeedRpm} v/p</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        <View className="mt-5 mb-8">
          <Pressable
            onPress={() => { setIsShow(!isShow) }}
            className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 transition-colors ${isShow ? 'bg-zinc-100 border-zinc-200' : 'bg-white border-zinc-200 shadow-sm'}`}
          >
            <View className="flex-row items-center gap-3">
              <View className="rounded-full bg-zinc-100 p-1.5">
                <Ionicons name="settings-outline" size={18} color="#52525b" />
              </View>
              <Text className="text-[14px] font-inter text-zinc-800" style={{ fontWeight: "600" }}>Các thông số hệ số mặc định</Text>
            </View>
            <Ionicons name={isShow ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#71717a" />
          </Pressable>

          {isShow ? (
            <View className="mt-3 rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm">
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-4 w-1 rounded-full bg-[#f59e0b]" />
                <Text className="text-[14px] font-inter-black text-zinc-900">Hiệu suất định mức (η)</Text>
              </View>

              <View className="rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden">
                <View className="flex-row items-center border-b border-zinc-100">
                  <View className="flex-1 flex-row items-center justify-between border-r border-zinc-100 p-3">
                    <Text className="text-[13px] font-inter text-zinc-600">Khớp nối (η_nt)</Text>
                    <Text className="text-[13px] font-inter text-zinc-900" style={{ fontWeight: "600" }}>{EFFICIENCY.NT}</Text>
                  </View>
                  <View className="flex-1 flex-row items-center justify-between p-3">
                    <Text className="text-[13px] font-inter text-zinc-600">Ổ lăn (η_ol)</Text>
                    <Text className="text-[13px] font-inter text-zinc-900" style={{ fontWeight: "600" }}>{EFFICIENCY.OL}</Text>
                  </View>
                </View>

                <View className="flex-row items-center border-b border-zinc-100">
                  <View className="flex-1 flex-row items-center justify-between border-r border-zinc-100 p-3 bg-white">
                    <Text className="text-[13px] font-inter text-zinc-600">Bánh răng (η_brt)</Text>
                    <Text className="text-[13px] font-inter text-zinc-900" style={{ fontWeight: "600" }}>{EFFICIENCY.BRT}</Text>
                  </View>
                  <View className="flex-1 flex-row items-center justify-between p-3 bg-white">
                    <Text className="text-[13px] font-inter text-zinc-600">Xích (η_x)</Text>
                    <Text className="text-[13px] font-inter text-zinc-900" style={{ fontWeight: "600" }}>{EFFICIENCY.X}</Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="flex-[0.5] flex-row items-center justify-between p-3">
                    <Text className="text-[13px] font-inter text-zinc-600">Bánh răng nón (η_brc)</Text>
                    <Text className="text-[13px] font-inter text-zinc-900" style={{ fontWeight: "600" }}>{EFFICIENCY.BRC}</Text>
                  </View>
                </View>
              </View>

              <View className="mt-6 mb-4 flex-row items-center gap-2">
                <View className="h-4 w-1 rounded-full bg-[#8b5cf6]" />
                <Text className="text-[14px] font-inter-black text-zinc-900">Tỷ số truyền sơ bộ dự kiến</Text>
              </View>

              <View className="rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden">
                <View className="flex-row items-center border-b border-zinc-100">
                  <View className="flex-1 flex-row items-center justify-between border-r border-zinc-100 p-3">
                    <Text className="text-[13px] font-inter text-zinc-600">Xích (u_x)</Text>
                    <Text className="text-[13px] font-inter text-zinc-900" style={{ fontWeight: "600" }}>{PRELIMINARY_RATIO.UX}</Text>
                  </View>
                  <View className="flex-1 flex-row items-center justify-between p-3">
                    <Text className="text-[13px] font-inter text-zinc-600">Nối trục (u_nt)</Text>
                    <Text className="text-[13px] font-inter text-zinc-900" style={{ fontWeight: "600" }}>{PRELIMINARY_RATIO.UNT}</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="flex-1 flex-row items-center justify-between border-r border-zinc-100 p-3 bg-white">
                    <Text className="text-[13px] font-inter text-zinc-600">Hộp giảm tốc</Text>
                    <Text className="text-[13px] font-inter text-zinc-900" style={{ fontWeight: "600" }}>{PRELIMINARY_RATIO.UHGT}</Text>
                  </View>
                  <View className="flex-1 flex-row items-center justify-between p-3 bg-white">
                    <Text className="text-[13px] font-inter text-zinc-600">Tổng (u_total)</Text>
                    <Text className="text-[13px] font-inter-black text-primary-DEFAULT">{PRELIMINARY_RATIO.U_TOTAL}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {s ? (
          <View className="mt-4 mb-6">
            <View className="flex-row items-center gap-2 mb-3 mt-4 border-b border-zinc-100 pb-2">
              <Ionicons name="arrow-forward-circle-outline" size={20} color="#0a7ea4" />
              <Text className="text-[17px] font-inter-black text-zinc-900 tracking-tight">Bước tiếp theo</Text>
            </View>
            <View className="gap-3 mb-4">
              <Button
                title="Tính bộ truyền bánh răng"
                variant="primary"
                icon="cog"
                onPress={() => {
                  router.push({
                    pathname: "/gear",
                    params: {
                      t: s.T_I.toFixed(2),
                      n: s.n_I.toFixed(2),
                      u: s.u_1.toFixed(4),
                      chainP: s.P_III.toFixed(4),
                      chainN: s.n_III.toFixed(2),
                      chainU: (s.n_III / s.n_lv).toFixed(4)
                    }
                  });
                }}
              />
              <Button
                title="Tính bộ truyền xích"
                variant="success"
                icon="link"
                onPress={() => {
                  router.push({
                    pathname: "/chain",
                    params: {
                      p: s.P_III.toFixed(4),
                      n: s.n_III.toFixed(2),
                      u: (s.n_III / s.n_lv).toFixed(4),
                      gearT: s.T_I.toFixed(2),
                      gearN: s.n_I.toFixed(2),
                      gearU: s.u_1.toFixed(4)
                    }
                  });
                }}
              />
            </View>

            {/* TỔNG QUAN KẾT QUẢ */}
            <ResultsOverview snapshot={s} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
