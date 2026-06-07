import Button from "@/components/common/button";
import { projectService, type ProjectResponse } from "@/services/api/project.service";
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

const STATUS_LABEL: Record<ProjectResponse["status"], string> = {
  IN_PROGRESS: "Đang làm",
  COMPLETED: "Hoàn thành",
  ARCHIVED: "Lưu trữ",
};

const STATUS_COLOR: Record<ProjectResponse["status"], string> = {
  IN_PROGRESS: "#3B82F6",
  COMPLETED: "#22c55e",
  ARCHIVED: "#a1a1aa",
};

export default function ProjectScreen() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch {
      setError("Không tải được danh sách dự án");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await projectService.createProject({ name: newName.trim(), description: newDesc.trim() || undefined });
      setNewName("");
      setNewDesc("");
      setShowModal(false);
      void loadProjects();
    } catch {
      Alert.alert("Lỗi", "Tạo dự án thất bại. Vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert("Xóa dự án", `Bạn chắc chắn muốn xóa "${name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await projectService.deleteProject(id);
            void loadProjects();
          } catch {
            Alert.alert("Lỗi", "Xóa thất bại.");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <View className="px-5 pt-6 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-space-bold text-zinc-900">Dự án</Text>
          <Text className="mt-1 text-sm font-inter text-zinc-500">Quản lý các dự án tính toán</Text>
        </View>
        <Pressable
          onPress={() => setShowModal(true)}
          className="h-10 w-10 items-center justify-center rounded-2xl bg-[#0047AB]"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0047AB" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-5 gap-4">
          <Text className="text-center font-inter text-zinc-500">{error}</Text>
          <Button title="Thử lại" onPress={loadProjects} variant="outline" />
        </View>
      ) : projects.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5 gap-3">
          <Ionicons name="folder-open-outline" size={48} color="#a1a1aa" />
          <Text className="text-center font-inter text-zinc-500">Chưa có dự án nào</Text>
          <Button title="Tạo dự án đầu tiên" onPress={() => setShowModal(true)} variant="primary" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24, gap: 12 }}>
          {projects.map((p) => (
            <Pressable
              key={p.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onPress={() => (router as any).push({ pathname: "/project/[id]", params: { id: p.id } })}
              className="rounded-2xl border border-zinc-200 bg-white p-4 active:bg-zinc-50"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-space-bold text-zinc-900" numberOfLines={1}>
                    {p.name}
                  </Text>
                  {p.description ? (
                    <Text className="mt-1 text-sm font-inter text-zinc-500" numberOfLines={2}>
                      {p.description}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-row items-center gap-2">
                  <Pressable onPress={() => handleDelete(p.id, p.name)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </Pressable>
                  <Ionicons name="chevron-forward-outline" size={16} color="#a1a1aa" />
                </View>
              </View>

              <View className="mt-3 flex-row items-center gap-2">
                <View
                  className="rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: STATUS_COLOR[p.status] + "20" }}
                >
                  <Text
                    className="text-xs font-inter"
                    style={{ color: STATUS_COLOR[p.status] }}
                  >
                    {STATUS_LABEL[p.status]}
                  </Text>
                </View>
                <Text className="text-xs font-inter text-zinc-400">
                  {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Modal tạo dự án */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setShowModal(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-white px-5 pt-6 pb-10"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-5 text-xl font-space-bold text-zinc-900">Tạo dự án mới</Text>

            <View className="gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-inter text-zinc-700">Tên dự án *</Text>
                <View className="h-12 flex-row items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4">
                  <TextInput
                    className="flex-1 font-inter text-[15px] text-zinc-900"
                    placeholder="VD: Hộp giảm tốc #1"
                    placeholderTextColor="#a1a1aa"
                    value={newName}
                    onChangeText={setNewName}
                  />
                </View>
              </View>
              <View>
                <Text className="mb-1.5 text-sm font-inter text-zinc-700">Mô tả</Text>
                <View className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <TextInput
                    className="font-inter text-[15px] text-zinc-900"
                    placeholder="Mô tả ngắn (tuỳ chọn)"
                    placeholderTextColor="#a1a1aa"
                    value={newDesc}
                    onChangeText={setNewDesc}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </View>

            <View className="mt-5 flex-row gap-3">
              <View className="flex-1">
                <Button title="Hủy" onPress={() => setShowModal(false)} variant="outline" />
              </View>
              <View className="flex-1">
                <Button
                  title={creating ? "Đang tạo..." : "Tạo"}
                  onPress={handleCreate}
                  disabled={creating || !newName.trim()}
                  variant="primary"
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
