import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function AppLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(pro)" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(legal)" />
          <Stack.Screen name="(root)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
