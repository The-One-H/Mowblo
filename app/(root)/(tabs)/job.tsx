import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import { Modalize } from 'react-native-modalize';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Firebase-compatible data structure
interface JobData {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High';
  price: number;
  currency: string;
  estimatedTime: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    fullAddress: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  requirements: string[];
  images: string[];
  client: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    profileImage: any;
  };
  jobDetails: {
    driveway: string;
    distance: string;
    createdAt: string;
    expiresAt: string;
    status: 'active' | 'in-progress' | 'completed' | 'cancelled';
  };
  tags: string[];
}

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
  job: JobData;
}

// Sample jobs data - Firebase compatible
const sampleJobs: JobData[] = [
  {
    id: 'job_001',
    title: 'Snow Shoveling',
    description: 'Professional snow removal service for residential driveways. Includes clearing snow from driveway, walkways, and around vehicles. Quick and reliable service.',
    category: 'Snow Removal',
    urgency: 'High',
    price: 20,
    currency: 'USD',
    estimatedTime: '45 min',
    address: {
      street: '123 Main St',
      city: 'Ottawa',
      state: 'ON',
      zipCode: 'K1G 1V2',
      fullAddress: '123 Main St, Ottawa, ON K1G 1V2'
    },
    location: {
      latitude: 45.4215,
      longitude: -75.6997,
    },
    requirements: ['Snow shovel', 'Ice scraper', 'Weather-appropriate clothing'],
    images: ['https://example.com/snow-job.jpg'],
    client: {
      id: 'client_001',
      name: 'John Smith',
      rating: 4.8,
      reviewCount: 127,
      profileImage: require('../../../assets/images/mowblo-logo1.jpg'),
    },
    jobDetails: {
      driveway: '2 car driveway',
      distance: '700m',
      createdAt: '2024-01-15T10:30:00Z',
      expiresAt: '2024-01-16T10:30:00Z',
      status: 'active'
    },
    tags: ['urgent', 'snow', 'driveway', 'residential']
  },
  {
    id: 'job_002',
    title: 'Lawn Mowing',
    description: 'Regular lawn maintenance including mowing, edging, and cleanup. Medium-sized backyard with some landscaping features.',
    category: 'Lawn Care',
    urgency: 'Medium',
    price: 35,
    currency: 'USD',
    estimatedTime: '60 min',
    address: {
      street: '456 Oak Ave',
      city: 'Ottawa',
      state: 'ON',
      zipCode: 'K2P 1L3',
      fullAddress: '456 Oak Ave, Ottawa, ON K2P 1L3'
    },
    location: {
      latitude: 45.4150,
      longitude: -75.6900,
    },
    requirements: ['Lawn mower', 'Edger', 'Safety equipment'],
    images: ['https://example.com/lawn-job.jpg'],
    client: {
      id: 'client_002',
      name: 'Sarah Johnson',
      rating: 4.9,
      reviewCount: 89,
      profileImage: require('../../../assets/images/mowblo-logo1.jpg'),
    },
    jobDetails: {
      driveway: '1 car driveway',
      distance: '1.2km',
      createdAt: '2024-01-15T09:15:00Z',
      expiresAt: '2024-01-17T09:15:00Z',
      status: 'active'
    },
    tags: ['lawn', 'mowing', 'maintenance', 'residential']
  },
  {
    id: 'job_003',
    title: 'Garden Cleanup',
    description: 'Fall garden cleanup including leaf removal, pruning, and general tidying. Large garden area with multiple flower beds.',
    category: 'Garden Care',
    urgency: 'Low',
    price: 50,
    currency: 'USD',
    estimatedTime: '90 min',
    address: {
      street: '789 Pine Rd',
      city: 'Ottawa',
      state: 'ON',
      zipCode: 'K1N 5T8',
      fullAddress: '789 Pine Rd, Ottawa, ON K1N 5T8'
    },
    location: {
      latitude: 45.4280,
      longitude: -75.6850,
    },
    requirements: ['Rake', 'Pruning shears', 'Garden gloves', 'Wheelbarrow'],
    images: ['https://example.com/garden-job.jpg'],
    client: {
      id: 'client_003',
      name: 'Mike Wilson',
      rating: 4.7,
      reviewCount: 203,
      profileImage: require('../../../assets/images/mowblo-logo1.jpg'),
    },
    jobDetails: {
      driveway: '3 car driveway',
      distance: '2.1km',
      createdAt: '2024-01-15T08:45:00Z',
      expiresAt: '2024-01-20T08:45:00Z',
      status: 'active'
    },
    tags: ['garden', 'cleanup', 'leaves', 'pruning']
  }
];

