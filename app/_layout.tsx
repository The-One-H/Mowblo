import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css"
import { ClickOutsideProvider } from "react-native-click-outside";

export default function AppLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ClickOutsideProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark"/>
          <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name = "(api)"/>
            <Stack.Screen name = "(auth)"/>
            <Stack.Screen name = "(legal)"/>
            <Stack.Screen name = "(root)"/>
            <Stack.Screen name="job-tracking" options={{ headerShown: false }} />
            <Stack.Screen name="job-inbox" options={{ headerShown: false }} />
            <Stack.Screen name=" +not-found"/>
            <Stack.Screen name=" +html"/>
            <Stack.Screen name=" index"/>
          </Stack>
        </GestureHandlerRootView>
      </ClickOutsideProvider>
    </ClerkProvider>
  );
}
