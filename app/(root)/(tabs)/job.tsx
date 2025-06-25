import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Modalize } from 'react-native-modalize';

const { width, height } = Dimensions.get('window');

const job = {
  title: 'Snow Shoveling',
  image: require('../../../assets/images/mowblo-logo1.jpg'),
  address: 'K1G 1V2',
  driveway: '2 car driveway',
  distance: '700m',
  price: 20,
  description: '',
  coordinate: {
    latitude: 45.4215,
    longitude: -75.6997,
  },
};

export default function JobScreen() {
  const modalRef = useRef<Modalize>(null);

  // Initial region for the map
  const initialRegion: Region = {
    latitude: job.coordinate.latitude,
    longitude: job.coordinate.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Open modal handler
  const openModal = () => {
    modalRef.current?.open();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {/* Real Map - absolutely fill the screen */}
      <View style={{ flex: 1 }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
          initialRegion={initialRegion}
          showsUserLocation={true}
        >
          <Marker
            coordinate={job.coordinate}
            onPress={openModal}
          >
            <View className="items-center">
              <Ionicons name="location" size={48} color="#3B82F6" />
              <View style={{ position: 'absolute', top: 12, left: 12 }} className="bg-white rounded-full p-1">
                <Ionicons name="snow" size={18} color="#1E293B" />
              </View>
            </View>
          </Marker>
        </MapView>
        {/* Search bar at bottom - above tab bar */}
        <View className="absolute left-0 w-full px-4 z-20" style={{ bottom: 96 }}>
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow">
            <Ionicons name="search" size={22} color="#888" className="mr-2" />
            <TextInput
              className="flex-1 text-base"
              placeholder="The Door Of Opportunity"
              editable={false}
              value={"The Door Of Opportunity"}
            />
            <TouchableOpacity className="ml-2">
              <Ionicons name="pencil" size={20} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity className="ml-2">
              <Ionicons name="archive" size={22} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Peek Card (no handle, just summary and prompt) - above tab bar */}
        <TouchableOpacity
          onPress={openModal}
          activeOpacity={0.9}
          className="absolute left-0 right-0 z-30 px-4"
          style={{ bottom: 160, elevation: 10 }}
        >
          <View className="bg-white rounded-2xl shadow-lg p-4 pb-5">
            <View className="flex-row items-center mb-2">
              <Image
                source={job.image}
                className="w-16 h-16 rounded-lg mr-3"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-lg font-bold mb-1">{job.title}</Text>
                <Text className="text-gray-500">{job.address} • {job.driveway} • {job.distance}</Text>
              </View>
              <Text className="text-green-600 font-bold text-lg">${job.price}</Text>
            </View>
            <Text className="text-gray-400 text-center mt-2">Swipe up for details</Text>
          </View>
        </TouchableOpacity>
        {/* Modalize Bottom Sheet (only Modalize's handle, prestige style) */}
        <Modalize
          ref={modalRef}
          snapPoint={340}
          modalHeight={height * 0.7}
          handlePosition="inside"
          modalStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 24, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 24 }}
          handleStyle={{ marginTop: 10, marginBottom: 10, backgroundColor: '#d1d5db', width: 48, height: 5, borderRadius: 3, alignSelf: 'center' }}
          withHandle
          panGestureEnabled
          closeOnOverlayTap
          disableScrollIfPossible
          openAnimationConfig={{ timing: { duration: 320, easing: (t) => t }, spring: { speed: 18, bounciness: 6 } }}
          overlayStyle={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        >
          <View style={{ paddingBottom: 16 }}>
            <View className="flex-row justify-between items-center mb-3 mt-2">
              <Text className="text-3xl font-bold">{job.title}</Text>
              <TouchableOpacity onPress={() => modalRef.current?.close()}>
                <Ionicons name="close" size={28} color="#888" />
              </TouchableOpacity>
            </View>
            <Image
              source={job.image}
              className="w-full h-40 rounded-xl mb-4"
              resizeMode="cover"
            />
            <View className="flex-row items-center mb-2">
              <Text className="text-base font-semibold mr-2">{job.address}</Text>
              <Text className="text-gray-500">{job.driveway}</Text>
              <Ionicons name="location" size={16} color="#888" style={{ marginLeft: 10, marginRight: 2 }} />
              <Text className="text-gray-500">{job.distance}</Text>
            </View>
            <Text className="text-2xl font-bold mb-2">${job.price}</Text>
            <TouchableOpacity className="bg-black py-3 rounded-lg mb-4">
              <Text className="text-white text-center text-lg font-semibold">Accept</Text>
            </TouchableOpacity>
            <Text className="text-base font-semibold mb-1">Description:</Text>
            <Text className="text-gray-700 min-h-[40px]">{job.description || 'No description provided.'}</Text>
          </View>
        </Modalize>
      </View>
    </SafeAreaView>
  );
}
