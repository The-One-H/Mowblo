import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
            <Stack.Screen name="sign-up" options={{ presentation: 'modal' }} />
            <Stack.Screen name="onboarding" />
        </Stack>
    );
}