// Import job tracking functions
import { addJobToTracking, getAcceptedJobs } from '../../job-tracking';

export default function JobScreen() {
  const router = useRouter();

  const modalRef = useRef<Modalize>(null);
  const searchInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [isJobAccepted, setIsJobAccepted] = useState(false);
  const [isJobSaved, setIsJobSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>(sampleJobs);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);

  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 45.4215,
    longitude: -75.6997,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });



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
  }, []);

  // Filter jobs based on search query
  useEffect(() => {
    let filtered = sampleJobs;

    if (searchQuery.trim()) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.address.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredJobs(filtered);
  }, [searchQuery]);

  // Update map region when jobs change
  useEffect(() => {
    if (filteredJobs.length > 0) {
      const latitudes = filteredJobs.map(job => job.location.latitude);
      const longitudes = filteredJobs.map(job => job.location.longitude);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      setMapRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(maxLat - minLat, 0.01) * 1.5,
        longitudeDelta: Math.max(maxLng - minLng, 0.01) * 1.5,
      });
    }
  }, [filteredJobs]);

  // Open modal handler
  const openModal = (job: JobData) => {
    setSelectedJob(job);
    modalRef.current?.open();
  };

  // Handle job acceptance
  const handleAcceptJob = () => {
    if (!selectedJob) return;

    Alert.alert(
      'Accept Job',
      `Are you sure you want to accept this ${selectedJob.title} job for $${selectedJob.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            // Create job tracking entry
            const newJobTracking: JobTracking = {
              id: `tracking_${Date.now()}`,
              jobId: selectedJob.id,
              status: 'accepted',
              acceptedAt: new Date().toISOString(),
              job: selectedJob
            };

            addJobToTracking(newJobTracking);

            // Navigate to job tracking modal
            router.push({
              pathname: '/job-tracking',
              params: {
                trackingId: newJobTracking.id,
                jobId: selectedJob.id
              }
            });

            modalRef.current?.close();
          }
        }
      ]
    );
  };

  // Handle job saving
  const handleSaveJob = () => {
    setIsJobSaved(!isJobSaved);
    Alert.alert(
      isJobSaved ? 'Job Removed' : 'Job Saved',
      isJobSaved ? 'Job removed from your saved jobs.' : 'Job saved to your favorites!'
    );
  };

  // Handle search focus
  const handleSearchFocus = () => {
    try {
      setIsSearchFocused(true);
    } catch (error) {
      console.warn('Search focus error:', error);
    }
  };

  const handleSearchBlur = () => {
    try {
      setIsSearchFocused(false);
    } catch (error) {
      console.warn('Search blur error:', error);
    }
  };



  // Clear search
  const clearSearch = () => {
    try {
      setSearchQuery('');
      searchInputRef.current?.clear();
    } catch (error) {
      console.warn('Clear search error:', error);
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Snow Removal': return 'snow';
      case 'Lawn Care': return 'leaf';
      case 'Garden Care': return 'flower';
      case 'Cleaning': return 'water';
      case 'Maintenance': return 'construct';
      default: return 'briefcase';
    }
  };

  // Navigate to job inbox
  const openJobInbox = () => {
    router.push('/job-inbox');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Modern Map */}
      <View style={{ flex: 1 }}>
        <MapView

          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
          region={mapRegion}
          showsUserLocation={true}
          mapType="standard"
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsTraffic={false}
        >
          {filteredJobs.map((job) => (
            <Marker
              key={job.id}
              coordinate={job.location}
              onPress={() => openModal(job)}
            >
              <Animated.View
                className="items-center"
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: fadeAnim }]
                }}
              >
                <View className="bg-white rounded-full p-3 shadow-lg border-2 border-blue-500">
                  <Ionicons name="location" size={28} color="#3B82F6" />
                </View>
                <View className={`rounded-full p-2 mt-1 shadow-md ${getUrgencyColor(job.urgency)}`}>
                  <Ionicons
                    name={getCategoryIcon(job.category) as any}
                    size={14}
                    color="white"
                  />
                </View>
              </Animated.View>
            </Marker>
          ))}
        </MapView>

        {/* Job Inbox Button */}
        <Animated.View
          className="absolute top-20 left-4 z-20"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim }]
          }}
        >
          <TouchableOpacity
            onPress={openJobInbox}
            className="bg-white/90 backdrop-blur-xl rounded-full p-3 shadow-lg border border-white/20"
          >
            <Ionicons name="mail" size={24} color="#6B7280" />
            {getAcceptedJobs().length > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
                <Text className="text-white text-xs font-bold">{getAcceptedJobs().length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Modern Search Bar */}
        <Animated.View
          className="absolute left-0 w-full px-4 z-20"
          style={{
            bottom: 120,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View className={`flex-row items-center ${isSearchFocused ? 'bg-white shadow-2xl' : 'bg-white/95 backdrop-blur-xl'} rounded-3xl px-6 py-5 shadow-2xl border border-white/20`}>
            <View className="flex-row items-center flex-1">
              <Ionicons name="search" size={24} color="#6B7280" />
              <TextInput
                ref={searchInputRef}
                className="flex-1 text-base ml-3 font-medium"
                placeholder="Search jobs, locations, or categories..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                returnKeyType="search"
                blurOnSubmit={true}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                className="ml-3 p-2 rounded-full bg-gray-100"
                onPress={clearSearch}
              >
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>



        {/* Job Count Badge */}
        <Animated.View
          className="absolute top-20 right-4 z-20"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim }]
          }}
        >
          <View className="bg-white/90 backdrop-blur-xl rounded-full px-4 py-2 shadow-lg border border-white/20">
            <Text className="text-gray-700 font-semibold">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </Animated.View>

        {/* Enhanced Peek Card */}
        {selectedJob && (
          <Animated.View
            className="absolute left-0 right-0 z-30 px-4"
            style={{
              bottom: 280,
              elevation: 20,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <TouchableOpacity
              onPress={() => openModal(selectedJob)}
              activeOpacity={0.95}
            >
              <View className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
                <View className="flex-row items-center mb-4">
                  <Image
                    source={selectedJob.client.profileImage}
                    className="w-20 h-20 rounded-2xl mr-4"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-xl font-bold text-gray-900 mr-3">{selectedJob.title}</Text>
                      <View className="bg-blue-100 px-3 py-1 rounded-full">
                        <Text className="text-blue-700 text-xs font-semibold">{selectedJob.category}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="location" size={16} color="#6B7280" />
                      <Text className="text-gray-600 ml-1 text-sm">{selectedJob.address.fullAddress}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="time" size={16} color="#6B7280" />
                      <Text className="text-gray-600 ml-1 text-sm">{selectedJob.jobDetails.distance} • {selectedJob.estimatedTime}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-green-600 mb-1">${selectedJob.price}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#FBBF24" />
                      <Text className="text-gray-600 text-sm ml-1">{selectedJob.client.rating}</Text>
                      <Text className="text-gray-400 text-xs ml-1">({selectedJob.client.reviewCount})</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className={`px-3 py-1 rounded-full mr-2 ${getUrgencyColor(selectedJob.urgency)}`}>
                      <Text className="text-white text-xs font-semibold">{selectedJob.urgency} Priority</Text>
                    </View>
                  </View>
                  <Text className="text-gray-400 text-sm font-medium">Tap for details →</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Enhanced Modalize Bottom Sheet */}
        <Modalize
          ref={modalRef}
          snapPoint={400}
          modalHeight={height * 0.75}
          handlePosition="inside"
          modalStyle={{
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 24,
            paddingTop: 28,
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 30
          }}
          handleStyle={{
            marginTop: 12,
            marginBottom: 12,
            backgroundColor: '#D1D5DB',
            width: 56,
            height: 6,
            borderRadius: 3,
            alignSelf: 'center'
          }}
          withHandle
          panGestureEnabled
          closeOnOverlayTap
          disableScrollIfPossible
          openAnimationConfig={{
            timing: { duration: 350, easing: (t) => t },
            spring: { speed: 20, bounciness: 8 }
          }}
          overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}
        >
          {selectedJob && (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ paddingBottom: 24 }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                  <View className="flex-1">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{selectedJob.title}</Text>
                    <View className="flex-row items-center">
                      <View className="bg-blue-100 px-3 py-1 rounded-full mr-2">
                        <Text className="text-blue-700 text-xs font-semibold">{selectedJob.category}</Text>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${getUrgencyColor(selectedJob.urgency)}`}>
                        <Text className="text-white text-xs font-semibold">{selectedJob.urgency} Priority</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => modalRef.current?.close()}
                    className="p-2 rounded-full bg-gray-100"
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Job Image */}
                <Image
                  source={selectedJob.client.profileImage}
                  className="w-full h-48 rounded-2xl mb-6"
                  resizeMode="cover"
                />

                {/* Job Details */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location" size={20} color="#6B7280" />
                      <Text className="text-gray-700 font-semibold ml-2">{selectedJob.address.fullAddress}</Text>
                    </View>
                    <Text className="text-gray-600 ml-6">{selectedJob.jobDetails.driveway} • {selectedJob.jobDetails.distance}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-3xl font-bold text-green-600 mb-1">${selectedJob.price}</Text>
                    <Text className="text-gray-500 text-sm">Estimated time: {selectedJob.estimatedTime}</Text>
                  </View>
                </View>

                {/* Client Rating */}
                <View className="flex-row items-center mb-6 p-4 bg-gray-50 rounded-2xl">
                  <Image
                    source={selectedJob.client.profileImage}
                    className="w-12 h-12 rounded-full mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">{selectedJob.client.name}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#FBBF24" />
                      <Text className="text-gray-900 font-semibold ml-1">{selectedJob.client.rating}</Text>
                      <Text className="text-gray-600 ml-1">({selectedJob.client.reviewCount} reviews)</Text>
                    </View>
                  </View>
                </View>

                {/* Requirements */}
                {selectedJob.requirements.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Requirements</Text>
                    <View className="flex-row flex-wrap">
                      {selectedJob.requirements.map((req, index) => (
                        <View key={index} className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
                          <Text className="text-blue-700 text-sm">{req}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row space-x-3 mb-6">
                  <TouchableOpacity
                    className={`flex-1 py-4 rounded-2xl ${isJobAccepted ? 'bg-green-100' : 'bg-black'}`}
                    onPress={handleAcceptJob}
                    disabled={isJobAccepted}
                  >
                    <Text className={`text-center text-lg font-semibold ${isJobAccepted ? 'text-green-700' : 'text-white'}`}>
                      {isJobAccepted ? 'Job Accepted ✓' : 'Accept Job'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`p-4 rounded-2xl ${isJobSaved ? 'bg-blue-100' : 'bg-gray-100'}`}
                    onPress={handleSaveJob}
                  >
                    <Ionicons
                      name={isJobSaved ? "heart" : "heart-outline"}
                      size={24}
                      color={isJobSaved ? "#3B82F6" : "#6B7280"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Description */}
                <View className="bg-gray-50 rounded-2xl p-4">
                  <Text className="text-lg font-semibold text-gray-900 mb-3">Job Description</Text>
                  <Text className="text-gray-700 leading-6">{selectedJob.description}</Text>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </Modalize>
      </View>
    </SafeAreaView>
  );
}
