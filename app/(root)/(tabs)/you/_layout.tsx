import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router'
import { SignOutButton } from '@/components/SignOutButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SimpleHeader } from '@/components/SimpleHeader';

export default function AuthRoutesLayout() {
    const router = useRouter()

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack
                screenOptions={{
                    header: (title) => SimpleHeader(title.options.title)
                }}
            >
                <Stack.Screen name="index" options={{ title:'You', headerShown: false }}/>
                <Stack.Screen name="personal-info" options={{ title:'Personal Info', headerShown: true }}/>
                <Stack.Screen name="transactions" options={{ title:'Transactions', headerShown: true }}/>
                <Stack.Screen name="security" options={{ title:'Login & Security', headerShown: true }}/>
                <Stack.Screen name="settings" options={{ title:'Settings', headerShown: true }}/>
            </Stack>
        </SafeAreaView>
    )
}