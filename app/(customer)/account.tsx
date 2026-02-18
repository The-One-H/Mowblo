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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { useStore } from '../../store/useStore';

export default function AccountScreen() {
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const { homeAddress, setHomeAddress } = useStore();

    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editAddress, setEditAddress] = useState(homeAddress || '');
    const [notifModalOpen, setNotifModalOpen] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);

    const firstName = user?.firstName || 'User';
    const email = user?.primaryEmailAddress?.emailAddress || '';

    const handleSaveAddress = () => {
        setHomeAddress(editAddress.trim());
        setAddressModalOpen(false);
        Alert.alert('Saved ✓', 'Your home address has been updated.');
    };

    const menuItems = [
        {
            icon: 'card-outline',
            label: 'Payment Methods',
            onPress: () =>
                Alert.alert(
                    'Payment Methods',
                    'Your payment is securely handled by Stripe. You can manage cards when creating a job.',
                    [{ text: 'OK' }]
                ),
        },
        {
            icon: 'location-outline',
            label: 'Saved Addresses',
            onPress: () => {
                setEditAddress(homeAddress || '');
                setAddressModalOpen(true);
            },
        },
        {
            icon: 'notifications-outline',
            label: 'Notifications',
            onPress: () => setNotifModalOpen(true),
        },
        {
            icon: 'star-outline',
            label: 'Mowblo+ Subscription',
            onPress: () =>
                Alert.alert('Mowblo+', 'Premium subscription coming soon! Get priority job matching, reduced fees, and exclusive discounts.'),
        },
        {
            icon: 'shield-checkmark-outline',
            label: 'Privacy & Security',
            onPress: () =>
                Alert.alert(
                    'Privacy & Security',
                    `Email: ${email}\nSign-in: ${user?.primaryPhoneNumber?.phoneNumber || 'Email'}\n\nYour account is secured by Clerk authentication. You can manage your security settings from there.`,
                    [
                        { text: 'OK' },
                        { text: 'Manage Account', onPress: () => Linking.openURL('https://accounts.clerk.dev') },
                    ]
                ),
        },
        {
            icon: 'help-circle-outline',
            label: 'Help & Support',
            onPress: () =>
                Alert.alert('Help & Support', 'Need help? Contact us:', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@mowblo.com') },
                ]),
        },
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
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() =>
                            Alert.alert('Edit Profile', 'Profile info is managed through your Clerk account.', [
                                { text: 'OK' },
                                { text: 'Open Settings', onPress: () => Linking.openURL('https://accounts.clerk.dev') },
                            ])
                        }
                    >
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

            {/* Saved Addresses Modal */}
            <Modal visible={addressModalOpen} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <SafeAreaView>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Saved Addresses</Text>
                            <TouchableOpacity onPress={() => setAddressModalOpen(false)}>
                                <Ionicons name="close" size={24} color="#1A2332" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    <View style={styles.modalContent}>
                        <Text style={styles.inputLabel}>Home Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your home address"
                            placeholderTextColor="#A0AEC0"
                            value={editAddress}
                            onChangeText={setEditAddress}
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
                            <Text style={styles.saveBtnText}>Save Address</Text>
                        </TouchableOpacity>

                        {homeAddress ? (
                            <View style={styles.savedCard}>
                                <Ionicons name="home" size={20} color={Colors.primary.blue} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.savedLabel}>Current Home Address</Text>
                                    <Text style={styles.savedAddr}>{homeAddress}</Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
                </View>
            </Modal>

            {/* Notifications Modal */}
            <Modal visible={notifModalOpen} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <SafeAreaView>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notifications</Text>
                            <TouchableOpacity onPress={() => setNotifModalOpen(false)}>
                                <Ionicons name="close" size={24} color="#1A2332" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    <View style={styles.modalContent}>
                        <View style={styles.toggleRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.toggleLabel}>Push Notifications</Text>
                                <Text style={styles.toggleSub}>Job updates, messages, and alerts</Text>
                            </View>
                            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
                        </View>
                        <View style={styles.toggleRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.toggleLabel}>Email Notifications</Text>
                                <Text style={styles.toggleSub}>Receipts and account updates</Text>
                            </View>
                            <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
                        </View>
                        <View style={styles.toggleRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.toggleLabel}>SMS Notifications</Text>
                                <Text style={styles.toggleSub}>Text alerts for urgent updates</Text>
                            </View>
                            <Switch value={smsEnabled} onValueChange={setSmsEnabled} />
                        </View>
                    </View>
                </View>
            </Modal>
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
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A2332',
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A2332',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        fontSize: 15,
        color: '#1A2332',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    saveBtn: {
        backgroundColor: Colors.primary.blue,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    savedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    savedLabel: {
        fontSize: 12,
        color: Colors.text.grayMid,
    },
    savedAddr: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A2332',
        marginTop: 2,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A2332',
    },
    toggleSub: {
        fontSize: 12,
        color: Colors.text.grayMid,
        marginTop: 2,
    },
});
