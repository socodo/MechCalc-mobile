import Button from "@/components/common/button";
import { useAuth } from "@/context/auth-context";
import { userService } from "@/services/api/user.service";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");

  function openEdit() {
    setFullName(user?.fullName ?? "");
    setPhone(user?.phone ?? "");
    setOrganization(user?.organization ?? "");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await userService.updateMyProfile({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        organization: organization.trim() || undefined,
      });
      await refreshUser();
      setEditing(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Cập nhật thất bại. Vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase()
    : "?";

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          className="flex-1 px-5 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-5">
            <Text className="text-zinc-900 text-3xl font-space-bold leading-9">Hồ sơ</Text>
            <Text className="mt-1 text-sm font-inter text-zinc-500">Quản lý thông tin tài khoản của bạn</Text>
          </View>

          <View className="rounded-3xl border border-zinc-200 bg-white p-5">
            {/* Avatar + tên */}
            <View className="flex-row items-center">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#0047AB]">
                <Text className="text-xl font-space-bold text-white">{initials}</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xl font-space-bold text-zinc-900" numberOfLines={1}>
                  {user?.fullName ?? "—"}
                </Text>
                <Text className="mt-1 text-sm font-inter text-zinc-500" numberOfLines={1}>
                  {user?.email ?? "—"}
                </Text>
              </View>
              <View className="rounded-full bg-blue-50 px-3 py-1">
                <Text className="text-xs font-inter text-blue-700 tracking-wide">USER</Text>
              </View>
            </View>

            <View className="mt-5 h-px bg-zinc-100" />

            {/* Form xem / chỉnh sửa */}
            {editing ? (
              <View className="mt-4 gap-4">
                <View>
                  <Text className="mb-1.5 text-xs font-inter text-zinc-500">Họ và tên</Text>
                  <TextInput
                    className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 font-inter text-zinc-900"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#a1a1aa"
                  />
                </View>
                <View>
                  <Text className="mb-1.5 text-xs font-inter text-zinc-500">Điện thoại</Text>
                  <TextInput
                    className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 font-inter text-zinc-900"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="0912345678"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="phone-pad"
                  />
                </View>
                <View>
                  <Text className="mb-1.5 text-xs font-inter text-zinc-500">Tổ chức</Text>
                  <TextInput
                    className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-3 font-inter text-zinc-900"
                    value={organization}
                    onChangeText={setOrganization}
                    placeholder="Tên trường / công ty"
                    placeholderTextColor="#a1a1aa"
                  />
                </View>

                <View className="mt-1 flex-row gap-3">
                  <View className="flex-1">
                    <Button title="Hủy" onPress={cancelEdit} variant="outline" />
                  </View>
                  <View className="flex-1">
                    <Button
                      title={saving ? "Đang lưu..." : "Lưu"}
                      onPress={handleSave}
                      disabled={saving}
                      variant="primary"
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View className="mt-4 gap-3">
                <View className="flex-row items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                  <Text className="text-sm font-inter text-zinc-600">Email</Text>
                  <Text className="text-sm font-space-bold text-zinc-900 flex-1 text-right ml-4" numberOfLines={1}>
                    {user?.email ?? "—"}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                  <Text className="text-sm font-inter text-zinc-600">Điện thoại</Text>
                  <Text className="text-sm font-space-bold text-zinc-900">
                    {user?.phone ?? "Chưa cập nhật"}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                  <Text className="text-sm font-inter text-zinc-600">Tổ chức</Text>
                  <Text className="text-sm font-space-bold text-zinc-900">
                    {user?.organization ?? "Chưa cập nhật"}
                  </Text>
                </View>

                <View className="mt-1">
                  <Button title="Cập nhật" onPress={openEdit} variant="primary" />
                </View>
              </View>
            )}
          </View>

          <View className="mt-10">
            <Button title="Đăng xuất" icon="log-out-outline" variant="outline" onPress={handleLogout} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profile;
