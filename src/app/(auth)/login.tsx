import Button from "@/components/common/button";
import { useAuth } from "@/context/auth-context";
import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      console.error("[login] error:", JSON.stringify({
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        code: e?.code,
      }));
      const msg = e?.response?.data?.message ?? e?.message ?? "Đăng nhập thất bại. Kiểm tra lại thông tin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-10">
            <Text className="text-3xl font-space-bold text-zinc-900">Đăng nhập</Text>
            <Text className="mt-2 text-sm font-inter text-zinc-500">
              Chào mừng trở lại MechCalc
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="mb-1.5 text-sm font-inter text-zinc-700">Email</Text>
              <TextInput
                className="h-12 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 font-inter text-zinc-900"
                placeholder="email@example.com"
                placeholderTextColor="#a1a1aa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-inter text-zinc-700">Mật khẩu</Text>
              <TextInput
                className="h-12 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 font-inter text-zinc-900"
                placeholder="••••••••"
                placeholderTextColor="#a1a1aa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {error ? (
              <View className="rounded-xl bg-red-50 px-4 py-3">
                <Text className="text-sm font-inter text-red-600">{error}</Text>
              </View>
            ) : null}

            <View className="mt-2">
              <Button
                title={loading ? "Đang đăng nhập..." : "Đăng nhập"}
                onPress={handleLogin}
                disabled={loading}
                variant="primary"
              />
            </View>
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm font-inter text-zinc-500">Chưa có tài khoản?</Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text className="text-sm font-inter text-[#0047AB]">Đăng ký ngay</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
