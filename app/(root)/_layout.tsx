import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";



export default function RootLayout() {
  const { userId, sessionId, getToken, isLoaded, isSignedIn } = useAuth();

  return (
    <>
      <SignedIn>
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name="(tabs)"/>
        </Stack>
      </SignedIn>
      <SignedOut>
        <Redirect href={'/(auth)/welcome'} />
      </SignedOut>
    </>
  );
}
