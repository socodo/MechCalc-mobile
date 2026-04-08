import { Inter_400Regular, Inter_900Black } from '@expo-google-fonts/inter';
import { SpaceGrotesk_400Regular, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from 'react';
import "../../global.css";
SplashScreen.preventAutoHideAsync();
const _layoutRoot = () => {
  const [loaded, error] = useFonts({
    'SpaceGrotesk-Regular': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Black': Inter_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)"></Stack.Screen>
    </Stack>

  )
}

export default _layoutRoot; 