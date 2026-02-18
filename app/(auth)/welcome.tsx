import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const snowflakeX = useSharedValue(-120);
  const leafX = useSharedValue(120);
  const taglineOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(60);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    snowflakeX.value = withSpring(0, { damping: 14, stiffness: 80 });
    leafX.value = withSpring(0, { damping: 14, stiffness: 80 });
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    buttonsY.value = withDelay(900, withSpring(0, { damping: 12 }));
    buttonsOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
  }, []);

  const snowflakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: snowflakeX.value }],
  }));

  const leafStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leafX.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Diagonal gradient background */}
      <LinearGradient
        colors={['#4A9EC4', '#6BB8D9', '#7DC46A', '#5BAA48']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle overlay pattern */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.08)' }]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          {/* Animated icons */}
          <View style={styles.iconRow}>
            <Animated.View style={snowflakeStyle}>
              <Ionicons name="snow" size={52} color="rgba(255,255,255,0.9)" />
            </Animated.View>
            <View style={{ width: 16 }} />
            <Animated.View style={leafStyle}>
              <Ionicons name="leaf" size={52} color="rgba(255,255,255,0.9)" />
            </Animated.View>
          </View>

          {/* Brand name */}
          <Animated.Text
            entering={FadeIn.delay(400).duration(500)}
            style={styles.brandName}
          >
            MOWBLO
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, taglineStyle]}>
            Your yard. Your snow. Your way.
          </Animated.Text>
        </View>

        {/* CTA Buttons */}
        <Animated.View style={[styles.buttonSection, buttonsStyle]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(auth)/sign-up')}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            style={styles.proLink}
          >
            <Text style={styles.proLinkText}>
              Want to earn money?{' '}
              <Text style={styles.proLinkBold}>Join as a Pro</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginTop: 8,
  },
  buttonSection: {
    paddingBottom: 40,
    gap: 14,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#1A2332',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  proLink: {
    marginTop: 8,
    alignItems: 'center',
  },
  proLinkText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  proLinkBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});