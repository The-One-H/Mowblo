import { View, Text, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import localClients from './../../../data/clients.json';
import { useEffect, useState } from 'react';

// 🧠 Define what a client looks like
interface Client {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  profileImage: string;
  lastService: string;
  nextService: string;
  services: string[];
  rating: number;
}

// 🧱 Each client in the list
const ClientCard = ({ client, onPress }: { client: Client; onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-white rounded-xl shadow-sm mb-4 p-4"
  >
    <View className="flex-row items-center">
      <Image 
        source={{ uri: client.profileImage }} 
        className="w-16 h-16 rounded-full"
      />
      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold">{client.name}</Text>
        <Text className="text-gray-500">{client.address}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text className="ml-1 text-gray-600">{client.rating}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="gray" />
    </View>
  </TouchableOpacity>
);

// 🧾 Detailed view for one client
const ClientDetail = ({ client, onBack }: { client: Client; onBack: () => void }) => (
  <View className="flex-1 bg-white">
    <View className="p-4">
      <TouchableOpacity 
        onPress={onBack}
        className="flex-row items-center mb-4"
      >
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text className="ml-2 text-lg">Back to Clients</Text>
      </TouchableOpacity>

      <View className="items-center mb-6">
        <Image 
          source={{ uri: client.profileImage }} 
          className="w-24 h-24 rounded-full mb-4"
        />
        <Text className="text-2xl font-bold">{client.name}</Text>
        <Text className="text-gray-500">{client.address}</Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Contact Information</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${client.phone}`)} className="flex-row items-center mb-2">
          <Ionicons name="call-outline" size={20} color="#4CAF50" />
          <Text className="ml-2">{client.phone}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${client.email}`)} className="flex-row items-center mb-2">
          <Ionicons name="mail-outline" size={20} color="#4CAF50" />
          <Text className="ml-2">{client.email}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`sms:${client.phone}`)} className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" />
          <Text className="ml-2">Send Message</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-gray-50 rounded-xl p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Service History</Text>
        <Text className="text-gray-600">Last Service: {client.lastService}</Text>
        <Text className="text-gray-600">Next Service: {client.nextService}</Text>
        <View className="mt-2">
          <Text className="font-semibold">Active Services:</Text>
          {client.services.map((service, index) => (
            <View key={index} className="flex-row items-center mt-1">
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text className="ml-2">{service}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  </View>
);

// 👑 The main screen that shows either the list or a detail
export default function Social() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    setClients(localClients); // 💾 Loads the clients from the local JSON file
  }, []);

  // 🔄 If a client is selected, show their profile
  if (selectedClient) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ClientDetail 
          client={selectedClient} 
          onBack={() => setSelectedClient(null)} 
        />
      </SafeAreaView>
    );
  }

  // 🧱 Otherwise, show the list of client cards
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">My Clients</Text>
        <ScrollView>
          {clients.map((client) => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onPress={() => setSelectedClient(client)} 
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
