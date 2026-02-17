import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Colors } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerHome() {
    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView className="flex-1 p-6">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-gray-mid font-body text-base">
                            👋 Hey Marcus,
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-dark font-headline text-lg mr-1">
                                42 Maple Drive
                            </Text>
                            <Ionicons name="chevron-down" size={16} color={Colors.text.dark} />
                        </View>
                    </View>
                    <Image
                        source={{ uri: "https://i.pravatar.cc/100" }}
                        className="w-10 h-10 rounded-full bg-gray-300"
                    />
                </View>

                {/* Search Bar */}
                <View className="bg-white rounded-xl p-4 flex-row items-center shadow-sm mb-6">
                    <Ionicons name="search" size={20} color={Colors.text.grayMid} />
                    <Text className="text-gray-mid ml-2 font-body">
                        What do you need today?
                    </Text>
                </View>

                {/* Seasonal Alert Banner */}
                <View
                    className="rounded-2xl p-6 mb-8 relative overflow-hidden"
                    style={{ backgroundColor: Colors.primary.blue }}
                >
                    <View className="flex-row items-start justify-between relative z-10">
                        <View className="flex-1 mr-4">
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="snow" size={20} color="white" />
                                <Text className="text-white font-headline ml-2">SNOW ALERT</Text>
                            </View>
                            <Text className="text-white font-display text-2xl mb-2">
                                8-12" expected tonight
                            </Text>
                            <Text className="text-white font-body opacity-90 mb-4">
                                Book a Pro now before they fill up!
                            </Text>
                            <TouchableOpacity
                                className="bg-white px-6 py-3 rounded-full self-start"
                            >
                                <Text className="text-primary-blue font-headline">Book Now →</Text>
                            </TouchableOpacity>
                        </View>
                        <Ionicons
                            name="snow"
                            size={120}
                            color="white"
                            style={{ opacity: 0.2, position: "absolute", right: -20, top: -20 }}
                        />
                    </View>
                </View>

                {/* Service Selector */}
                <Text className="text-dark font-headline text-xl mb-4">Services</Text>
                <View className="flex-row gap-4 mb-8">
                    {/* Lawn Card */}
                    <TouchableOpacity className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mb-4"
                            style={{ backgroundColor: "#E6F6E2" }}
                        >
                            <Ionicons name="leaf" size={24} color={Colors.primary.green} />
                        </View>
                        <Text className="text-dark font-headline text-lg mb-1">
                            Lawn Mowing
                        </Text>
                        <Text className="text-gray-mid text-xs mb-4">From $35</Text>
                        <View className="flex-row items-center mb-4">
                            <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                            <Text className="text-green-600 text-xs font-bold">
                                12 Pros near
                            </Text>
                        </View>
                        <View className="bg-surface py-2 rounded-lg items-center">
                            <Text className="text-dark font-bold text-sm">Book</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Snow Card */}
                    <TouchableOpacity className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mb-4"
                            style={{ backgroundColor: "#E2F2F9" }}
                        >
                            <Ionicons name="snow" size={24} color={Colors.primary.blue} />
                        </View>
                        <Text className="text-dark font-headline text-lg mb-1">
                            Snow Removal
                        </Text>
                        <Text className="text-gray-mid text-xs mb-4">From $45</Text>
                        <View className="flex-row items-center mb-4">
                            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                            <Text className="text-blue-600 text-xs font-bold">
                                8 Pros avail
                            </Text>
                        </View>
                        <View className="bg-surface py-2 rounded-lg items-center">
                            <Text className="text-dark font-bold text-sm">Book</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
