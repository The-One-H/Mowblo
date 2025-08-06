import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { TouchableOpacity, View, Text } from "react-native";

export function SimpleHeader(title: string | undefined) {
  return (
    <View className="px-6 py-4 flex-row items-center justify-center bg-white">
        {
            router.canGoBack() ?
            <TouchableOpacity
                className='p-4 m-[-1rem] flex-1 flex-row'
                onPress={() => {
                router.back()
                }}
            >
                <Ionicons name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
            : <View className='flex-1 p-4 m-[-1rem] '></View>
        }

        <Text className='text-2xl font-semibold'>{title??''}</Text>

        <View className='flex-1 p-4 m-[-1rem] '></View>
    </View>
  );
}
