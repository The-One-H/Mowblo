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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Modalize } from 'react-native-modalize';

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

// Global job tracking state (in real app, this would be in Firebase)
// Using a module-level variable to share state between components
let acceptedJobs: JobTracking[] = [];

// Function to add job to global state
export const addJobToTracking = (job: JobTracking) => {
  acceptedJobs.push(job);
};

// Function to get all jobs
export const getAcceptedJobs = () => {
  return acceptedJobs;
};

// Function to update job status
export const updateJobStatus = (jobId: string, newStatus: string, timestamp: string) => {
  const index = acceptedJobs.findIndex(job => job.id === jobId);
  if (index !== -1) {
    const updatedJob = { ...acceptedJobs[index] };
    updatedJob.status = newStatus as any;
    
    switch (newStatus) {
      case 'en-route':
        updatedJob.enRouteAt = timestamp;
        break;
      case 'arrived':
        updatedJob.arrivedAt = timestamp;
        break;
      case 'in-progress':
        updatedJob.startedAt = timestamp;
        break;
      case 'completed':
        updatedJob.completedAt = timestamp;
        break;
      case 'cancelled':
        updatedJob.cancelledAt = timestamp;
        break;
    }
    
    acceptedJobs[index] = updatedJob;
    return updatedJob;
  }
  return null;
};

