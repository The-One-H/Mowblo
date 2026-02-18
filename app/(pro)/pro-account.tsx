import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

const STATS = [
    { icon: 'trophy', value: '235', label: 'Tokens', color: '#F6AD55' },
    { icon: 'star', value: '4.6', label: 'Rating', color: '#F6D155' },
    { icon: 'briefcase', value: '23', label: 'Jobs', color: '#68D391' },
    { icon: 'people', value: '3', label: 'Clients', color: '#63B3ED' },
];

const BADGES = [
    { icon: 'flash', label: 'Quick Responder', color: '#F6AD55' },
    { icon: 'star', label: 'Top Rated', color: '#F6D155' },
    { icon: 'snow', label: 'Snow Expert', color: '#63B3ED' },
    { icon: 'leaf', label: 'Lawn Master', color: '#68D391' },
    { icon: 'ribbon', label: '10 Jobs', color: '#D183ED' },
];

const SECTIONS = [
    { id: 'tokens', label: 'Tokens', icon: 'trophy' },
    { id: 'reviews', label: 'Reviews', icon: 'chatbubbles' },
    { id: 'jobs', label: 'Job History', icon: 'briefcase' },
    { id: 'badges', label: 'Badges & Awards', icon: 'ribbon' },
    { id: 'favorites', label: 'Favorites', icon: 'heart' },
];

const SETTINGS_ITEMS = [
    { icon: 'person-outline', label: 'Edit Profile' },
    { icon: 'shield-checkmark-outline', label: 'Verification' },
    { icon: 'calendar-outline', label: 'Availability Schedule' },
    { icon: 'card-outline', label: 'Payout Settings' },
    { icon: 'build-outline', label: 'Equipment' },
    { icon: 'location-outline', label: 'Service Area' },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'document-text-outline', label: 'Documents' },
    { icon: 'help-circle-outline', label: 'Help & Support' },
    { icon: 'information-circle-outline', label: 'About' },
];

export default function ProAccountScreen() {
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const firstName = user?.firstName || 'Pro';

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

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <SafeAreaView edges={['top']}>
                    {/* Header with settings gear */}
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
                    {/* Avatar with level ring */}
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase() || 'P'}</Text>
                        </View>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>Lv 4</Text>
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
                                {section.id === 'badges' ? (
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
                                ) : (
                                    <Text style={styles.emptyText}>Nothing here yet</Text>
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
