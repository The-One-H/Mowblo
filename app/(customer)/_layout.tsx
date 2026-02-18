import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FloatingTabBar from '../../components/ui/FloatingTabBar';
import { Colors } from '../../constants/theme';

const CUSTOMER_TABS = [
    { name: 'home', icon: 'home-outline', iconFocused: 'home' },
    { name: 'activity', icon: 'time-outline', iconFocused: 'time' },
    { name: 'account', icon: 'person-outline', iconFocused: 'person' },
];

export default function CustomerLayout() {
    const router = useRouter();
    const pathname = usePathname();

    // Hide tab bar on create-job and configure screens
    const hideTabBar =
        pathname.includes('/create-job') || pathname.includes('/configure');

    const getActiveIndex = () => {
        if (pathname.includes('/activity')) return 1;
        if (pathname.includes('/account')) return 2;
        return 0;
    };

    const handleTabPress = (index: number) => {
        const routes = ['/(customer)/home', '/(customer)/activity', '/(customer)/account'];
        router.push(routes[index] as any);
    };

    return (
        <View style={styles.container}>
            <Slot />

            {!hideTabBar && (
                <>
                    {/* FAB + Button (left of tab bar) */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.push('/(customer)/create-job')}
                        style={styles.fab}
                    >
                        <Ionicons name="add" size={28} color="#FFFFFF" />
                    </TouchableOpacity>

                    <FloatingTabBar
                        tabs={CUSTOMER_TABS}
                        activeIndex={getActiveIndex()}
                        onTabPress={handleTabPress}
                        accentColor={Colors.primary.blue}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    fab: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 92 : 78,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1A2332',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 100,
    },
});
