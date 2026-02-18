import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStore } from '../../store/useStore';
import { useJobs } from '../../services/firebase';
import { Colors } from '../../constants/theme';

export default function CustomerHome() {
    const router = useRouter();
    const { user } = useUser();
    const { userId } = useAuth();
    const { activeService, setActiveService } = useStore();
    const { jobs: pendingJobs } = useJobs('customer', userId, ['posted']);
    const { jobs: activeJobs } = useJobs('customer', userId, ['accepted', 'in_progress']);
    const { jobs: completedJobs } = useJobs('customer', userId, ['completed']);

    const firstName = user?.firstName || 'there';

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Header */}
                <SafeAreaView edges={['top']}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>Hey {firstName} 👋</Text>
                            <TouchableOpacity style={styles.addressRow}>
                                <Ionicons name="location" size={16} color={Colors.primary.blue} />
                                <Text style={styles.addressText}>Set your address</Text>
                                <Ionicons name="chevron-down" size={14} color="#8E99A4" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.avatarButton}
                            onPress={() => router.push('/(customer)/account')}
                        >
                            <View style={styles.avatarBg}>
                                <Text style={styles.avatarText}>
                                    {firstName[0]?.toUpperCase() || 'M'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {/* Seasonal Banner */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                    <View style={[styles.alertBanner, { backgroundColor: activeService === 'snow' ? '#EEF6FB' : '#F0F9EC' }]}>
                        <Text style={styles.alertEmoji}>{activeService === 'snow' ? '❄️' : '🌿'}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.alertTitle}>
                                {activeService === 'snow' ? 'Snow season is here!' : 'Perfect mowing weather!'}
                            </Text>
                            <Text style={styles.alertSub}>
                                {activeService === 'snow' ? 'Book a Pro before they fill up.' : 'Keep your lawn fresh.'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.alertBtn, { backgroundColor: activeService === 'snow' ? Colors.primary.blue : Colors.primary.green }]}
                            onPress={() => router.push('/(customer)/create-job')}
                        >
                            <Text style={styles.alertBtnText}>Book</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Service Cards */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>What do you need?</Text>
                    <View style={styles.serviceCards}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => { setActiveService('lawn'); router.push('/(customer)/create-job'); }}
                            style={[styles.serviceCard, { backgroundColor: '#F0F9EC' }]}
                        >
                            <View style={[styles.serviceIcon, { backgroundColor: '#5BAA48' }]}>
                                <Ionicons name="leaf" size={24} color="#fff" />
                            </View>
                            <Text style={styles.serviceName}>Lawn{'\n'}Mowing</Text>
                            <Text style={styles.servicePrice}>From $35</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => { setActiveService('snow'); router.push('/(customer)/create-job'); }}
                            style={[styles.serviceCard, { backgroundColor: '#EEF6FB' }]}
                        >
                            <View style={[styles.serviceIcon, { backgroundColor: '#4A9EC4' }]}>
                                <Ionicons name="snow" size={24} color="#fff" />
                            </View>
                            <Text style={styles.serviceName}>Snow{'\n'}Removal</Text>
                            <Text style={styles.servicePrice}>From $45</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Active Jobs */}
                {activeJobs.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
                        <Text style={styles.sectionTitle}>In Progress</Text>
                        {activeJobs.map((job) => (
                            <View key={job.id} style={styles.jobCard}>
                                <View style={[styles.statusDot, { backgroundColor: '#F6AD55' }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.jobTitle}>{job.title}</Text>
                                    <Text style={styles.jobSub}>{job.location.address} · {job.status}</Text>
                                </View>
                                <Text style={styles.jobPrice}>${job.price}</Text>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Pending Jobs */}
                {pendingJobs.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.section}>
                        <Text style={styles.sectionTitle}>Pending ({pendingJobs.length})</Text>
                        {pendingJobs.map((job) => (
                            <View key={job.id} style={styles.jobCard}>
                                <View style={[styles.statusDot, { backgroundColor: '#63B3ED' }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.jobTitle}>{job.title}</Text>
                                    <Text style={styles.jobSub}>{job.location.address}</Text>
                                </View>
                                <Text style={styles.jobPrice}>${job.price}</Text>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Completed Jobs */}
                {completedJobs.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
                        <Text style={styles.sectionTitle}>Completed</Text>
                        {completedJobs.slice(0, 3).map((job) => (
                            <View key={job.id} style={styles.jobCard}>
                                <View style={[styles.statusDot, { backgroundColor: '#68D391' }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.jobTitle}>{job.title}</Text>
                                    <Text style={styles.jobSub}>{job.location.address}</Text>
                                </View>
                                <Text style={styles.jobPrice}>${job.price}</Text>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Empty state if no jobs */}
                {pendingJobs.length === 0 && activeJobs.length === 0 && completedJobs.length === 0 && (
                    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
                        <View style={styles.emptyCard}>
                            <Ionicons name="sparkles-outline" size={32} color="#8E99A4" />
                            <Text style={styles.emptyTitle}>No jobs yet</Text>
                            <Text style={styles.emptySub}>Tap the + button to post your first job!</Text>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F8FA' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
    },
    greeting: { fontSize: 28, fontWeight: '800', color: '#1A2332', letterSpacing: -0.5 },
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    addressText: { fontSize: 14, color: '#8E99A4', fontWeight: '500' },
    avatarButton: { marginLeft: 'auto' },
    avatarBg: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#1A2332', alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    alertBanner: {
        marginHorizontal: 20, borderRadius: 16, flexDirection: 'row',
        alignItems: 'center', padding: 16, gap: 12,
    },
    alertEmoji: { fontSize: 28 },
    alertTitle: { fontSize: 15, fontWeight: '700', color: '#1A2332' },
    alertSub: { fontSize: 12, color: '#8E99A4', marginTop: 2 },
    alertBtn: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
    },
    alertBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    section: { paddingHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A2332', marginBottom: 14 },
    serviceCards: { flexDirection: 'row', gap: 14 },
    serviceCard: {
        flex: 1, borderRadius: 20, padding: 18, minHeight: 170, justifyContent: 'space-between',
    },
    serviceIcon: {
        width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    },
    serviceName: { fontSize: 19, fontWeight: '800', color: '#1A2332', marginTop: 12, letterSpacing: -0.3 },
    servicePrice: { fontSize: 14, fontWeight: '600', color: '#1A2332', marginTop: 4 },
    jobCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    jobTitle: { fontSize: 15, fontWeight: '700', color: '#1A2332' },
    jobSub: { fontSize: 12, color: '#8E99A4', marginTop: 2 },
    jobPrice: { fontSize: 16, fontWeight: '800', color: '#1A2332' },
    emptyCard: {
        backgroundColor: '#FFFFFF', borderRadius: 20, padding: 32,
        alignItems: 'center', gap: 8,
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1A2332' },
    emptySub: { fontSize: 13, color: '#8E99A4', textAlign: 'center' },
});
