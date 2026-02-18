import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EARNINGS = [95, 42, 127, 88, 0, 0, 0]; // Mock data

export default function EarningsScreen() {
    const weekTotal = EARNINGS.reduce((a, b) => a + b, 0);
    const maxEarning = Math.max(...EARNINGS, 1);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <SafeAreaView edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Earnings</Text>
                </View>
            </SafeAreaView>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
            >
                {/* Week summary */}
                <LinearGradient
                    colors={['#1A3A3A', '#0D2818']}
                    style={styles.summaryCard}
                >
                    <Text style={styles.summaryLabel}>THIS WEEK</Text>
                    <Text style={styles.summaryValue}>${weekTotal.toFixed(2)}</Text>
                    <View style={styles.goalBar}>
                        <View
                            style={[styles.goalProgress, { width: `${Math.min((weekTotal / 500) * 100, 100)}%` }]}
                        />
                    </View>
                    <Text style={styles.goalText}>${weekTotal} / $500 goal</Text>
                </LinearGradient>

                {/* Daily breakdown */}
                <View style={styles.dailySection}>
                    {DAYS.map((day, i) => (
                        <View key={day} style={styles.dayRow}>
                            <Text style={styles.dayLabel}>{day}</Text>
                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        { width: `${(EARNINGS[i] / maxEarning) * 100}%` },
                                        EARNINGS[i] === 0 && { width: 4, backgroundColor: '#21262D' },
                                    ]}
                                />
                            </View>
                            <Text style={styles.dayValue}>${EARNINGS[i]}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={styles.quickStatItem}>
                        <Text style={styles.quickStatValue}>$70.40</Text>
                        <Text style={styles.quickStatLabel}>Avg per job</Text>
                    </View>
                    <View style={styles.quickStatItem}>
                        <Text style={styles.quickStatValue}>$145</Text>
                        <Text style={styles.quickStatLabel}>Best job</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    summaryCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
    },
    summaryLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
        letterSpacing: 1,
    },
    summaryValue: {
        fontSize: 40,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 4,
    },
    goalBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 3,
        marginTop: 16,
    },
    goalProgress: {
        height: 6,
        backgroundColor: '#68D391',
        borderRadius: 3,
    },
    goalText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 6,
    },
    dailySection: {
        gap: 10,
        marginBottom: 24,
    },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dayLabel: {
        width: 36,
        fontSize: 13,
        fontWeight: '600',
        color: '#718096',
    },
    barContainer: {
        flex: 1,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#161B22',
        justifyContent: 'center',
    },
    bar: {
        height: 24,
        borderRadius: 6,
        backgroundColor: '#68D391',
    },
    dayValue: {
        width: 50,
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'right',
    },
    quickStats: {
        flexDirection: 'row',
        gap: 12,
    },
    quickStatItem: {
        flex: 1,
        backgroundColor: '#161B22',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
    },
    quickStatValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    quickStatLabel: {
        fontSize: 12,
        color: '#718096',
        marginTop: 4,
    },
});
