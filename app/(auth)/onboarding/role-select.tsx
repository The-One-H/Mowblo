import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUserProfile } from '../../../services/firebase';
import { useStore } from '../../../store/useStore';

const { width } = Dimensions.get('window');

export default function RoleSelect() {
    const router = useRouter();
    const { createProfile } = useUserProfile();
    const { setUserRole } = useStore();

    const selectRole = async (role: 'customer' | 'pro') => {
        setUserRole(role);
        await createProfile({ role });

        if (role === 'pro') {
            router.push('/(auth)/onboarding/pro-onboarding');
        } else {
            router.replace('/(customer)/home');
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
                    <Text style={styles.title}>How will you use{'\n'}Mowblo?</Text>
                    <Text style={styles.subtitle}>You can always switch later</Text>
                </Animated.View>

                {/* Role Cards */}
                <View style={styles.cards}>
                    {/* Customer Card */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => selectRole('customer')}
                            style={styles.card}
                        >
                            <View style={[styles.iconBg, { backgroundColor: '#EEF6FB' }]}>
                                <Ionicons name="home" size={36} color="#4A9EC4" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>I need help</Text>
                                <Text style={styles.cardSub}>
                                    Book a Pro for lawn mowing{'\n'}or snow removal
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color="#C4CDD5" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Pro Card */}
                    <Animated.View entering={FadeInDown.delay(350).duration(400)}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => selectRole('pro')}
                            style={styles.card}
                        >
                            <View style={[styles.iconBg, { backgroundColor: '#F0F9EC' }]}>
                                <Ionicons name="construct" size={36} color="#5BAA48" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>I want to earn</Text>
                                <Text style={styles.cardSub}>
                                    Make money on your own{'\n'}schedule as a Pro
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color="#C4CDD5" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Footer */}
                <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.footer}>
                    <Text style={styles.footerText}>
                        Already signed up?{' '}
                        <Text
                            style={styles.footerLink}
                            onPress={() => router.replace('/(customer)/home')}
                        >
                            Skip →
                        </Text>
                    </Text>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#1A2332',
        letterSpacing: -0.5,
        lineHeight: 42,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E99A4',
        marginTop: 8,
        fontWeight: '500',
    },
    cards: {
        gap: 14,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    iconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1A2332',
    },
    cardSub: {
        fontSize: 13,
        color: '#8E99A4',
        marginTop: 4,
        lineHeight: 18,
    },
    footer: {
        marginTop: 'auto',
        paddingBottom: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#8E99A4',
    },
    footerLink: {
        color: '#4A9EC4',
        fontWeight: '600',
    },
});
