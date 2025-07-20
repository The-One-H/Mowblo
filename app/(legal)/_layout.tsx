import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router'

export default function AuthRoutesLayout() {
    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="privacy-policy" />
            <Stack.Screen name="terms-of-service" />
        </Stack>
    )
}