import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Alert, Modal, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { useUserProfile, useJobs, usePayouts, recordPayout } from '../../services/firebase';
import {
    getBalance, getPayoutMethods, createPayout, getPayoutHistory,
    createConnectAccount, getOnboardingLink,
    StripeBalance, PayoutMethod,
} from '../../services/stripe';

export default function EarningsScreen() {
    const { userId } = useAuth();
    const { user } = useUser();
    const { profile } = useUserProfile();
    const { jobs } = useJobs('pro', userId, ['completed']);
    const { payouts } = usePayouts(userId);

    const [balance, setBalance] = useState<StripeBalance | null>(null);
    const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const connectId = profile?.stripeConnectId;

    // Compute weekly earnings from completed jobs
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekJobs = jobs.filter((j) => {
        const created = j.createdAt?.toDate?.() || new Date(j.createdAt);
        return created >= weekStart;
    });
    const weekTotal = weekJobs.reduce((sum, j) => sum + (j.proEarnings || 0), 0);

    // Daily breakdown for the bar chart
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyEarnings = DAYS.map((_, i) => {
        return weekJobs
            .filter((j) => {
                const d = j.createdAt?.toDate?.() || new Date(j.createdAt);
                return d.getDay() === i;
            })
            .reduce((sum, j) => sum + (j.proEarnings || 0), 0);
    });
    const maxEarning = Math.max(...dailyEarnings, 1);

    // Lifetime stats
    const totalEarned = jobs.reduce((sum, j) => sum + (j.proEarnings || 0), 0);
    const avgPerJob = jobs.length > 0 ? totalEarned / jobs.length : 0;
    const bestJob = jobs.reduce((max, j) => Math.max(max, j.proEarnings || 0), 0);

    // Load balance on mount
    useEffect(() => {
        loadBalance();
    }, [connectId]);

    const loadBalance = async () => {
        setLoadingBalance(true);
        try {
            if (connectId) {
                const bal = await getBalance(connectId);
                setBalance(bal);
                const methods = await getPayoutMethods(connectId);
                setPayoutMethods(methods);
            }
        } catch (err) {
            console.warn('Failed to load balance:', err);
        } finally {
            setLoadingBalance(false);
        }
    };

    const handleSetupPayouts = async () => {
        setProcessing(true);
        try {
            if (connectId) {
                // Already has account, just get onboarding link
                const url = await getOnboardingLink(connectId);
                Linking.openURL(url);
            } else if (userId) {
                // Create new account
                const { onboardingUrl } = await createConnectAccount(
                    userId,
                    user?.emailAddresses?.[0]?.emailAddress || ''
                );
                Linking.openURL(onboardingUrl);
            }
            setShowSetupModal(false);
        } catch (err) {
            Alert.alert('Error', 'Failed to set up payouts. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async (speed: 'instant' | 'standard') => {
        if (!connectId || !balance || !userId) return;

        const amount = balance.available;
        if (amount <= 0) {
            Alert.alert('No Funds', 'You have no available balance to withdraw.');
            return;
        }

        const fee = speed === 'instant' ? amount * 0.015 : 0;
        const netAmount = amount - fee;

        Alert.alert(
            speed === 'instant' ? '⚡ Instant Payout' : '🏦 Standard Payout',
            `$${netAmount.toFixed(2)} will be sent to your ${payoutMethods[0]?.bankName || 'bank account'}${speed === 'instant' ? ` (${payoutMethods[0]?.last4 ? '••' + payoutMethods[0].last4 : ''}).\n\n1.5% fee: $${fee.toFixed(2)}` : '.\n\nNo fees. Arrives in 1-2 business days.'
            }`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setProcessing(true);
                        setShowWithdrawModal(false);
                        try {
                            const result = await createPayout(connectId, amount, speed);

                            // Record in Firebase for history
                            await recordPayout({
                                userId,
                                stripePayoutId: result.id,
                                amount,
                                fee,
                                netAmount,
                                method: speed,
                                status: result.status,
                                payoutMethodLast4: payoutMethods[0]?.last4,
                                payoutMethodType: payoutMethods[0]?.type,
                            });

                            Alert.alert(
                                '✅ Payout Initiated',
                                speed === 'instant'
                                    ? 'Check your bank account in a few minutes.'
                                    : 'Funds will arrive in 1-2 business days.'
                            );

                            // Refresh balance
                            loadBalance();
                        } catch (err) {
                            Alert.alert('Error', 'Payout failed. Please try again.');
                        } finally {
                            setProcessing(false);
                        }
                    },
                },
            ]
        );
    };

    const availableBalance = balance?.available ?? 0;

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
                {/* Available Balance Card */}
                <LinearGradient
                    colors={['#1B5E20', '#0D3B10']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.balanceCard}
                >
                    <View style={styles.balanceHeader}>
                        <View>
                            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
                            {loadingBalance ? (
                                <ActivityIndicator color="#68D391" style={{ marginTop: 8 }} />
                            ) : (
                                <Text style={styles.balanceValue}>${availableBalance.toFixed(2)}</Text>
                            )}
                        </View>
                        <View style={styles.balanceIcon}>
                            <Ionicons name="wallet" size={24} color="#68D391" />
                        </View>
                    </View>

                    {/* Payout method indicator */}
                    {payoutMethods.length > 0 && (
                        <View style={styles.methodPill}>
                            <Ionicons
                                name={payoutMethods[0].type === 'bank_account' ? 'business' : 'card'}
                                size={14}
                                color="rgba(255,255,255,0.7)"
                            />
                            <Text style={styles.methodText}>
                                {payoutMethods[0].bankName || payoutMethods[0].brand || 'Bank'} ••{payoutMethods[0].last4}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.withdrawBtn}
                        onPress={() => {
                            if (!connectId) {
                                setShowSetupModal(true);
                            } else {
                                setShowWithdrawModal(true);
                            }
                        }}
                        activeOpacity={0.85}
                        disabled={processing}
                    >
                        {processing ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons
                                    name={connectId ? 'arrow-up-circle' : 'add-circle'}
                                    size={20}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.withdrawBtnText}>
                                    {connectId ? 'Withdraw' : 'Set Up Payouts'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </LinearGradient>

                {/* Week summary */}
                <LinearGradient colors={['#1A3A3A', '#0D2818']} style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>THIS WEEK</Text>
                    <Text style={styles.summaryValue}>${weekTotal.toFixed(2)}</Text>
                    <View style={styles.goalBar}>
                        <View
                            style={[styles.goalProgress, { width: `${Math.min((weekTotal / 500) * 100, 100)}%` }]}
                        />
                    </View>
                    <Text style={styles.goalText}>${weekTotal.toFixed(0)} / $500 goal</Text>
                </LinearGradient>

                {/* Daily breakdown */}
                <View style={styles.dailySection}>
                    {DAYS.map((day, i) => (
                        <View key={day} style={styles.dayRow}>
                            <Text style={[styles.dayLabel, i === now.getDay() && { color: '#68D391', fontWeight: '800' }]}>
                                {day}
                            </Text>
                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        { width: `${(dailyEarnings[i] / maxEarning) * 100}%` },
                                        dailyEarnings[i] === 0 && { width: 4, backgroundColor: '#21262D' },
                                    ]}
                                />
                            </View>
                            <Text style={styles.dayValue}>${dailyEarnings[i].toFixed(0)}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={styles.quickStatItem}>
                        <Text style={styles.quickStatValue}>${avgPerJob.toFixed(2)}</Text>
                        <Text style={styles.quickStatLabel}>Avg per job</Text>
                    </View>
                    <View style={styles.quickStatItem}>
                        <Text style={styles.quickStatValue}>${bestJob.toFixed(0)}</Text>
                        <Text style={styles.quickStatLabel}>Best job</Text>
                    </View>
                    <View style={styles.quickStatItem}>
                        <Text style={styles.quickStatValue}>${totalEarned.toFixed(0)}</Text>
                        <Text style={styles.quickStatLabel}>All time</Text>
                    </View>
                </View>

                {/* Payout History */}
                <Text style={styles.sectionTitle}>Payout History</Text>
                {payouts.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="receipt-outline" size={32} color="#4A5568" />
                        <Text style={styles.emptyText}>No payouts yet</Text>
                    </View>
                ) : (
                    payouts.map((payout) => (
                        <View key={payout.id} style={styles.payoutCard}>
                            <View style={styles.payoutIcon}>
                                <Ionicons
                                    name={payout.method === 'instant' ? 'flash' : 'time'}
                                    size={18}
                                    color={payout.method === 'instant' ? '#F6E05E' : '#68D391'}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.payoutAmount}>${payout.netAmount.toFixed(2)}</Text>
                                <Text style={styles.payoutDate}>
                                    {payout.createdAt?.toDate?.()
                                        ? payout.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'Processing'
                                    } · {payout.method === 'instant' ? 'Instant' : 'Standard'}
                                    {payout.payoutMethodLast4 ? ` · ••${payout.payoutMethodLast4}` : ''}
                                </Text>
                            </View>
                            <View style={styles.payoutStatus}>
                                <Ionicons
                                    name={payout.status === 'paid' ? 'checkmark-circle' : payout.status === 'failed' ? 'close-circle' : 'time'}
                                    size={16}
                                    color={payout.status === 'paid' ? '#68D391' : payout.status === 'failed' ? '#FC8181' : '#F6E05E'}
                                />
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Withdraw Modal */}
            <Modal
                visible={showWithdrawModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowWithdrawModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Withdraw Funds</Text>
                        <Text style={styles.modalSubtitle}>
                            Available: ${availableBalance.toFixed(2)}
                        </Text>

                        {payoutMethods.length > 0 && (
                            <View style={styles.methodCard}>
                                <Ionicons
                                    name={payoutMethods[0].type === 'bank_account' ? 'business' : 'card'}
                                    size={20}
                                    color="#68D391"
                                />
                                <Text style={styles.methodCardText}>
                                    {payoutMethods[0].bankName || payoutMethods[0].brand} ••{payoutMethods[0].last4}
                                </Text>
                                <TouchableOpacity onPress={handleSetupPayouts}>
                                    <Text style={styles.methodChangeText}>Change</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.payoutOption}
                            onPress={() => handleWithdraw('instant')}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.payoutOptionIcon, { backgroundColor: '#F6E05E20' }]}>
                                <Ionicons name="flash" size={22} color="#F6E05E" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.payoutOptionTitle}>Instant Payout</Text>
                                <Text style={styles.payoutOptionDesc}>Arrives in minutes · 1.5% fee</Text>
                            </View>
                            <Text style={styles.payoutOptionAmount}>
                                ${(availableBalance * 0.985).toFixed(2)}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.payoutOption}
                            onPress={() => handleWithdraw('standard')}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.payoutOptionIcon, { backgroundColor: '#68D39120' }]}>
                                <Ionicons name="time" size={22} color="#68D391" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.payoutOptionTitle}>Standard Payout</Text>
                                <Text style={styles.payoutOptionDesc}>1-2 business days · No fee</Text>
                            </View>
                            <Text style={styles.payoutOptionAmount}>
                                ${availableBalance.toFixed(2)}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setShowWithdrawModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Setup Payouts Modal */}
            <Modal
                visible={showSetupModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSetupModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={{ alignItems: 'center', marginBottom: 24 }}>
                            <View style={styles.setupIcon}>
                                <Ionicons name="shield-checkmark" size={40} color="#68D391" />
                            </View>
                            <Text style={styles.modalTitle}>Set Up Payouts</Text>
                            <Text style={[styles.modalSubtitle, { textAlign: 'center' }]}>
                                Connect your bank account or debit card to receive earnings. Powered securely by Stripe.
                            </Text>
                        </View>

                        <View style={styles.setupFeatures}>
                            {['Bank account or debit card', 'Instant or 1-2 day payouts', 'Secured by Stripe'].map((feat) => (
                                <View key={feat} style={styles.setupFeatureRow}>
                                    <Ionicons name="checkmark-circle" size={18} color="#68D391" />
                                    <Text style={styles.setupFeatureText}>{feat}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.withdrawBtn, { backgroundColor: '#68D391', marginTop: 16 }]}
                            onPress={handleSetupPayouts}
                            disabled={processing}
                        >
                            {processing ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={[styles.withdrawBtnText, { color: '#000' }]}>
                                    Continue to Stripe
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setShowSetupModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Not now</Text>
                        </TouchableOpacity>
                    </View>
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
    // Balance card
    balanceCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    balanceLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    balanceValue: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 4,
    },
    balanceIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(104,211,145,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 8,
    },
    methodText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    withdrawBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14,
        paddingVertical: 14,
        marginTop: 20,
    },
    withdrawBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Summary
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
    // Daily
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
    // Quick stats
    quickStats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
    },
    quickStatItem: {
        flex: 1,
        backgroundColor: '#161B22',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
    },
    quickStatValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    quickStatLabel: {
        fontSize: 11,
        color: '#718096',
        marginTop: 4,
    },
    // Payout history
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 14,
    },
    emptyCard: {
        backgroundColor: '#161B22',
        borderRadius: 14,
        padding: 32,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    emptyText: {
        fontSize: 14,
        color: '#718096',
    },
    payoutCard: {
        backgroundColor: '#161B22',
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    payoutIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#21262D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    payoutAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    payoutDate: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    payoutStatus: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#161B22',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#4A5568',
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 24,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#0D1117',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    methodCardText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    methodChangeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#68D391',
    },
    payoutOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#0D1117',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    payoutOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payoutOptionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    payoutOptionDesc: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    payoutOptionAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: '#68D391',
    },
    modalCancel: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 4,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#718096',
    },
    // Setup modal
    setupIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: 'rgba(104,211,145,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    setupFeatures: {
        gap: 12,
    },
    setupFeatureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    setupFeatureText: {
        fontSize: 15,
        color: '#C9D1D9',
        fontWeight: '500',
    },
});