export default function JobTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const modalRef = useRef<Modalize>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const [jobTracking, setJobTracking] = useState<JobTracking | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('accepted');

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

    // Find the job tracking data
    const trackingId = params.trackingId as string;
    const foundTracking = acceptedJobs.find(job => job.id === trackingId);
    if (foundTracking) {
      setJobTracking(foundTracking);
      setCurrentStatus(foundTracking.status);
    }
  }, [params.trackingId]);

  // Handle status update
  const handleStatusUpdate = (newStatus: string) => {
    if (!jobTracking) return;

    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this job as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => {
            const timestamp = new Date().toISOString();
            const updatedJob = updateJobStatus(jobTracking.id, newStatus, timestamp);
            if (updatedJob) {
              setJobTracking(updatedJob);
              setCurrentStatus(newStatus);
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

  if (!jobTracking) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-lg">Loading job details...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

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
                <Text className="text-gray-700 font-semibold">Job Tracking</Text>
              </View>
              
              <TouchableOpacity
                onPress={() => router.push('/job-inbox')}
                className="bg-white/90 backdrop-blur-xl rounded-full p-3 shadow-lg"
              >
                <Ionicons name="mail" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Job Details Card */}
          <Animated.View 
            className="absolute top-24 left-4 right-4 z-20"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <View className="flex-row items-center mb-4">
                <Image
                  source={jobTracking.job.client.profileImage}
                  className="w-16 h-16 rounded-2xl mr-4"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 mb-1">{jobTracking.job.title}</Text>
                  <Text className="text-gray-600 text-sm">{jobTracking.job.address.fullAddress}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="star" size={16} color="#FBBF24" />
                    <Text className="text-gray-600 text-sm ml-1">{jobTracking.job.client.rating}</Text>
                    <Text className="text-gray-400 text-xs ml-1">({jobTracking.job.client.reviewCount} reviews)</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-2xl font-bold text-green-600">${jobTracking.job.price}</Text>
                  <View className={`px-3 py-1 rounded-full mt-2 ${getStatusColor(currentStatus)}`}>
                    <Text className="text-white text-xs font-semibold capitalize">{currentStatus}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Status Timeline */}
          <Animated.View 
            className="absolute top-48 left-4 right-4 z-20"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Job Progress</Text>
              
              {/* Timeline */}
              <View className="space-y-4">
                {/* Accepted */}
                <View className="flex-row items-center">
                  <View className="bg-green-500 rounded-full p-2 mr-4">
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">Job Accepted</Text>
                    <Text className="text-gray-500 text-sm">{formatTime(jobTracking.acceptedAt)}</Text>
                  </View>
                </View>

                {/* En Route */}
                <View className="flex-row items-center">
                  <View className={`rounded-full p-2 mr-4 ${jobTracking.enRouteAt ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                    <Ionicons name="car" size={20} color={jobTracking.enRouteAt ? "white" : "#9CA3AF"} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${jobTracking.enRouteAt ? 'text-gray-900' : 'text-gray-400'}`}>
                      En Route
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {jobTracking.enRouteAt ? formatTime(jobTracking.enRouteAt) : 'Not started'}
                    </Text>
                  </View>
                  {!jobTracking.enRouteAt && currentStatus === 'accepted' && (
                    <TouchableOpacity
                      onPress={() => handleStatusUpdate('en-route')}
                      className="bg-blue-500 px-3 py-1 rounded-full"
                    >
                      <Text className="text-white text-xs font-semibold">Start</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Arrived */}
                <View className="flex-row items-center">
                  <View className={`rounded-full p-2 mr-4 ${jobTracking.arrivedAt ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    <Ionicons name="location" size={20} color={jobTracking.arrivedAt ? "white" : "#9CA3AF"} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${jobTracking.arrivedAt ? 'text-gray-900' : 'text-gray-400'}`}>
                      Arrived at Location
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {jobTracking.arrivedAt ? formatTime(jobTracking.arrivedAt) : 'Not started'}
                    </Text>
                  </View>
                  {!jobTracking.arrivedAt && jobTracking.enRouteAt && currentStatus === 'en-route' && (
                    <TouchableOpacity
                      onPress={() => handleStatusUpdate('arrived')}
                      className="bg-blue-500 px-3 py-1 rounded-full"
                    >
                      <Text className="text-white text-xs font-semibold">Mark Arrived</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* In Progress */}
                <View className="flex-row items-center">
                  <View className={`rounded-full p-2 mr-4 ${jobTracking.startedAt ? 'bg-purple-500' : 'bg-gray-300'}`}>
                    <Ionicons name="construct" size={20} color={jobTracking.startedAt ? "white" : "#9CA3AF"} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${jobTracking.startedAt ? 'text-gray-900' : 'text-gray-400'}`}>
                      Work in Progress
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {jobTracking.startedAt ? formatTime(jobTracking.startedAt) : 'Not started'}
                    </Text>
                  </View>
                  {!jobTracking.startedAt && jobTracking.arrivedAt && currentStatus === 'arrived' && (
                    <TouchableOpacity
                      onPress={() => handleStatusUpdate('in-progress')}
                      className="bg-blue-500 px-3 py-1 rounded-full"
                    >
                      <Text className="text-white text-xs font-semibold">Start Work</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Completed */}
                <View className="flex-row items-center">
                  <View className={`rounded-full p-2 mr-4 ${jobTracking.completedAt ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <Ionicons name="checkmark-done-circle" size={20} color={jobTracking.completedAt ? "white" : "#9CA3AF"} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${jobTracking.completedAt ? 'text-gray-900' : 'text-gray-400'}`}>
                      Job Completed
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {jobTracking.completedAt ? formatTime(jobTracking.completedAt) : 'Not completed'}
                    </Text>
                  </View>
                  {!jobTracking.completedAt && jobTracking.startedAt && currentStatus === 'in-progress' && (
                    <TouchableOpacity
                      onPress={() => handleStatusUpdate('completed')}
                      className="bg-green-500 px-3 py-1 rounded-full"
                    >
                      <Text className="text-white text-xs font-semibold">Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            className="absolute bottom-8 left-4 right-4 z-20"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => router.push('/job-inbox')}
                className="flex-1 bg-white/90 backdrop-blur-xl py-4 rounded-2xl shadow-lg border border-white/20"
              >
                <Text className="text-center text-gray-700 font-semibold">View All Jobs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-1 bg-black py-4 rounded-2xl shadow-lg"
              >
                <Text className="text-center text-white font-semibold">Back to Map</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
}
