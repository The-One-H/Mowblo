import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface TabItem {
    name: string;
    icon: string;
    iconFocused: string;
}

interface FloatingTabBarProps {
    tabs: TabItem[];
    activeIndex: number;
    onTabPress: (index: number) => void;
    accentColor?: string;
}

export default function FloatingTabBar({
    tabs,
    activeIndex,
    onTabPress,
    accentColor = '#6BB8D9',
}: FloatingTabBarProps) {
    return (
        <View style={styles.container}>
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
                                        size={24}
                                        color={isActive ? accentColor : '#8E99A4'}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 28 : 16,
        left: 24,
        right: 24,
        alignItems: 'center',
    },
    blurContainer: {
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: 'rgba(20, 25, 35, 0.65)',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
