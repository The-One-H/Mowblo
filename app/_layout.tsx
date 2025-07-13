import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css"


export default function AppLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark"/>
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name = "(api)"/>
          <Stack.Screen name = "(auth)"/>
          <Stack.Screen name = "(legal)"/>
          <Stack.Screen name = "(root)"/>
          <Stack.Screen name=" +not-found"/>
          <Stack.Screen name=" +html"/>
          <Stack.Screen name=" index"/>
        </Stack>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
