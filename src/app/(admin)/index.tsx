import { adminService, type AdminUserResponse, type CreateAdminRequest } from "@/services/api/admin.service";
import { gearCatalogService, type GearMaterialCatalogResponse } from "@/services/api/gear-catalog.service";
import { motorCatalogService, type MotorCatalogResponse } from "@/services/api/motor-catalog.service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminUserResponse["status"] }) {
  const active = status === "ACTIVE";
  return (
    <View
      className="rounded-full px-2 py-0.5"
      style={{ backgroundColor: active ? "#dcfce7" : "#fee2e2" }}
    >
      <Text
        className="text-[11px] font-inter"
        style={{ color: active ? "#16a34a" : "#dc2626", fontWeight: "600" }}
      >
        {active ? "Hoạt động" : "Bị khóa"}
      </Text>
    </View>
  );
}

function UserCard({
  user,
  onToggleStatus,
  onDelete,
}: {
  user: AdminUserResponse;
  onToggleStatus: (user: AdminUserResponse) => void;
  onDelete: (user: AdminUserResponse) => void;
}) {
  const init = initials(user.fullName || user.email);
  return (
    <View className="rounded-2xl border border-zinc-200 bg-white p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#0047AB]">
          <Text className="text-sm font-space-bold text-white">{init}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-space-bold text-zinc-900" numberOfLines={1}>
            {user.fullName || "—"}
          </Text>
          <Text className="text-xs font-inter text-zinc-500" numberOfLines={1}>
            {user.email}
          </Text>
        </View>
        <StatusBadge status={user.status} />
      </View>

      {(user.organization || user.phone) ? (
        <View className="mt-2 flex-row gap-3">
          {user.organization ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="business-outline" size={11} color="#a1a1aa" />
              <Text className="text-[11px] font-inter text-zinc-400">{user.organization}</Text>
            </View>
          ) : null}
          {user.phone ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="call-outline" size={11} color="#a1a1aa" />
              <Text className="text-[11px] font-inter text-zinc-400">{user.phone}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between border-t border-zinc-100 pt-3">
        <Text className="text-[11px] font-inter text-zinc-400">
          Tham gia {fmtDate(user.createdAt)}
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => onToggleStatus(user)}
            className="flex-row items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5"
            hitSlop={4}
          >
            <Ionicons
              name={user.status === "ACTIVE" ? "lock-closed-outline" : "lock-open-outline"}
              size={13}
              color={user.status === "ACTIVE" ? "#f59e0b" : "#16a34a"}
            />
            <Text
              className="text-[12px] font-inter"
              style={{ color: user.status === "ACTIVE" ? "#f59e0b" : "#16a34a", fontWeight: "500" }}
            >
              {user.status === "ACTIVE" ? "Khóa" : "Mở"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onDelete(user)}
            className="flex-row items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5"
            hitSlop={4}
          >
            <Ionicons name="trash-outline" size={13} color="#ef4444" />
            <Text className="text-[12px] font-inter text-red-500" style={{ fontWeight: "500" }}>
              Xóa
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateAdminRequest>({ email: "", password: "", fullName: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await adminService.getUsers());
    } catch (e: any) {
      const status = e?.response?.status;
      setError(status === 403 ? "Bạn không có quyền truy cập chức năng này." : "Tải danh sách thất bại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleToggleStatus(user: AdminUserResponse) {
    const next = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
    const label = next === "ACTIVE" ? "mở khóa" : "khóa";
    Alert.alert(
      "Xác nhận",
      `Bạn muốn ${label} tài khoản "${user.fullName || user.email}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: next === "ACTIVE" ? "Mở khóa" : "Khóa",
          style: next === "ACTIVE" ? "default" : "destructive",
          onPress: async () => {
            try {
              const updated = await adminService.updateUserStatus(user.id, next);
              setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
            } catch {
              Alert.alert("Lỗi", "Cập nhật trạng thái thất bại.");
            }
          },
        },
      ]
    );
  }

  async function handleDelete(user: AdminUserResponse) {
    Alert.alert(
      "Xóa người dùng",
      `Bạn chắc chắn muốn xóa "${user.fullName || user.email}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await adminService.deleteUser(user.id);
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
            } catch {
              Alert.alert("Lỗi", "Xóa thất bại.");
            }
          },
        },
      ]
    );
  }

  async function handleCreate() {
    if (!form.email.trim() || !form.password.trim() || !form.fullName.trim()) return;
    setFieldErrors({});
    setCreating(true);
    try {
      const created = await adminService.createAdmin(form);
      setUsers((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setForm({ email: "", password: "", fullName: "" });
    } catch (e: any) {
      const fieldErrs = e?.response?.data?.data;
      if (fieldErrs && typeof fieldErrs === "object") {
        setFieldErrors(fieldErrs);
      } else {
        Alert.alert("Lỗi", e?.response?.data?.message ?? "Tạo admin thất bại.");
      }
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0047AB" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-5 gap-4">
        <Ionicons name="shield-outline" size={40} color="#a1a1aa" />
        <Text className="text-center font-inter text-zinc-500">{error}</Text>
        <Pressable onPress={load} className="rounded-xl bg-zinc-100 px-5 py-2.5">
          <Text className="font-inter text-zinc-700" style={{ fontWeight: "500" }}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 10 }}
      >
        {users.length === 0 ? (
          <View className="items-center py-10 gap-3">
            <Ionicons name="people-outline" size={40} color="#a1a1aa" />
            <Text className="font-inter text-zinc-500">Chưa có người dùng nào.</Text>
          </View>
        ) : (
          users.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>

      {/* FAB tạo admin */}
      <Pressable
        onPress={() => { setShowCreateModal(true); setFieldErrors({}); }}
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-2xl bg-[#0047AB] shadow-lg"
        style={{ elevation: 4 }}
      >
        <Ionicons name="person-add-outline" size={22} color="#fff" />
      </Pressable>

      {/* Modal tạo admin */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setShowCreateModal(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-white px-5 pt-6 pb-10"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-5 text-xl font-space-bold text-zinc-900">Tạo tài khoản Admin</Text>
            <View className="gap-3">
              <View>
                <Text className="mb-1 text-xs font-inter text-zinc-500">Họ và tên *</Text>
                <View className={`h-11 flex-row items-center rounded-xl border bg-zinc-50 px-3 ${fieldErrors.fullName ? "border-red-400" : "border-zinc-200"}`}>
                  <TextInput
                    className="flex-1 font-inter text-[15px] text-zinc-900"
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#a1a1aa"
                    value={form.fullName}
                    onChangeText={(v) => { setForm((f) => ({ ...f, fullName: v })); setFieldErrors((e) => ({ ...e, fullName: "" })); }}
                  />
                </View>
                {fieldErrors.fullName ? <Text className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</Text> : null}
              </View>
              <View>
                <Text className="mb-1 text-xs font-inter text-zinc-500">Email *</Text>
                <View className={`h-11 flex-row items-center rounded-xl border bg-zinc-50 px-3 ${fieldErrors.email ? "border-red-400" : "border-zinc-200"}`}>
                  <TextInput
                    className="flex-1 font-inter text-[15px] text-zinc-900"
                    placeholder="admin@example.com"
                    placeholderTextColor="#a1a1aa"
                    value={form.email}
                    onChangeText={(v) => { setForm((f) => ({ ...f, email: v })); setFieldErrors((e) => ({ ...e, email: "" })); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {fieldErrors.email ? <Text className="mt-1 text-xs text-red-500">{fieldErrors.email}</Text> : null}
              </View>
              <View>
                <Text className="mb-1 text-xs font-inter text-zinc-500">Mật khẩu *</Text>
                <View className={`h-11 flex-row items-center rounded-xl border bg-zinc-50 px-3 ${fieldErrors.password ? "border-red-400" : "border-zinc-200"}`}>
                  <TextInput
                    className="flex-1 font-inter text-[15px] text-zinc-900"
                    placeholder="Min 8 ký tự, hoa, thường, số, đặc biệt"
                    placeholderTextColor="#a1a1aa"
                    value={form.password}
                    onChangeText={(v) => { setForm((f) => ({ ...f, password: v })); setFieldErrors((e) => ({ ...e, password: "" })); }}
                    secureTextEntry
                  />
                </View>
                {fieldErrors.password
                  ? <Text className="mt-1 text-xs text-red-500">{fieldErrors.password}</Text>
                  : <Text className="mt-1 text-xs font-inter text-zinc-400">Tối thiểu 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt</Text>
                }
              </View>
            </View>
            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => setShowCreateModal(false)}
                className="flex-1 h-12 items-center justify-center rounded-2xl border border-zinc-200"
              >
                <Text className="font-inter text-zinc-700" style={{ fontWeight: "500" }}>Hủy</Text>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                disabled={creating || !form.email.trim() || !form.password.trim() || !form.fullName.trim()}
                className="flex-1 h-12 items-center justify-center rounded-2xl bg-[#0047AB]"
                style={{ opacity: creating ? 0.6 : 1 }}
              >
                <Text className="font-space-bold text-white">
                  {creating ? "Đang tạo..." : "Tạo"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Catalogs Tab ─────────────────────────────────────────────────────────────

type CatalogTab = "motor" | "gear";

function MotorCatalogList({ items }: { items: MotorCatalogResponse[] }) {
  return (
    <View className="gap-2">
      {items.map((m) => (
        <View key={m.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-space-bold text-zinc-900">{m.motorCode}</Text>
            <View className="rounded-lg bg-blue-50 px-2 py-0.5">
              <Text className="text-xs font-inter text-blue-700" style={{ fontWeight: "600" }}>
                {m.series}
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-x-4 gap-y-1">
            {([
              ["Công suất", `${m.power} kW`],
              ["Tốc độ", `${m.speed} v/ph`],
              ["Đồng bộ", `${m.syncSpeed} v/ph`],
              ["Số cực", `${m.poles}p`],
              ["η", `${m.efficiency}%`],
              ["cosφ", `${m.cosPhi}`],
              ["Tk/Tdn", `${m.tkTdnRatio}`],
              ["Tmax/Tdn", `${m.tmaxTdnRatio}`],
              ["Khối lượng", `${m.weight} kg`],
            ] as [string, string][]).map(([label, val]) => (
              <View key={label} className="flex-row gap-1">
                <Text className="text-[11px] font-inter text-zinc-400">{label}:</Text>
                <Text className="text-[11px] font-inter text-zinc-700" style={{ fontWeight: "500" }}>{val}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function GearMaterialCatalogList({ items }: { items: GearMaterialCatalogResponse[] }) {
  return (
    <View className="gap-2">
      {items.map((g) => (
        <View key={g.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-space-bold text-zinc-900">{g.catalogCode}</Text>
            <View className="rounded-lg bg-emerald-50 px-2 py-0.5">
              <Text className="text-xs font-inter text-emerald-700" style={{ fontWeight: "600" }}>
                {g.gearDetail}
              </Text>
            </View>
          </View>
          <Text className="mb-1 text-xs font-inter text-zinc-600" style={{ fontWeight: "500" }}>
            {g.material} — {g.heatTreatment}
          </Text>
          <View className="flex-row flex-wrap gap-x-4 gap-y-1">
            {([
              ["Kích thước ≤", `${g.sizeLimitMm} mm`],
              ["HB", `${g.hardnessHb}`],
              ["σB", `${g.sigmaB} MPa`],
              ["σch", `${g.sigmaCh} MPa`],
              ["KHL coef", `${g.contactFatigueLimitCoefficient}`],
              ["KHL const", `${g.contactFatigueLimitConstant}`],
              ["SH", `${g.contactSafetyFactor}`],
              ["KFL coef", `${g.bendingFatigueLimitCoefficient}`],
              ["SF", `${g.bendingSafetyFactor}`],
            ] as [string, string][]).map(([label, val]) => (
              <View key={label} className="flex-row gap-1">
                <Text className="text-[11px] font-inter text-zinc-400">{label}:</Text>
                <Text className="text-[11px] font-inter text-zinc-700" style={{ fontWeight: "500" }}>{val}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function CatalogsTab() {
  const [activeTab, setActiveTab] = useState<CatalogTab>("motor");
  const [motors, setMotors] = useState<MotorCatalogResponse[]>([]);
  const [gears, setGears] = useState<GearMaterialCatalogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [m, g] = await Promise.all([
        motorCatalogService.getMotorCatalogs(),
        gearCatalogService.getGearMaterialCatalogs(),
      ]);
      setMotors(m);
      setGears(g);
    } catch {
      setError("Tải dữ liệu catalog thất bại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0047AB" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-5 gap-4">
        <Text className="text-center font-inter text-zinc-500">{error}</Text>
        <Pressable onPress={load} className="rounded-xl bg-zinc-100 px-5 py-2.5">
          <Text className="font-inter text-zinc-700" style={{ fontWeight: "500" }}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Sub-tab */}
      <View className="mx-5 mt-4 flex-row rounded-xl bg-zinc-100 p-1">
        {(["motor", "gear"] as CatalogTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="flex-1 items-center rounded-lg py-2"
            style={{ backgroundColor: activeTab === tab ? "#fff" : "transparent" }}
          >
            <Text
              className="text-[13px] font-inter"
              style={{
                color: activeTab === tab ? "#0047AB" : "#71717a",
                fontWeight: activeTab === tab ? "600" : "400",
              }}
            >
              {tab === "motor" ? `Động cơ (${motors.length})` : `Bánh răng (${gears.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingTop: 12, gap: 10 }}
      >
        {activeTab === "motor" ? (
          motors.length === 0 ? (
            <View className="items-center py-10">
              <Text className="font-inter text-zinc-500">Không có dữ liệu.</Text>
            </View>
          ) : (
            <MotorCatalogList items={motors} />
          )
        ) : (
          gears.length === 0 ? (
            <View className="items-center py-10">
              <Text className="font-inter text-zinc-500">Không có dữ liệu.</Text>
            </View>
          ) : (
            <GearMaterialCatalogList items={gears} />
          )
        )}
      </ScrollView>
    </View>
  );
}

// ─── Main Admin Screen ────────────────────────────────────────────────────────

type MainTab = "users" | "catalogs";

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<MainTab>("users");

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 py-4 border-b border-zinc-100 bg-white">
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#27272a" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-space-bold text-zinc-900">Quản trị viên</Text>
          <Text className="text-xs font-inter text-zinc-500">MechCalc Admin Panel</Text>
        </View>
        <View className="rounded-lg bg-red-50 px-2.5 py-1">
          <Text className="text-[11px] font-inter text-red-600" style={{ fontWeight: "700" }}>
            ADMIN
          </Text>
        </View>
      </View>

      {/* Main tab bar */}
      <View className="flex-row border-b border-zinc-100 bg-white px-5">
        {(["users", "catalogs"] as MainTab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="mr-6 py-3"
              style={{ borderBottomWidth: 2, borderBottomColor: active ? "#0047AB" : "transparent" }}
            >
              <View className="flex-row items-center gap-1.5">
                <Ionicons
                  name={tab === "users" ? "people-outline" : "library-outline"}
                  size={15}
                  color={active ? "#0047AB" : "#a1a1aa"}
                />
                <Text
                  className="text-sm font-inter"
                  style={{ color: active ? "#0047AB" : "#a1a1aa", fontWeight: active ? "600" : "400" }}
                >
                  {tab === "users" ? "Người dùng" : "Catalog"}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === "users" ? <UsersTab /> : <CatalogsTab />}
    </SafeAreaView>
  );
}
