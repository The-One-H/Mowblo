import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface TabItem {
    name: string;
    label: string;
    icon: string;
    iconFocused: string;
}

interface FloatingTabBarProps {
    tabs: TabItem[];
    activeIndex: number;
    onTabPress: (index: number) => void;
    accentColor?: string;
    showFab?: boolean;
    onFabPress?: () => void;
    fabColor?: string;
}

export default function FloatingTabBar({
    tabs,
    activeIndex,
    onTabPress,
    accentColor = '#6BB8D9',
    showFab = false,
    onFabPress,
    fabColor = '#4CAF50',
}: FloatingTabBarProps) {
    return (
        <View style={[styles.container, showFab && styles.containerWithFab]}>
            <BlurView
                intensity={80}
                tint="dark"
                style={styles.blurContainer}
            >
                <View style={styles.innerContainer}>
                    {tabs.map((tab, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <TouchableOpacity
                                key={tab.name}
                                onPress={() => onTabPress(index)}
                                activeOpacity={0.7}
                                style={styles.tabButton}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    isActive && { backgroundColor: accentColor + '20' },
                                ]}>
                                    <Ionicons
                                        name={(isActive ? tab.iconFocused : tab.icon) as any}
                                        size={22}
                                        color={isActive ? accentColor : '#8E99A4'}
                                    />
                                </View>
                                <Text style={[
                                    styles.tabLabel,
                                    isActive && { color: accentColor, fontWeight: '700' },
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </BlurView>

            {/* FAB — large green circle to the right */}
            {showFab && onFabPress && (
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onFabPress}
                    style={[styles.fab, { backgroundColor: fabColor }]}
                >
                    <Ionicons name="add" size={30} color="#FFFFFF" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 28 : 16,
        left: 24,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    containerWithFab: {
        right: 24,
    },
    blurContainer: {
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flex: 1,
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        backgroundColor: 'rgba(20, 25, 35, 0.65)',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#8E99A4',
        marginTop: -2,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
