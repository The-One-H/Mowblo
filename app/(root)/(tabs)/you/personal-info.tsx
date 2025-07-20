import { Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { SignOutButton } from '@/components/SignOutButton';

const Page = () => {
  return (
      <ScrollView className="flex-1">
        <Text>G'day</Text>
      </ScrollView>
  );
};

export default Page;