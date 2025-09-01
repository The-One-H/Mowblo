import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Alert, 
  Animated,
  FlatList,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Job tracking status
interface JobTracking {
  id: string;
  jobId: string;
  status: 'accepted' | 'en-route' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
  acceptedAt: string;
  enRouteAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  notes?: string;
  job: any;
}

// Import job tracking functions
import { getAcceptedJobs, updateJobStatus } from './job-tracking';

export default function JobInboxScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const [jobs, setJobs] = useState<JobTracking[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Animate components on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load jobs from global state
    setJobs(getAcceptedJobs());
  }, []);

  // Filter jobs based on selected filter
  const filteredJobs = jobs.filter(job => {
    if (selectedFilter === 'All') return true;
    return job.status === selectedFilter;
  });

  // Handle job selection
  const handleJobSelect = (job: JobTracking) => {
    router.push({
      pathname: '/job-tracking',
      params: { 
        trackingId: job.id,
        jobId: job.jobId
      }
    });
  };

  // Handle job cancellation
  const handleJobCancel = (job: JobTracking) => {
    Alert.alert(
      'Cancel Job',
      'Are you sure you want to cancel this job? This action cannot be undone.',
      [
        { text: 'Keep Job', style: 'cancel' },
        { 
          text: 'Cancel Job', 
          style: 'destructive',
          onPress: () => {
            // Update job status to cancelled
            const timestamp = new Date().toISOString();
            const updatedJob = updateJobStatus(job.id, 'cancelled', timestamp);
            if (updatedJob) {
              setJobs(getAcceptedJobs());
            }
          }
        }
      ]
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-500';
      case 'en-route': return 'bg-yellow-500';
      case 'arrived': return 'bg-orange-500';
      case 'in-progress': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return 'checkmark-circle';
      case 'en-route': return 'car';
      case 'arrived': return 'location';
      case 'in-progress': return 'construct';
      case 'completed': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Render job card
  const renderJobCard = ({ item }: { item: JobTracking }) => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity 
        onPress={() => handleJobSelect(item)}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mb-4"
        activeOpacity={0.95}
      >
        <View className="flex-row items-center mb-4">
          <Image
            source={item.job.client.profileImage}
            className="w-16 h-16 rounded-2xl mr-4"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-1">{item.job.title}</Text>
            <Text className="text-gray-600 text-sm">{item.job.address.fullAddress}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text className="text-gray-600 text-sm ml-1">{item.job.client.rating}</Text>
              <Text className="text-gray-400 text-xs ml-1">({item.job.client.reviewCount} reviews)</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-2xl font-bold text-green-600">${item.job.price}</Text>
            <View className={`px-3 py-1 rounded-full mt-2 ${getStatusColor(item.status)}`}>
              <Text className="text-white text-xs font-semibold capitalize">{item.status}</Text>
            </View>
          </View>
        </View>

        {/* Status Preview */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Current Status</Text>
          <View className="flex-row items-center">
            <View className={`rounded-full p-2 mr-3 ${getStatusColor(item.status)}`}>
              <Ionicons name={getStatusIcon(item.status)} size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium capitalize">{item.status}</Text>
              <Text className="text-gray-500 text-sm">
                {item.status === 'accepted' && `Accepted on ${formatDate(item.acceptedAt)}`}
                {item.status === 'en-route' && `En route since ${formatTime(item.enRouteAt!)}`}
                {item.status === 'arrived' && `Arrived at ${formatTime(item.arrivedAt!)}`}
                {item.status === 'in-progress' && `Started at ${formatTime(item.startedAt!)}`}
                {item.status === 'completed' && `Completed at ${formatTime(item.completedAt!)}`}
                {item.status === 'cancelled' && `Cancelled at ${formatTime(item.cancelledAt!)}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => handleJobSelect(item)}
            className="flex-1 bg-blue-500 py-3 rounded-2xl"
          >
            <Text className="text-center text-white font-semibold">View Details</Text>
          </TouchableOpacity>
          
          {item.status !== 'completed' && item.status !== 'cancelled' && (
            <TouchableOpacity
              onPress={() => handleJobCancel(item)}
              className="bg-red-500 px-4 py-3 rounded-2xl"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const filters = ['All', 'accepted', 'en-route', 'arrived', 'in-progress', 'completed', 'cancelled'];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        
        <View style={{ flex: 1 }}>
          {/* Header */}
          <Animated.View 
            className="absolute top-0 left-0 right-0 z-20 px-4 pt-4"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-white/90 backdrop-blur-xl rounded-full p-3 shadow-lg"
              >
                <Ionicons name="arrow-back" size={24} color="#6B7280" />
              </TouchableOpacity>
              
              <View className="bg-white/90 backdrop-blur-xl rounded-full px-4 py-2 shadow-lg">
                <Text className="text-gray-700 font-semibold">Job Inbox</Text>
              </View>
              
              <View className="bg-white/90 backdrop-blur-xl rounded-full px-3 py-2 shadow-lg">
                <Text className="text-gray-700 font-semibold">{jobs.length} Jobs</Text>
              </View>
            </View>
          </Animated.View>

          {/* Filter Tabs */}
          <Animated.View 
            className="absolute top-24 left-4 right-4 z-20"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-lg"
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-xl mr-2 ${
                    selectedFilter === filter ? 'bg-blue-500' : 'bg-transparent'
                  }`}
                >
                  <Text className={`font-semibold ${
                    selectedFilter === filter ? 'text-white' : 'text-gray-600'
                  }`}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Jobs List */}
          <View className="flex-1 pt-32 pb-8 px-4">
            {filteredJobs.length > 0 ? (
              <FlatList
                data={filteredJobs}
                renderItem={renderJobCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <Animated.View 
                className="flex-1 items-center justify-center"
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }}
              >
                <View className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                  <Ionicons name="mail-open" size={64} color="#9CA3AF" />
                  <Text className="text-gray-500 text-lg font-semibold mt-4 text-center">
                    No jobs found
                  </Text>
                  <Text className="text-gray-400 text-sm text-center mt-2">
                    {selectedFilter === 'All' 
                      ? "You haven't accepted any jobs yet" 
                      : `No ${selectedFilter} jobs found`
                    }
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-blue-500 py-3 rounded-2xl mt-6"
                  >
                    <Text className="text-center text-white font-semibold">Browse Jobs</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
