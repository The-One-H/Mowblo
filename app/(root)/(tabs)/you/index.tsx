import { Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { SignOutButton } from '@/components/SignOutButton';

const You = () => {
  return (
      <ScrollView className="flex-1">
        {/* Settings Section */}
        <View className="px-6">
          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-200"
            onPress={() => router.navigate('/(root)/(tabs)/you/personal-info')}
          >
            <Ionicons name="person-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Personal Information</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
            <Ionicons name="card-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Transactions</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
            <Ionicons name="lock-closed-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Login & Security</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
            <Ionicons name="options-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Settings</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
  );
};

export default You;