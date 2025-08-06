import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const TabsLayout = () => {
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={({ route }) => ({ 
          headerShown: false,
          tabBarStyle: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: 'black',
            position: 'absolute',
          },
          animation: 'shift',
          tabBarButton: (props) => <TouchableOpacity {...props} delayLongPress={100000} />,
        })}
      >
        <Tabs.Screen
          name="job"
          options={{
            title: 'Job',
            tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'newspaper' : 'newspaper-outline'} size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="you"
          options={{
            title: 'You',
            tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
};

export default TabsLayout;