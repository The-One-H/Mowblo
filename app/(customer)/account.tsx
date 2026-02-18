import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function AccountScreen() {
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const firstName = user?.firstName || 'User';
    const email = user?.primaryEmailAddress?.emailAddress || '';

    const menuItems = [
        { icon: 'card-outline', label: 'Payment Methods', onPress: () => { } },
        { icon: 'location-outline', label: 'Saved Addresses', onPress: () => { } },
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => { } },
        { icon: 'star-outline', label: 'Mowblo+ Subscription', onPress: () => { } },
        { icon: 'shield-checkmark-outline', label: 'Privacy & Security', onPress: () => { } },
        { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => { } },
    ];

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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
            <SafeAreaView edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Account</Text>
                </View>
            </SafeAreaView>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <LinearGradient
                        colors={[Colors.primary.blue, Colors.primary.green]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.profileAvatar}
                    >
                        <Text style={styles.profileAvatarText}>
                            {firstName[0]?.toUpperCase() || 'M'}
                        </Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.profileName}>{firstName}</Text>
                        <Text style={styles.profileEmail}>{email}</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="create-outline" size={20} color={Colors.text.grayMid} />
                    </TouchableOpacity>
                </View>

                {/* Mode Switch */}
                <TouchableOpacity
                    style={styles.modeSwitchCard}
                    onPress={() => router.push('/(pro)/dashboard')}
                >
                    <LinearGradient
                        colors={['#5BAA48', '#7DC46A']}
                        style={styles.modeSwitchIcon}
                    >
                        <Ionicons name="construct" size={20} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.modeSwitchTitle}>Switch to Pro Mode</Text>
                        <Text style={styles.modeSwitchSub}>Start earning money</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text.grayMid} />
                </TouchableOpacity>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[
                                styles.menuItem,
                                index < menuItems.length - 1 && styles.menuItemBorder,
                            ]}
                            onPress={item.onPress}
                        >
                            <Ionicons name={item.icon as any} size={22} color="#1A2332" />
                            <Text style={styles.menuItemLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.text.grayMid} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={22} color="#E53935" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>Mowblo v1.0.0</Text>
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
    profileCard: {
        marginHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        gap: 14,
    },
    profileAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileAvatarText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A2332',
    },
    profileEmail: {
        fontSize: 13,
        color: Colors.text.grayMid,
        marginTop: 2,
    },
    editButton: {
        padding: 8,
    },
    modeSwitchCard: {
        marginHorizontal: 20,
        marginTop: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    modeSwitchIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modeSwitchTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A2332',
    },
    modeSwitchSub: {
        fontSize: 12,
        color: Colors.text.grayMid,
        marginTop: 2,
    },
    menuSection: {
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
        gap: 14,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F3F6',
    },
    menuItemLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#1A2332',
    },
    signOutButton: {
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    signOutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E53935',
    },
    version: {
        textAlign: 'center',
        color: Colors.text.grayMid,
        fontSize: 12,
        marginTop: 24,
    },
});
