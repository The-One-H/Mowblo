import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
    TextInput,
    Switch,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../constants/theme';
import { useReviews, useJobs } from '../../services/firebase';

const BADGES = [
    { icon: 'flash', label: 'Quick Responder', color: '#F6AD55' },
    { icon: 'star', label: 'Top Rated', color: '#F6D155' },
    { icon: 'snow', label: 'Snow Expert', color: '#63B3ED' },
    { icon: 'leaf', label: 'Lawn Master', color: '#68D391' },
    { icon: 'ribbon', label: '10 Jobs', color: '#D183ED' },
];

const SECTIONS = [
    { id: 'reviews', label: 'Reviews', icon: 'chatbubbles' },
    { id: 'jobs', label: 'Job History', icon: 'briefcase' },
    { id: 'badges', label: 'Badges & Awards', icon: 'ribbon' },
];

export default function ProAccountScreen() {
    const { signOut } = useAuth();
    const { userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const { reviews } = useReviews(userId);
    const { jobs: completedJobs } = useJobs('pro', userId, ['completed']);
    const { jobs: allJobs } = useJobs('pro', userId);

    const firstName = user?.firstName || 'Pro';
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '5.0';

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                    router.replace('/(auth)/welcome');
                },
            },
        ]);
    };

    const SETTINGS_ITEMS = [
        {
            icon: 'person-outline',
            label: 'Edit Profile',
            onPress: () =>
                Alert.alert('Edit Profile', 'Profile info is managed via your Clerk account.', [
                    { text: 'OK' },
                    { text: 'Open Settings', onPress: () => Linking.openURL('https://accounts.clerk.dev') },
                ]),
        },
        {
            icon: 'shield-checkmark-outline',
            label: 'Verification',
            onPress: () =>
                Alert.alert('Verification', 'Your identity is verified through Clerk authentication. To add additional verification, contact support.'),
        },
        {
            icon: 'calendar-outline',
            label: 'Availability Schedule',
            onPress: () =>
                Alert.alert('Availability', 'Set your weekly availability to receive jobs only when you\'re free. Coming soon!'),
        },
        {
            icon: 'card-outline',
            label: 'Payout Settings',
            onPress: () => router.push('/(pro)/earnings'),
        },
        {
            icon: 'build-outline',
            label: 'Equipment',
            onPress: () =>
                Alert.alert('Equipment', 'List your available equipment (mower, snowblower, etc.) to get matched with relevant jobs. Coming soon!'),
        },
        {
            icon: 'location-outline',
            label: 'Service Area',
            onPress: () =>
                Alert.alert('Service Area', 'Define your service radius to only see jobs in your area. Coming soon!'),
        },
        {
            icon: 'notifications-outline',
            label: 'Notifications',
            onPress: () =>
                Alert.alert('Notifications', 'Push notification preferences', [
                    { text: 'OK' },
                ]),
        },
        {
            icon: 'document-text-outline',
            label: 'Documents',
            onPress: () =>
                Alert.alert('Documents', 'Upload insurance, licenses, and certifications to build trust with customers. Coming soon!'),
        },
        {
            icon: 'help-circle-outline',
            label: 'Help & Support',
            onPress: () =>
                Alert.alert('Help & Support', 'Need help?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@mowblo.com') },
                ]),
        },
        {
            icon: 'information-circle-outline',
            label: 'About',
            onPress: () =>
                Alert.alert('About Mowblo', 'Version 1.0.0\n\nMowblo connects homeowners with local landscaping and snow removal professionals.\n\n© 2025 Mowblo Inc.'),
        },
    ];

    const STATS = [
        { icon: 'star', value: avgRating, label: 'Rating', color: '#F6D155' },
        { icon: 'briefcase', value: String(allJobs.length), label: 'Jobs', color: '#68D391' },
        { icon: 'people', value: String(reviews.length), label: 'Reviews', color: '#63B3ED' },
        { icon: 'cash', value: `$${completedJobs.reduce((s: number, j: any) => s + (j.proEarnings || 0), 0).toFixed(0)}`, label: 'Earned', color: '#F6AD55' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <TouchableOpacity
                            style={styles.settingsBtn}
                            onPress={() => setSettingsOpen(true)}
                        >
                            <Ionicons name="settings-outline" size={22} color="#A0AEC0" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {/* Profile Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.profileSection}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase() || 'P'}</Text>
                        </View>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>Lv {Math.min(Math.floor(allJobs.length / 5) + 1, 10)}</Text>
                        </View>
                    </View>

                    <Text style={styles.profileName}>{firstName}</Text>
                    <Text style={styles.profileRole}>Contractor</Text>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        {STATS.map((stat) => (
                            <View key={stat.label} style={styles.statItem}>
                                <View style={styles.statIconRow}>
                                    <Ionicons name={stat.icon as any} size={14} color={stat.color} />
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                </View>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Mode Switch */}
                <TouchableOpacity
                    style={styles.modeSwitch}
                    onPress={() => router.push('/(customer)/home')}
                >
                    <View style={styles.modeSwitchIcon}>
                        <Ionicons name="swap-horizontal" size={18} color="#4A9EC4" />
                    </View>
                    <Text style={styles.modeSwitchText}>Switch to Customer</Text>
                    <Ionicons name="chevron-forward" size={16} color="#4A5568" />
                </TouchableOpacity>

                {/* Expandable Sections */}
                {SECTIONS.map((section, i) => (
                    <Animated.View
                        key={section.id}
                        entering={FadeInDown.delay(200 + i * 50).duration(300)}
                    >
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() =>
                                setExpandedSection(expandedSection === section.id ? null : section.id)
                            }
                        >
                            <Ionicons name={section.icon as any} size={22} color="#A0AEC0" />
                            <Text style={styles.sectionLabel}>{section.label}</Text>
                            <Ionicons
                                name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color="#4A5568"
                            />
                        </TouchableOpacity>

                        {expandedSection === section.id && (
                            <View style={styles.sectionContent}>
                                {section.id === 'reviews' && (
                                    reviews.length > 0 ? (
                                        reviews.map((review: any) => (
                                            <View key={review.id} style={styles.reviewCard}>
                                                <View style={styles.reviewStars}>
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Ionicons
                                                            key={s}
                                                            name={s <= review.rating ? 'star' : 'star-outline'}
                                                            size={14}
                                                            color="#F6D155"
                                                        />
                                                    ))}
                                                </View>
                                                {review.comment ? (
                                                    <Text style={styles.reviewText}>{review.comment}</Text>
                                                ) : null}
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.emptyText}>No reviews yet</Text>
                                    )
                                )}

                                {section.id === 'jobs' && (
                                    allJobs.length > 0 ? (
                                        allJobs.slice(0, 10).map((job: any) => (
                                            <View key={job.id} style={styles.jobHistoryCard}>
                                                <Text style={styles.jobHistoryTitle}>{job.title}</Text>
                                                <Text style={styles.jobHistoryMeta}>
                                                    {job.schedule?.date || 'N/A'} · ${job.proEarnings?.toFixed(2) || '0.00'}
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.emptyText}>No jobs yet</Text>
                                    )
                                )}

                                {section.id === 'badges' && (
                                    <View style={styles.badgeGrid}>
                                        {BADGES.map((badge) => (
                                            <View key={badge.label} style={styles.badgeItem}>
                                                <View style={[styles.badgeIcon, { backgroundColor: badge.color + '20' }]}>
                                                    <Ionicons name={badge.icon as any} size={22} color={badge.color} />
                                                </View>
                                                <Text style={styles.badgeLabel}>{badge.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </Animated.View>
                ))}

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color="#E53935" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Settings Modal */}
            <Modal visible={settingsOpen} animationType="slide">
                <View style={styles.settingsContainer}>
                    <SafeAreaView>
                        <View style={styles.settingsHeader}>
                            <Text style={styles.settingsTitle}>Settings</Text>
                            <TouchableOpacity onPress={() => setSettingsOpen(false)}>
                                <Ionicons name="close" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        <View style={styles.settingsList}>
                            {SETTINGS_ITEMS.map((item, i) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[styles.settingsItem, i < SETTINGS_ITEMS.length - 1 && styles.settingsItemBorder]}
                                    onPress={item.onPress}
                                >
                                    <Ionicons name={item.icon as any} size={22} color="#A0AEC0" />
                                    <Text style={styles.settingsItemLabel}>{item.label}</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#4A5568" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#161B22',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#21262D',
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 24,
    },
    avatarRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#4A9EC4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#22543D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#68D391',
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        backgroundColor: '#4A9EC4',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    levelText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    profileRole: {
        fontSize: 14,
        color: '#718096',
        fontWeight: '500',
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 20,
        paddingHorizontal: 20,
        gap: 8,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#161B22',
        borderRadius: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    statIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 10,
        color: '#718096',
        marginTop: 2,
        fontWeight: '500',
    },
    modeSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: '#161B22',
        borderRadius: 14,
        padding: 14,
        gap: 10,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    modeSwitchIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#4A9EC420',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modeSwitchText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#E2E8F0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        paddingVertical: 18,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#161B22',
    },
    sectionLabel: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    sectionContent: {
        marginHorizontal: 20,
        paddingBottom: 16,
    },
    reviewCard: {
        backgroundColor: '#161B22',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    reviewStars: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 6,
    },
    reviewText: {
        fontSize: 14,
        color: '#A0AEC0',
    },
    jobHistoryCard: {
        backgroundColor: '#161B22',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    jobHistoryTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E2E8F0',
    },
    jobHistoryMeta: {
        fontSize: 13,
        color: '#718096',
        marginTop: 4,
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingTop: 8,
    },
    badgeItem: {
        alignItems: 'center',
        width: 70,
        gap: 6,
    },
    badgeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#718096',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#4A5568',
        textAlign: 'center',
        paddingVertical: 20,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: '#161B22',
        borderRadius: 14,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    signOutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E53935',
    },
    // Settings modal
    settingsContainer: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    settingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    settingsTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    settingsList: {
        marginHorizontal: 20,
        marginTop: 12,
        backgroundColor: '#161B22',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#21262D',
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
        gap: 14,
    },
    settingsItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#21262D',
    },
    settingsItemLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#E2E8F0',
    },
});
