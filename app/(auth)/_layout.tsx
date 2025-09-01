import React from 'react';
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router'

export default function AuthRoutesLayout() {
    const router = useRouter()

    const { isSignedIn } = useAuth()

    React.useEffect(() => {
        if (isSignedIn) {
            router.replace('/(root)/(tabs)/feed');
        }
    }, [isSignedIn, router]);

    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="welcome" options={{ animation: 'none' }}/>
            <Stack.Screen name="sign-up" options={{ animation: 'slide_from_bottom', animationDuration: 300 }}/>
            <Stack.Screen name="sign-in" options={{ animation: 'slide_from_bottom', animationDuration: 300 }}/>
        </Stack>
    )
}