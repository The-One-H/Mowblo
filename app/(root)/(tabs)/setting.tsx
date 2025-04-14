import { Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

const Setting = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center">
        <Text className="text-4xl font-semibold">Settings</Text>
        <TouchableOpacity>
          <View className="relative">
            <Ionicons name="notifications-outline" size={24} color="black" />
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full items-center justify-center">
              <Text className="text-white text-xs">1</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Section */}
        <Link href = "/(root)/profile">
          <View className="flex-row items-center px-6 py-4 border-b border-gray-200">
            <View className="w-14 h-14 rounded-full bg-gray-200 mr-4" />
            <View className="flex-1">
              <Text className="text-xl font-semibold">Sam</Text>
              <Text className="text-gray-500">Show profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </View>
        </Link>

        {/* Airbnb Card */}
        <TouchableOpacity className="mx-6 my-4">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-semibold mb-2">Mowblo your lawn</Text>
                <Text className="text-gray-500 text-base">It's easy to start mowing and earn extra income.</Text>
              </View>
              <View className="w-20 h-20">
                <View className="w-full h-full bg-[#57caf2] rounded-lg" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Settings Section */}
        <View className="px-6">
          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
            <Ionicons name="person-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Personal information</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
            <Ionicons name="card-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Payments and payouts</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
            <Ionicons name="document-text-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Taxes</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
            <Ionicons name="lock-closed-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Login & security</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
            <Ionicons name="options-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Accessibility</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Setting;