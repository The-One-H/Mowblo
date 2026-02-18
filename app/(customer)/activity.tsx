import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useJobs, Job } from '../../services/firebase';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    posted: { bg: '#4A9EC420', text: '#4A9EC4', label: 'Pending' },
    accepted: { bg: '#F6AD5520', text: '#F6AD55', label: 'Accepted' },
    in_progress: { bg: '#63B3ED20', text: '#63B3ED', label: 'In Progress' },
    completed: { bg: '#68D39120', text: '#68D391', label: 'Completed' },
    cancelled: { bg: '#E5393520', text: '#E53935', label: 'Cancelled' },
};

export default function ActivityScreen() {
    const { userId } = useAuth();
    const router = useRouter();
    const { jobs: pendingJobs, loading: l1 } = useJobs('customer', userId, ['posted']);
    const { jobs: activeJobs, loading: l2 } = useJobs('customer', userId, ['accepted', 'in_progress']);
    const { jobs: completedJobs, loading: l3 } = useJobs('customer', userId, ['completed']);

    const loading = l1 || l2 || l3;
    const allJobs = [...activeJobs, ...pendingJobs, ...completedJobs];

    const renderJobCard = (job: Job, index: number) => {
        const status = STATUS_COLORS[job.status] || STATUS_COLORS.posted;
        return (
            <Animated.View
                key={job.id}
                entering={FadeInDown.delay(index * 80).duration(300)}
            >
                <View style={styles.jobCard}>
                    <View style={styles.jobCardHeader}>
                        <View style={styles.jobIconBg}>
                            <Ionicons
                                name={(job.type === 'snow' ? 'snow' : job.type === 'lawn' ? 'leaf' : 'construct') as any}
                                size={20}
                                color={job.type === 'snow' ? Colors.primary.blue : Colors.primary.green}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.jobTitle}>{job.title || 'Untitled Job'}</Text>
                            <Text style={styles.jobAddress}>{job.location?.address || 'No address'}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                        </View>
                    </View>

                    <View style={styles.jobCardDetails}>
                        <View style={styles.detailItem}>
                            <Ionicons name="calendar-outline" size={14} color={Colors.text.grayMid} />
                            <Text style={styles.detailText}>{job.schedule?.date || 'Flexible'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="time-outline" size={14} color={Colors.text.grayMid} />
                            <Text style={styles.detailText}>{job.schedule?.startTime || 'Flexible'}</Text>
                        </View>
                        <Text style={styles.priceText}>${job.price?.toFixed(2) || '0.00'}</Text>
                    </View>

                    {/* Review CTA for completed jobs */}
                    {job.status === 'completed' && !job.reviewed && (
                        <TouchableOpacity
                            style={styles.reviewBtn}
                            onPress={() =>
                                router.push({
                                    pathname: '/(customer)/review-job',
                                    params: { jobId: job.id, proId: job.proId, proName: 'Your Pro' },
                                })
                            }
                        >
                            <Ionicons name="star-outline" size={18} color="#F6D155" />
                            <Text style={styles.reviewBtnText}>Leave a Review</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Activity</Text>
                </View>
            </SafeAreaView>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary.blue} />
                    </View>
                )}

                {!loading && allJobs.length === 0 && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="time-outline" size={48} color={Colors.text.grayMid} />
                        </View>
                        <Text style={styles.emptyTitle}>No bookings yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your completed and upcoming services will appear here.
                        </Text>
                    </View>
                )}

                {/* Active jobs */}
                {activeJobs.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Active</Text>
                        {activeJobs.map((job, i) => renderJobCard(job, i))}
                    </>
                )}

                {/* Pending jobs */}
                {pendingJobs.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Pending</Text>
                        {pendingJobs.map((job, i) => renderJobCard(job, i))}
                    </>
                )}

                {/* Completed jobs */}
                {completedJobs.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Completed</Text>
                        {completedJobs.map((job, i) => renderJobCard(job, i))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A2332',
        letterSpacing: -0.5,
    },
    loadingContainer: {
        paddingTop: 60,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A2332',
        marginTop: 24,
        marginBottom: 12,
    },
    jobCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    jobCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    jobIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F0F3F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A2332',
    },
    jobAddress: {
        fontSize: 13,
        color: Colors.text.grayMid,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    jobCardDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F3F6',
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 13,
        color: Colors.text.grayMid,
    },
    priceText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A2332',
        marginLeft: 'auto',
    },
    reviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#F6D155',
    },
    reviewBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#D69E2E',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEF1F4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A2332',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.text.grayMid,
        textAlign: 'center',
        maxWidth: 260,
    },
});
