import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useUserProfile } from '../../../services/firebase';

const STEPS = ['Your Name', 'Equipment', 'Services', 'Done'];

const EQUIPMENT_LIST = [
    { id: 'mower', label: 'Lawn Mower', icon: 'leaf' },
    { id: 'trimmer', label: 'String Trimmer', icon: 'cut' },
    { id: 'blower', label: 'Leaf Blower', icon: 'flash' },
    { id: 'edger', label: 'Edger', icon: 'resize' },
    { id: 'shovel', label: 'Snow Shovel', icon: 'snow' },
    { id: 'snowblower', label: 'Snow Blower', icon: 'snow' },
    { id: 'salt', label: 'De-Icing Salt', icon: 'water' },
    { id: 'rake', label: 'Roof Rake', icon: 'construct' },
];

const SERVICE_TYPES = [
    { id: 'lawn', label: 'Lawn Mowing', icon: 'leaf', color: '#5BAA48' },
    { id: 'snow', label: 'Snow Removal', icon: 'snow', color: '#4A9EC4' },
];

export default function ProOnboarding() {
    const router = useRouter();
    const { updateProfile } = useUserProfile();
    const [step, setStep] = useState(0);

    const [name, setName] = useState('');
    const [equipment, setEquipment] = useState<string[]>([]);
    const [services, setServices] = useState<string[]>([]);

    const toggleItem = (arr: string[], setArr: (v: string[]) => void, id: string) => {
        setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
    };

    const handleComplete = async () => {
        await updateProfile({
            name,
            onboardingComplete: true,
            proProfile: {
                rating: 5.0,
                jobsCompleted: 0,
                tokens: 0,
                level: 1,
                equipment,
            },
        });
        router.replace('/(pro)/dashboard');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Progress bar */}
                <View style={styles.progressBar}>
                    {STEPS.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressDot,
                                i <= step && { backgroundColor: '#5BAA48' },
                            ]}
                        />
                    ))}
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Step 0: Name */}
                    {step === 0 && (
                        <Animated.View entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(200)}>
                            <Text style={styles.stepTitle}>What's your name?</Text>
                            <Text style={styles.stepSub}>This is how customers will see you.</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="First name"
                                placeholderTextColor="#A0AEC0"
                                value={name}
                                onChangeText={setName}
                                autoFocus
                                autoCapitalize="words"
                            />
                        </Animated.View>
                    )}

                    {/* Step 1: Equipment */}
                    {step === 1 && (
                        <Animated.View entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(200)}>
                            <Text style={styles.stepTitle}>What equipment do{'\n'}you have?</Text>
                            <Text style={styles.stepSub}>Select all that apply.</Text>
                            <View style={styles.grid}>
                                {EQUIPMENT_LIST.map((item) => {
                                    const selected = equipment.includes(item.id);
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => toggleItem(equipment, setEquipment, item.id)}
                                            style={[styles.gridItem, selected && styles.gridItemSelected]}
                                        >
                                            <Ionicons
                                                name={item.icon as any}
                                                size={24}
                                                color={selected ? '#5BAA48' : '#8E99A4'}
                                            />
                                            <Text style={[styles.gridLabel, selected && styles.gridLabelSelected]}>
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    )}

                    {/* Step 2: Services */}
                    {step === 2 && (
                        <Animated.View entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(200)}>
                            <Text style={styles.stepTitle}>What services will{'\n'}you offer?</Text>
                            <Text style={styles.stepSub}>You can change this anytime.</Text>
                            <View style={styles.serviceCards}>
                                {SERVICE_TYPES.map((svc) => {
                                    const selected = services.includes(svc.id);
                                    return (
                                        <TouchableOpacity
                                            key={svc.id}
                                            onPress={() => toggleItem(services, setServices, svc.id)}
                                            style={[
                                                styles.serviceCard,
                                                selected && { borderColor: svc.color, backgroundColor: svc.color + '10' },
                                            ]}
                                        >
                                            <Ionicons
                                                name={svc.icon as any}
                                                size={40}
                                                color={selected ? svc.color : '#8E99A4'}
                                            />
                                            <Text style={[styles.serviceLabel, selected && { color: svc.color }]}>
                                                {svc.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    )}

                    {/* Step 3: Done */}
                    {step === 3 && (
                        <Animated.View entering={FadeInRight.duration(300)} style={styles.doneStep}>
                            <View style={styles.doneIcon}>
                                <Ionicons name="checkmark-circle" size={72} color="#5BAA48" />
                            </View>
                            <Text style={styles.stepTitle}>You're all set!</Text>
                            <Text style={styles.stepSub}>
                                Start accepting jobs and earning money right away.
                            </Text>
                        </Animated.View>
                    )}
                </ScrollView>

                {/* Bottom buttons */}
                <View style={styles.bottomButtons}>
                    {step > 0 && (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => setStep(step - 1)}
                        >
                            <Text style={styles.backBtnText}>Back</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.nextBtn,
                            step === 0 && !name.trim() && styles.nextBtnDisabled,
                        ]}
                        disabled={step === 0 && !name.trim()}
                        onPress={() => {
                            if (step < 3) {
                                setStep(step + 1);
                            } else {
                                handleComplete();
                            }
                        }}
                    >
                        <Text style={styles.nextBtnText}>
                            {step === 3 ? 'Start Earning' : 'Continue'}
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
        backgroundColor: '#F5F8FA',
    },
    safeArea: {
        flex: 1,
    },
    progressBar: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 16,
        gap: 6,
    },
    progressDot: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E8ECF0',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    stepTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1A2332',
        letterSpacing: -0.5,
        lineHeight: 38,
    },
    stepSub: {
        fontSize: 15,
        color: '#8E99A4',
        marginTop: 8,
        marginBottom: 28,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        fontSize: 18,
        fontWeight: '600',
        color: '#1A2332',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    gridItem: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    gridItemSelected: {
        borderColor: '#5BAA48',
        backgroundColor: '#F0F9EC',
    },
    gridLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A2332',
        flex: 1,
    },
    gridLabelSelected: {
        color: '#3D7A2E',
    },
    serviceCards: {
        flexDirection: 'row',
        gap: 14,
    },
    serviceCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        gap: 14,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    serviceLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A2332',
    },
    doneStep: {
        alignItems: 'center',
        paddingTop: 40,
    },
    doneIcon: {
        marginBottom: 20,
    },
    bottomButtons: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 12,
    },
    backBtn: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8ECF0',
    },
    backBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A2332',
    },
    nextBtn: {
        flex: 2,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: '#1A2332',
    },
    nextBtnDisabled: {
        backgroundColor: '#C4CDD5',
    },
    nextBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
