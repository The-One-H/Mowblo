import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Home from './home';
import Client from './client';
import Setting from './setting';
import Stats from './stats';
import Wallet from './wallet';
import Weather from './weather';

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

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Client') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Weather') {
              iconName = focused ? 'cloudy' : 'cloudy-outline';
            } else if (route.name === 'Wallet') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Stats') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            } else if (route.name === 'Setting') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Client" component={Client} />
        <Tab.Screen name="Weather" component={Weather} />
        <Tab.Screen name="Wallet" component={Wallet} />
        <Tab.Screen name="Stats" component={Stats} />
        <Tab.Screen name="Setting" component={Setting} />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
};

export default TabsLayout;