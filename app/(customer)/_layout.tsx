import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import FloatingTabBar from '../../components/ui/FloatingTabBar';
import { Colors } from '../../constants/theme';

const CUSTOMER_TABS = [
    { name: 'home', label: 'Home', icon: 'home-outline', iconFocused: 'home' },
    { name: 'activity', label: 'Activity', icon: 'time-outline', iconFocused: 'time' },
    { name: 'account', label: 'Account', icon: 'person-outline', iconFocused: 'person' },
];

export default function CustomerLayout() {
    const router = useRouter();
    const pathname = usePathname();

    // Hide tab bar on full-screen views
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
                <FloatingTabBar
                    tabs={CUSTOMER_TABS}
                    activeIndex={getActiveIndex()}
                    onTabPress={handleTabPress}
                    accentColor={Colors.primary.blue}
                    showFab={true}
                    onFabPress={() => router.push('/(customer)/create-job')}
                    fabColor="#4CAF50"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
});
