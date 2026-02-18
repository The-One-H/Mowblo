import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated as RNAnimated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');
const BAR_WIDTH = width * 0.6;

export default function Index() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();
    const [ready, setReady] = useState(false);

    // Animated progress bar
    const progress = useRef(new RNAnimated.Value(0)).current;
    const logoScale = useRef(new RNAnimated.Value(0.8)).current;
    const logoOpacity = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        // Logo entrance
        RNAnimated.parallel([
            RNAnimated.spring(logoScale, {
                toValue: 1,
                damping: 12,
                stiffness: 100,
                useNativeDriver: true,
            }),
            RNAnimated.timing(logoOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Progress bar animation
        RNAnimated.timing(progress, {
            toValue: 0.7,
            duration: 1200,
            useNativeDriver: false,
        }).start();
    }, []);

    // When auth loads, finish the bar and navigate
    useEffect(() => {
        if (!isLoaded) return;

        RNAnimated.timing(progress, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
        }).start(() => {
            setReady(true);
        });
    }, [isLoaded]);

    useEffect(() => {
        if (!ready) return;

        const timer = setTimeout(() => {
            if (isSignedIn) {
                router.replace('/(customer)/home');
            } else {
                router.replace('/(auth)/welcome');
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [ready]);

    const barWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, BAR_WIDTH],
    });

    return (
        <View style={styles.container}>
            {/* Logo */}
            <RNAnimated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
            >
                <Image
                    source={require('../assets/images/Mowblo-Logo.jpg')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </RNAnimated.View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <RNAnimated.View style={[styles.progressFill, { width: barWidth }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 180,
        height: 180,
        borderRadius: 36,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 120,
        alignItems: 'center',
    },
    progressTrack: {
        width: BAR_WIDTH,
        height: 4,
        backgroundColor: '#E8ECF0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: 4,
        backgroundColor: '#1A2332',
        borderRadius: 2,
    },
});