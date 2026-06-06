import { useAuth } from "@/context/auth-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import type { QuickItem } from "@/types/quick-item";

const Index = () => {
  const { user } = useAuth();
  const quickItems: QuickItem[] = [
    {
      title: "Tính toán",
      icon: "calculator-outline",
      color: "#3B82F6",
      bg: "#EFF6FF",
      onPress: () => router.push("/(tabs)/calc"),
    },
    {
      title: "Dự án",
      icon: "folder-outline",
      color: "#A855F7",
      bg: "#F6EFFF",
      onPress: () => router.push("/(tabs)/project"),
    },
  ];

  return (
    <ScrollView className="flex-1  bg-white" contentContainerStyle={{ paddingBottom: 24, paddingTop: 80 }}>
      <View className="mx-auto ">
        <Text className="text-zinc-700 text-3xl font-inter leading-6 tracking-wide">xin chào!</Text>
        <Text className="text-sky-900  text-3xl font-space-bold  leading-9">{user?.fullName ?? "..."}</Text>
      </View>

      <View className="px-5 my-10 pt-5">
        <Text className="text-base font-space uppercase">Truy cập nhanh</Text>
        <View className="mt-3 flex-row flex-wrap justify-between gap-y-4">
          {quickItems.map((item, index) => (
            <TouchableOpacity onPress={item.onPress} className="w-[48%] rounded-2xl bg-[#FFFFFF] border p-5" key={index}>
              <View
                className="rounded-full"
                style={{ backgroundColor: item.bg, height: 40, width: 40, alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons color={item.color} name={item.icon} size={20} />
              </View>
              <Text className="mt-3 text-lg font-inter text-slate-900">{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="px-5 pt-2">
        <View className="flex-row items-center">
          <Ionicons name="notifications-outline" size={18} color="#11181C" />
          <Text className="ml-2 text-base font-semibold text-zinc-900">Thông báo</Text>
        </View>

        <View className="mt-3 gap-3">
          <View className="rounded-2xl border  bg-white px-4 py-3">
            <Text className="text-sm font-medium text-zinc-900">
              Phiên bản 2.0 đã ra mắt với tính năng xuất PDF
            </Text>
            <Text className="mt-1 text-xs text-zinc-500">2 giờ trước</Text>
          </View>

          <View className="rounded-2xl border bg-white px-4 py-3">
            <Text className="text-sm font-medium text-zinc-900">
              Dự án &quot;Hộp giảm tốc #3&quot; đã được lưu tự động
            </Text>
            <Text className="mt-1 text-xs text-zinc-500">1 ngày trước</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Index;