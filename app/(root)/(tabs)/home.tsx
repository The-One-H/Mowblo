import { ScrollView, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

const Home = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <Text className="text-3xl font-bold">Today</Text>
        <Link href = "/(root)/profile">
        <View className="w-10 h-10 rounded-full bg-gray-300" />
        </Link>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Cash Balance Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl">Cash Balance</Text>
            <TouchableOpacity onPress={() => {
          router.replace('/(root)/(tabs)/wallet');
        }}>
             <View className='flex-row justify-between items-center mb-2'>
                <Text className="text-gray-500 mr-1">Wallet</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
             </View>
              
            </TouchableOpacity>
          </View> 

          <Text className="text-4xl font-bold mb-6">$0.00</Text> 
          
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-[#f8f8f8] rounded-full py-3 px-8">
              <Text className="text-lg font-medium">Add Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#f8f8f8] rounded-full py-3 px-8">
              <Text className="text-lg font-medium">Cash Out</Text>
            </TouchableOpacity>
          </View>
        </View> 
        {/* Clients */} 
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-4">
          <View className=" flex-row justify-between items-center mb-2">
            <Text className="text-xl">Jobs</Text>
            <TouchableOpacity onPress={() => {
          router.replace('/(root)/(tabs)/wallet');
        }}>
             <View className='flex-row justify-between items-center mb-2'>
                <Text className="text-gray-500 mr-1">Clients</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
             </View>
              
            </TouchableOpacity>
          </View>
          
        
          
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-[#f8f8f8] rounded-full py-3 px-8">
              <Text className="text-lg font-medium">Add Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#f8f8f8] rounded-full py-3 px-8">
              <Text className="text-lg font-medium">Cash Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Grid Items */}
        <View className="flex-row flex-wrap justify-between">
          {/* Client */}
          <TouchableOpacity onPress={() => {
          router.replace('/(auth)/sign-up');
        }} className="w-[48%] bg-white rounded-3xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-medium">Client</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
            <View className="w-12 h-12 bg-[#4CD964] rounded-full mb-2" />
            <Text className="text-2xl font-bold">$0.00</Text>
            <Text className="text-gray-500">Save for a goal</Text>
          </TouchableOpacity>

          {/* Buy Bitcoin */}
          <TouchableOpacity onPress={() => {
          router.replace('/(auth)/sign-up');
        }} className="w-[48%] bg-white rounded-3xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-medium">Buy bitcoin</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
            <View className="h-24 justify-end">
              <View className="w-16 h-16 bg-[#0084ff] rounded-full self-center" />
            </View>
          </TouchableOpacity>

          {/* Invest in stocks */}
          <TouchableOpacity onPress={() => {
          router.replace('/(auth)/sign-up');
        }} className="w-[48%] bg-white rounded-3xl p-4 mb-4" >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-medium">Invest in stocks</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
            <View className="h-24 bg-[#9c6bff] rounded-2xl mt-2" />
          </TouchableOpacity>

          {/* Free tax filing */}
          <TouchableOpacity onPress={() => {
          router.replace('/(auth)/sign-up');
        }} className="w-[48%] bg-white rounded-3xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-medium">Free tax filing</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
            <View className="h-24 justify-end">
              <View className="w-16 h-20 bg-[#ffd60a] rounded-lg self-center" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;