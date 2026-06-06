import { Inter_400Regular, Inter_900Black } from '@expo-google-fonts/inter';
import { SpaceGrotesk_400Regular, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { Ionicons } from "@expo/vector-icons";
import { router, SplashScreen, Stack, useSegments } from "expo-router";
import React, { useEffect } from 'react';
import { Pressable, Text, View } from "react-native";
import "../../global.css";
import { runMigrations } from "../db/migrate";
import { seedMotors4aIfEmpty } from "../db/seed/motor-4a";
import { seedMotorsDkIfEmpty } from "../db/seed/motor-dk";
import { AuthProvider, useAuth } from "../context/auth-context";

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

const LayoutRoot = () => {
  const [loaded, error] = useFonts({
    'SpaceGrotesk-Regular': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Black': Inter_900Black,
  });

  useEffect(() => {
    if (!loaded && !error) return;

    let cancelled = false;

    void (async () => {
      await SplashScreen.hideAsync();
      try {
        await runMigrations();
      } catch (e) {
        console.error("[db] migration failed", e);
      }
      if (cancelled) return;
      seedMotorsDkIfEmpty();
      seedMotors4aIfEmpty();
    })();

    return () => {
      cancelled = true;
    };
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)"></Stack.Screen>

        <Stack.Screen
          name="chain"
          options={{
            headerShown: true,
            headerTitleAlign: "left",
            headerBackVisible: false,
            headerLeft: () => null,
            headerTitle: () => (
              <View className='flex-row items-center gap-3'>
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Quay lại"
                >
                  <Ionicons name="chevron-back" size={24} color="#11181C" />
                </Pressable>
                <View className='bg-[#e8f0fe] p-2 rounded-xl'>
                  <Ionicons name="link-sharp" size={20} color="#1a73e8" />
                </View>
                <Text className='font-space text-2xl font-semibold'>Bộ truyền xích</Text>
              </View>
            ),
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="gear"
          options={{
            headerShown: true,
            headerTitleAlign: "left",
            headerBackVisible: false,
            headerLeft: () => null,
            headerTitle: () => (
              <View className='flex-row items-center gap-3'>
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Quay lại"
                >
                  <Ionicons name="chevron-back" size={24} color="#11181C" />
                </Pressable>
                <View className='bg-[#e8f0fe] p-2 rounded-xl'>
                  <Ionicons name="settings-sharp" size={20} color="#1a73e8" />
                </View>
                <Text className='font-space text-2xl font-semibold'>Bộ truyền bánh răng</Text>
              </View>
            ),
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}

export default LayoutRoot;

