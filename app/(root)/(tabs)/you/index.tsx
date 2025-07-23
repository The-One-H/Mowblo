import { Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { SignOutButton } from '@/components/SignOutButton';
import { useDataFetch } from '@/hooks/useDataFetch';
import { ProfileImage } from '@/components/ProfileImage';
import { toTitleCase } from '@/utils/stringUtils';

const You = () => {
  const [userData, _] = useDataFetch();

  return (
    <>
      <View className="px-6 py-4 flex-row justify-between items-center bg-white">
        <TouchableOpacity
          className="flex flex-row justify-between items-center p-4 m-[-1rem]"
          onPress={() => {
              router.navigate('/profile')
          }}
        >
          <ProfileImage className='w-14 h-14 mr-4'></ProfileImage>
          <View className="flex">
            <Text className="text-xl font-semibold">{userData?.fullName??''}</Text>
            <Text className="text-gray-500">{userData?.accountType?.map((accType) => { return toTitleCase(accType); }).join(' & ')??''}</Text>
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

      <ScrollView
        className="flex-1"
        alwaysBounceVertical={false}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps={'never'}
        showsVerticalScrollIndicator={false}
      >
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

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-200"
            onPress={() => router.navigate('/(root)/(tabs)/you/transactions')}
          >
            <Ionicons name="card-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Transactions</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-200"
            onPress={() => router.navigate('/(root)/(tabs)/you/security')}
          >
            <Ionicons name="lock-closed-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Login & Security</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-gray-200"
            onPress={() => router.navigate('/(root)/(tabs)/you/settings')}
          >
            <Ionicons name="options-outline" size={24} color="black" className="mr-4" />
            <Text className="flex-1 text-lg">Settings</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default You;