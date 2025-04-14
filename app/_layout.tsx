import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "../global.css"


export default function AppLayout() {
  return (
    <>
    <StatusBar style="dark"/>
  <Stack screenOptions={{headerShown: false}}>
    <Stack.Screen name = "(api)"/>
    <Stack.Screen name = "(auth)"/>
    <Stack.Screen name = "(root)"/>
    <Stack.Screen name=" +not-found"/>
    <Stack.Screen name=" +html"/>
    <Stack.Screen name=" index"/>
  </Stack>
  </>
  );
}
