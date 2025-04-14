import { router } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';

export default function NotFound() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleGoBack = () => {
    // Navigate back or to the home screen
    console.log('Go back to home or previous page');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={{ uri: 'https://example.com/404-image.png' }} // Replace with a relevant 404 image URL
          style={styles.image}
        />
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Oops! The page you're looking for doesn't exist.</Text>
        <TouchableOpacity style={styles.button} onPress={() => {
          router.replace("/");
        }}>
          <Text style={styles.buttonText}>Go Back Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#58CC02',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});