import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router'
import { SignOutButton } from '@/components/SignOutButton';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AuthRoutesLayout() {
    const router = useRouter()

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center">
                <TouchableOpacity
                    className="flex flex-row justify-between items-center p-4 m-[-1rem]"
                    onPress={() => {
                        router.navigate('/profile')
                    }}
                >
                    <View className="w-14 h-14 rounded-full bg-gray-200 mr-4" />
                    <View className="flex">
                        <Text className="text-xl font-semibold">Sam</Text>
                        <Text className="text-gray-500">Freelancer & Client</Text>
                    </View>
                </TouchableOpacity>

                <SignOutButton></SignOutButton>

                <TouchableOpacity>
                <View className="relative">
                    <Ionicons name="notifications-outline" size={24} color="black" />
                    <View className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full items-center justify-center">
                    <Text className="text-white text-xs">1</Text>
                    </View>
                </View>
                </TouchableOpacity>
            </View>

            <Stack screenOptions={{headerShown: true}}>
                <Stack.Screen name="index" options={{title:'You'}}/>
                <Stack.Screen name="personal-info" options={{title:'Personal Info'}}/>
            </Stack>
        </SafeAreaView>
    )
}