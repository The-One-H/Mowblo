import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Wallet = () => {
  return (
    <SafeAreaView>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <Text className="text-3xl font-bold">Wallet</Text>
        <Link href = "/(root)/profile">
        <View className="w-10 h-10 rounded-full bg-gray-300" />
        </Link>
      </View>
      <ScrollView>
      <Text>Wallet</Text>
      </ScrollView>
    </SafeAreaView>
  );
};
export default Wallet;