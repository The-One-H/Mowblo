import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FLOW_STEPS = [
    { label: 'Navigate', icon: 'navigate', desc: 'Go to the property' },
    { label: 'Arrive', icon: 'location', desc: 'Confirm you have arrived' },
    { label: 'Photo', icon: 'camera', desc: 'Take photos of property' },
    { label: 'Work', icon: 'construct', desc: 'Complete the job' },
    { label: 'Done', icon: 'checkmark-circle', desc: 'Confirm job is complete' },
    { label: 'Payout', icon: 'cash', desc: 'View your earnings' },
];

export default function JobActiveScreen() {
    const router = useRouter();
    const { jobId } = useLocalSearchParams();
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < FLOW_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.replace('/(pro)/dashboard');
        }
    };

    const step = FLOW_STEPS[currentStep];
    const isLastStep = currentStep === FLOW_STEPS.length - 1;

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert('Cancel Job', 'Are you sure you want to cancel?', [
                                { text: 'No', style: 'cancel' },
                                { text: 'Yes', style: 'destructive', onPress: () => router.back() },
                            ]);
                        }}
                    >
                        <Ionicons name="close" size={24} color="#718096" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Active Job</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Step progress */}
                <View style={styles.progressRow}>
                    {FLOW_STEPS.map((s, i) => (
                        <View key={i} style={styles.progressItem}>
                            <View
                                style={[
                                    styles.progressCircle,
                                    i < currentStep && styles.progressDone,
                                    i === currentStep && styles.progressActive,
                                ]}
                            >
                                {i < currentStep ? (
                                    <Ionicons name="checkmark" size={12} color="#fff" />
                                ) : (
                                    <Text style={[styles.progressNum, i === currentStep && { color: '#fff' }]}>
                                        {i + 1}
                                    </Text>
                                )}
                            </View>
                            {i < FLOW_STEPS.length - 1 && (
                                <View style={[styles.progressLine, i < currentStep && styles.progressLineDone]} />
                            )}
                        </View>
                    ))}
                </View>

                {/* Content */}
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.duration(300)} key={currentStep} style={styles.stepCard}>
                        <View style={styles.stepIconBg}>
                            <Ionicons name={step.icon as any} size={48} color="#68D391" />
                        </View>
                        <Text style={styles.stepLabel}>{step.label}</Text>
                        <Text style={styles.stepDesc}>{step.desc}</Text>

                        {/* Step-specific content */}
                        {currentStep === 0 && (
                            <View style={styles.infoCard}>
                                <Ionicons name="location-outline" size={20} color="#A0AEC0" />
                                <View>
                                    <Text style={styles.infoTitle}>42 Maple Drive</Text>
                                    <Text style={styles.infoSub}>0.4 mi away · ~3 min drive</Text>
                                </View>
                            </View>
                        )}

                        {currentStep === 1 && (
                            <View style={styles.infoCard}>
                                <Ionicons name="alert-circle-outline" size={20} color="#F6AD55" />
                                <Text style={styles.infoTitle}>Make sure you're at the right address</Text>
                            </View>
                        )}

                        {currentStep === 2 && (
                            <View style={styles.photoGrid}>
                                <TouchableOpacity style={styles.photoSlot}>
                                    <Ionicons name="camera-outline" size={28} color="#4A5568" />
                                    <Text style={styles.photoSlotText}>Before</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.photoSlot}>
                                    <Ionicons name="camera-outline" size={28} color="#4A5568" />
                                    <Text style={styles.photoSlotText}>After</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {currentStep === 4 && (
                            <View style={styles.confirmCard}>
                                <Text style={styles.confirmText}>
                                    Please confirm the job is fully complete before proceeding.
                                </Text>
                            </View>
                        )}

                        {currentStep === 5 && (
                            <View style={styles.payoutCard}>
                                <Text style={styles.payoutLabel}>YOUR EARNINGS</Text>
                                <Text style={styles.payoutValue}>$46.75</Text>
                                <Text style={styles.payoutSub}>Job: $55 · Fee: -$8.25</Text>
                                <Text style={styles.payoutTip}>+ tip potential</Text>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>

                {/* Bottom button */}
                <View style={styles.bottomBar}>
                    {currentStep > 0 && !isLastStep && (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => setCurrentStep(currentStep - 1)}
                        >
                            <Text style={styles.backBtnText}>Back</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                        <Text style={styles.nextBtnText}>
                            {isLastStep ? 'Save & Exit' : step.label === 'Navigate' ? 'I\'m On My Way' : `Confirm ${step.label}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    progressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    progressCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#21262D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressDone: {
        backgroundColor: '#22543D',
    },
    progressActive: {
        backgroundColor: '#68D391',
    },
    progressNum: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4A5568',
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#21262D',
        marginHorizontal: 4,
    },
    progressLineDone: {
        backgroundColor: '#22543D',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    stepCard: {
        backgroundColor: '#161B22',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#21262D',
    },
    stepIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#22543D20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    stepLabel: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    stepDesc: {
        fontSize: 15,
        color: '#718096',
        marginBottom: 24,
        textAlign: 'center',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#0D1117',
        borderRadius: 14,
        padding: 16,
        width: '100%',
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E2E8F0',
    },
    infoSub: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    photoGrid: {
        flexDirection: 'row',
        gap: 14,
        width: '100%',
    },
    photoSlot: {
        flex: 1,
        height: 120,
        backgroundColor: '#0D1117',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: '#21262D',
        borderStyle: 'dashed',
    },
    photoSlotText: {
        fontSize: 13,
        color: '#4A5568',
        fontWeight: '600',
    },
    confirmCard: {
        backgroundColor: '#0D1117',
        borderRadius: 14,
        padding: 16,
        width: '100%',
    },
    confirmText: {
        fontSize: 14,
        color: '#A0AEC0',
        textAlign: 'center',
    },
    payoutCard: {
        alignItems: 'center',
        width: '100%',
    },
    payoutLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#718096',
        letterSpacing: 1,
    },
    payoutValue: {
        fontSize: 48,
        fontWeight: '900',
        color: '#68D391',
        marginTop: 4,
    },
    payoutSub: {
        fontSize: 14,
        color: '#718096',
        marginTop: 4,
    },
    payoutTip: {
        fontSize: 13,
        color: '#F6AD55',
        fontWeight: '600',
        marginTop: 6,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 34,
        paddingTop: 16,
        gap: 12,
    },
    backBtn: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: '#161B22',
        borderWidth: 1,
        borderColor: '#21262D',
    },
    backBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#A0AEC0',
    },
    nextBtn: {
        flex: 2,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: '#22543D',
    },
    nextBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#68D391',
    },
});
