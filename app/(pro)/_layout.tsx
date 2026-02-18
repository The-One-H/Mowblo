import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import FloatingTabBar from '../../components/ui/FloatingTabBar';
import { Colors } from '../../constants/theme';

const PRO_TABS = [
    { name: 'dashboard', label: 'Dashboard', icon: 'grid-outline', iconFocused: 'grid' },
    { name: 'earnings', label: 'Earnings', icon: 'wallet-outline', iconFocused: 'wallet' },
    { name: 'account', label: 'Account', icon: 'person-outline', iconFocused: 'person' },
];

export default function ProLayout() {
    const router = useRouter();
    const pathname = usePathname();

    const getActiveIndex = () => {
        if (pathname.includes('/earnings')) return 1;
        if (pathname.includes('/pro-account')) return 2;
        return 0;
    };

    const handleTabPress = (index: number) => {
        const routes = ['/(pro)/dashboard', '/(pro)/earnings', '/(pro)/pro-account'];
        router.push(routes[index] as any);
    };

    return (
        <View style={styles.container}>
            <Slot />
            <FloatingTabBar
                tabs={PRO_TABS}
                activeIndex={getActiveIndex()}
                onTabPress={handleTabPress}
                accentColor={Colors.primary.green}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
});
