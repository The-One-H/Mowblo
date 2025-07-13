import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import React from "react";



export default function RootLayout() {
  return (
    <>
      <SignedIn>
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name = "(tabs)"/>
        </Stack>
      </SignedIn>
      <SignedOut>
        <Redirect href={'/(auth)/sign-in'} />
      </SignedOut>
    </>
  );
}
