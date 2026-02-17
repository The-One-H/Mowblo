import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function RoleSelect() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-dark items-center justify-center p-6">
            <Text className="text-white text-3xl font-display mb-2 text-center">
                Welcome to Mowblo
            </Text>
            <Text className="text-gray-mid text-lg font-body mb-12 text-center">
                How do you want to use the app?
            </Text>

            <View className="flex-row w-full gap-4">
                {/* Customer Card */}
                <TouchableOpacity
                    className="flex-1 bg-primary-blue rounded-2xl p-6 items-center"
                    onPress={() => router.push("/(customer)/home")}
                    style={{ backgroundColor: Colors.primary.blue }}
                >
                    <Ionicons name="home" size={48} color="white" />
                    <Text className="text-white font-headline text-xl mt-4">
                        I need help
                    </Text>
                    <Text className="text-white font-body text-center mt-2 opacity-90">
                        Book a Pro for lawn or snow
                    </Text>
                </TouchableOpacity>

                {/* Pro Card */}
                <TouchableOpacity
                    className="flex-1 bg-primary-green rounded-2xl p-6 items-center"
                    onPress={() => router.push("/(pro)/dashboard")}
                    style={{ backgroundColor: Colors.primary.green }}
                >
                    <Ionicons name="construct" size={48} color="white" />
                    <Text className="text-white font-headline text-xl mt-4">
                        I want to earn
                    </Text>
                    <Text className="text-white font-body text-center mt-2 opacity-90">
                        Make money on your schedule
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
