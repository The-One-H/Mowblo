import { Text, View, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const Client = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-600 text-base">Service now</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-xl font-semibold">1226 University Dr</Text>
              <Ionicons name="chevron-down" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="mt-4 bg-gray-100 rounded-full flex-row items-center px-4 py-2 bottom-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput 
            placeholder="Search Services" 
            className="ml-2 flex-1 text-base"
            placeholderTextColor="gray"
          />
        </View>

        {/* Service Categories */}
        <ScrollView>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mt-4"
          >
          <View className="flex-row space-x-8 px-2">
            <View className="items-center">
              <View className="w-16 h-16 bg-[#57caf2] rounded-full items-center justify-center mb-1">
                <Ionicons name="cut" size={24} color="white" />
              </View>
              <Text>Mowing</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 bg-[#4CD964] rounded-full items-center justify-center mb-1">
                <Ionicons name="leaf" size={24} color="white" />
              </View>
              <Text>Cleanup</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 bg-[#FF9500] rounded-full items-center justify-center mb-1">
                <Ionicons name="water" size={24} color="white" />
              </View>
              <Text>Irrigation</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 bg-[#FF3B30] rounded-full items-center justify-center mb-1">
                <Ionicons name="flower" size={24} color="white" />
              </View>
              <Text>Planting</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 bg-[#5856D6] rounded-full items-center justify-center mb-1">
                <Ionicons name="construct" size={24} color="white" />
              </View>
              <Text>Maintenance</Text>
            </View>
          </View>
        </ScrollView>

        {/* Quick Actions */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mt-4"
          >
          <View className="flex-row space-x-3 px-2">
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
              <Text>Premium Service</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
              <Text>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
              <Text>Offers</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
              <Text>Subscription</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Featured Section */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold">Featured Providers</Text>
            <TouchableOpacity>
              <Ionicons name="arrow-forward" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Featured Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-4">
              <TouchableOpacity className="w-[300px] bg-white rounded-xl shadow-sm">
                <View className="h-[150px] bg-gray-200 rounded-t-xl" />
                <View className="p-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold">Green Thumb Pro</Text>
                    <View className="bg-green-100 px-2 py-1 rounded">
                      <Text className="text-green-800">⭐ 4.9</Text>
                    </View>
                  </View>
                  <Text className="text-gray-500">$25/hour • 0.5 mi away</Text>
                  <Text className="text-gray-500">Available Today</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="w-[300px] bg-white rounded-xl shadow-sm">
                <View className="h-[150px] bg-gray-200 rounded-t-xl" />
                <View className="p-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold">Lawn Masters</Text>
                    <View className="bg-green-100 px-2 py-1 rounded">
                      <Text className="text-green-800">⭐ 4.8</Text>
                    </View>
                  </View>
                  <Text className="text-gray-500">$30/hour • 1.2 mi away</Text>
                  <Text className="text-gray-500">Next Available: Tomorrow</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
    </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Client;