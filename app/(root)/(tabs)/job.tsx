import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

// Define the Job type
interface Job {
  id: number;
  clientName: string;
  address: string;
  serviceType: 'lawn' | 'snow';
  description: string;
  price: number;
  date: string;
}

// Mock data - Replace with your actual data source
const mockJobs: Job[] = [
  {
    id: 1,
    clientName: 'John Smith',
    address: '1226 University Dr',
    serviceType: 'lawn',
    description: 'Need lawn mowing service for a 1/4 acre lot',
    price: 50,
    date: '2024-03-25',
  },
  {
    id: 2,
    clientName: 'Sarah Johnson',
    address: '845 Oak Street',
    serviceType: 'snow',
    description: 'Need driveway and walkway shoveled',
    price: 35,
    date: '2024-03-26',
  },
];

const JobCard = ({ job, onPress }: { job: Job; onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-white rounded-xl p-4 mb-3 shadow-sm"
  >
    <View className="flex-row items-center mb-3">
      <View className="bg-green-500 p-2 rounded-full mr-3">
        <Ionicons 
          name={job.serviceType === 'lawn' ? 'leaf' : 'snow'} 
          size={24} 
          color="white" 
        />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold mb-1">{job.clientName}</Text>
        <Text className="text-gray-500">{job.address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="gray" />
    </View>
    <View className="flex-row justify-between items-center">
      <Text className="text-green-500 font-bold">${job.price}</Text>
      <Text className="text-gray-500">{job.date}</Text>
    </View>
  </TouchableOpacity>
);

const JobModal = ({ job, isVisible, onClose }: { job: Job; isVisible: boolean; onClose: () => void }) => (
  <Modal
    isVisible={isVisible}
    onBackdropPress={onClose}
    onBackButtonPress={onClose}
    className="m-0 justify-end"
  >
    <View className="bg-white rounded-t-2xl p-5 max-h-[80%]">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-bold">Job Request</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="mb-5">
        <Text className="text-xl font-bold mb-1">{job.clientName}</Text>
        <Text className="text-gray-500 mb-3">{job.address}</Text>
        
        <View className="flex-row items-center mb-3">
          <Ionicons 
            name={job.serviceType === 'lawn' ? 'leaf' : 'snow'} 
            size={20} 
            color="#4CAF50" 
          />
          <Text className="ml-2 text-green-500">
            {job.serviceType === 'lawn' ? 'Lawn Service' : 'Snow Removal'}
          </Text>
        </View>

        <Text className="text-base mb-4 leading-6">{job.description}</Text>
        
        <View className="flex-row items-center mb-3">
          <Text className="text-base mr-2">Price:</Text>
          <Text className="text-lg font-bold text-green-500">${job.price}</Text>
        </View>

        <Text className="text-gray-500">Date: {job.date}</Text>
      </View>

      <View className="flex-row justify-between mt-5">
        <TouchableOpacity className="bg-green-500 p-4 rounded-lg flex-1 mr-2">
          <Text className="text-white text-center font-bold">Accept Job</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-gray-100 p-4 rounded-lg flex-1 ml-2"
          onPress={onClose}
        >
          <Text className="text-gray-600 text-center font-bold">Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function Jobs() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleJobPress = (job: Job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Available Jobs</Text>
      </View>
      
      <FlatList
        data={mockJobs}
        renderItem={({ item }) => (
          <JobCard 
            job={item} 
            onPress={() => handleJobPress(item)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
      />

      {selectedJob && (
        <JobModal
          job={selectedJob}
          isVisible={isModalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedJob(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}
