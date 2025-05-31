import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Feed from './feed';
import Community from './community';
import You from './you';
import Wallet from './wallet';
import Job from './job';

const Tab = createBottomTabNavigator();

const TabsLayout = () => {
  return (
    <SafeAreaProvider>
      <Tab.Navigator 
        screenOptions={({ route }) => ({ 
          headerShown: false,
          tabBarStyle: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: 'black',
            position: 'absolute',

          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Job') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'Feed') {
              iconName = focused ? 'newspaper' : 'newspaper-outline';
            } else if (route.name === 'Community') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Wallet') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'You') {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Job" component={Job} />
        <Tab.Screen name="Feed" component={Feed} />
        <Tab.Screen name="Community" component={Community} />
        <Tab.Screen name="Wallet" component={Wallet} />
        <Tab.Screen name="You" component={You} />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
};

export default TabsLayout;