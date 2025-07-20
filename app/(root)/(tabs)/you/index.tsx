import { Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { SignOutButton } from '@/components/SignOutButton';

const You = () => {
  return (
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

        {/* Settings Section */}
        <View className="px-6">
          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-200"
            onPress={() => router.navigate('/(root)/(tabs)/you/personal-info')}
          >
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
  );
};

export default You;