import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { createJob } from '../../services/firebase';

const STEPS = ['Type', 'Time', 'Location', 'Tasks', 'Review'];

const JOB_TYPES = [
    { id: 'lawn', label: 'Lawn Mowing', icon: 'leaf', color: '#5BAA48' },
    { id: 'snow', label: 'Snow Shoveling', icon: 'snow', color: '#4A9EC4' },
    { id: 'edge', label: 'Edge Trimming', icon: 'cut', color: '#E67E22' },
    { id: 'leaf', label: 'Leaf Blowing', icon: 'flash', color: '#9B59B6' },
    { id: 'hedge', label: 'Hedge Trimming', icon: 'resize', color: '#27AE60' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#718096' },
];

const FREQUENCIES = [
    { id: 'once', label: 'Once' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'biweekly', label: 'Bi-Weekly' },
    { id: 'monthly', label: 'Monthly' },
];

const TOOLS = [
    'Lawn Mower', 'Snow Shovel', 'Leaf Blower', 'Edge Trimmer', 'Rake', 'Salt Spreader',
];

export default function CreateJobScreen() {
    const router = useRouter();
    const { userId } = useAuth();
    const [step, setStep] = useState(0);

    // Step 0: Type
    const [jobType, setJobType] = useState('');

    // Step 1: Time
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [frequency, setFrequency] = useState('once');

    // Step 2: Location
    const [address, setAddress] = useState('');

    // Step 3: Tasks
    const [tasks, setTasks] = useState([{ label: '', completed: false }]);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [instructions, setInstructions] = useState('');

    // Price
    const [price, setPrice] = useState('50');

    const canProceed = () => {
        switch (step) {
            case 0: return !!jobType;
            case 1: return !!date;
            case 2: return !!address;
            case 3: return tasks.some((t) => t.label.trim());
            case 4: return true;
            default: return false;
        }
    };

    const addTask = () => {
        setTasks([...tasks, { label: '', completed: false }]);
    };

    const updateTask = (index: number, text: string) => {
        const updated = [...tasks];
        updated[index] = { ...updated[index], label: text };
        setTasks(updated);
    };

    const toggleTool = (tool: string) => {
        setSelectedTools((prev) =>
            prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
        );
    };

    const handlePost = async () => {
        if (!userId) return;

        try {
            await createJob({
                customerId: userId,
                type: jobType as 'lawn' | 'snow',
                status: 'posted',
                title: JOB_TYPES.find((j) => j.id === jobType)?.label || 'Job',
                location: { latitude: 0, longitude: 0, address },
                schedule: { date, startTime, endTime, frequency: frequency as any },
                tasks: tasks.filter((t) => t.label.trim()),
                addons: [],
                toolsProvided: selectedTools,
                photos: [],
                instructions,
                price: parseFloat(price) || 50,
                platformFee: 0,
                proEarnings: 0,
            });

            Alert.alert('Job Posted!', 'Your job is now visible to nearby Pros.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            console.error('Failed to post job:', err);
            Alert.alert('Error', 'Failed to post job. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#1A2332" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Job Posting</Text>
                    <Text style={styles.stepIndicator}>{step + 1}/{STEPS.length}</Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBar}>
                    {STEPS.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.progressDot, i <= step && { backgroundColor: '#1A2332' }]}
                        />
                    ))}
                </View>
            </SafeAreaView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Step 0: What? */}
                {step === 0 && (
                    <Animated.View entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>What do you need done?</Text>
                        <View style={styles.typeGrid}>
                            {JOB_TYPES.map((type) => {
                                const selected = jobType === type.id;
                                return (
                                    <TouchableOpacity
                                        key={type.id}
                                        onPress={() => setJobType(type.id)}
                                        style={[
                                            styles.typeCard,
                                            selected && { borderColor: type.color, backgroundColor: type.color + '10' },
                                        ]}
                                    >
                                        <Ionicons
                                            name={type.icon as any}
                                            size={28}
                                            color={selected ? type.color : '#8E99A4'}
                                        />
                                        <Text style={[styles.typeLabel, selected && { color: type.color, fontWeight: '700' }]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Animated.View>
                )}

                {/* Step 1: When? */}
                {step === 1 && (
                    <Animated.View entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>When?</Text>

                        <Text style={styles.fieldLabel}>Date</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="2025-03-15"
                            placeholderTextColor="#A0AEC0"
                            value={date}
                            onChangeText={setDate}
                        />

                        <View style={styles.timeRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>Start Time</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="9:00 AM"
                                    placeholderTextColor="#A0AEC0"
                                    value={startTime}
                                    onChangeText={setStartTime}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>End Time</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="11:00 AM"
                                    placeholderTextColor="#A0AEC0"
                                    value={endTime}
                                    onChangeText={setEndTime}
                                />
                            </View>
                        </View>

                        <Text style={styles.fieldLabel}>How often?</Text>
                        <View style={styles.freqRow}>
                            {FREQUENCIES.map((f) => (
                                <TouchableOpacity
                                    key={f.id}
                                    onPress={() => setFrequency(f.id)}
                                    style={[styles.freqChip, frequency === f.id && styles.freqChipActive]}
                                >
                                    <Text style={[styles.freqText, frequency === f.id && styles.freqTextActive]}>
                                        {f.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Step 2: Where? */}
                {step === 2 && (
                    <Animated.View entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>Where?</Text>

                        <TouchableOpacity style={styles.locationCurrent}>
                            <Ionicons name="navigate" size={20} color="#4A9EC4" />
                            <Text style={styles.locationCurrentText}>Use Current Location</Text>
                        </TouchableOpacity>

                        <Text style={styles.fieldLabel}>Or enter address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="123 Kingston Crescent"
                            placeholderTextColor="#A0AEC0"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </Animated.View>
                )}

                {/* Step 3: Details */}
                {step === 3 && (
                    <Animated.View entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>Details</Text>

                        <Text style={styles.fieldLabel}>What needs to be done?</Text>
                        {tasks.map((task, i) => (
                            <TextInput
                                key={i}
                                style={[styles.input, { marginBottom: 8 }]}
                                placeholder={`Task ${i + 1}`}
                                placeholderTextColor="#A0AEC0"
                                value={task.label}
                                onChangeText={(text) => updateTask(i, text)}
                            />
                        ))}
                        <TouchableOpacity onPress={addTask} style={styles.addTaskBtn}>
                            <Ionicons name="add-circle-outline" size={20} color="#4A9EC4" />
                            <Text style={styles.addTaskText}>Add another task</Text>
                        </TouchableOpacity>

                        <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Tools provided?</Text>
                        <View style={styles.toolsRow}>
                            {TOOLS.map((tool) => {
                                const selected = selectedTools.includes(tool);
                                return (
                                    <TouchableOpacity
                                        key={tool}
                                        onPress={() => toggleTool(tool)}
                                        style={[styles.toolChip, selected && styles.toolChipActive]}
                                    >
                                        <Text style={[styles.toolText, selected && styles.toolTextActive]}>{tool}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Special Instructions</Text>
                        <TextInput
                            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                            placeholder="Gate code, dog warning, etc..."
                            placeholderTextColor="#A0AEC0"
                            multiline
                            value={instructions}
                            onChangeText={setInstructions}
                        />

                        <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Your Budget ($)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="50"
                            placeholderTextColor="#A0AEC0"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </Animated.View>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <Animated.View entering={FadeInRight.duration(250)}>
                        <Text style={styles.stepTitle}>Review & Post</Text>

                        <View style={styles.reviewCard}>
                            <ReviewRow label="Job Type" value={JOB_TYPES.find((j) => j.id === jobType)?.label || ''} />
                            <ReviewRow label="Location" value={address || 'Current location'} />
                            <ReviewRow label="Date" value={date || 'ASAP'} />
                            <ReviewRow label="Time" value={`${startTime || 'Flexible'} - ${endTime || 'Flexible'}`} />
                            <ReviewRow label="Frequency" value={frequency} />
                            <ReviewRow label="Tasks" value={tasks.filter((t) => t.label).map((t) => t.label).join(', ') || 'None'} />
                            <ReviewRow label="Tools" value={selectedTools.join(', ') || 'None provided'} />
                            <ReviewRow label="Budget" value={`$${price}`} />
                            {instructions ? <ReviewRow label="Notes" value={instructions} /> : null}
                        </View>

                        <View style={styles.priceBreakdown}>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Job Price</Text>
                                <Text style={styles.priceValue}>${parseFloat(price || '50').toFixed(2)}</Text>
                            </View>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabelSm}>Mowblo fee (15%)</Text>
                                <Text style={styles.priceValueSm}>${(parseFloat(price || '50') * 0.15).toFixed(2)}</Text>
                            </View>
                            <View style={[styles.priceRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>${(parseFloat(price || '50') * 1.15).toFixed(2)}</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>

            {/* Bottom buttons */}
            <View style={styles.bottomBar}>
                {step > 0 && (
                    <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                        <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
                    disabled={!canProceed()}
                    onPress={() => {
                        if (step < 4) {
                            setStep(step + 1);
                        } else {
                            handlePost();
                        }
                    }}
                >
                    <Text style={styles.nextBtnText}>
                        {step === 4 ? 'Post Job Listing' : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>{label}</Text>
            <Text style={styles.reviewValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A2332',
    },
    stepIndicator: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E99A4',
    },
    progressBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 4,
        marginBottom: 8,
    },
    progressDot: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#E8ECF0',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 120,
    },
    stepTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1A2332',
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
        marginTop: 4,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        color: '#1A2332',
        marginBottom: 16,
    },
    timeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    freqRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    freqChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8ECF0',
    },
    freqChipActive: {
        backgroundColor: '#1A2332',
        borderColor: '#1A2332',
    },
    freqText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
    },
    freqTextActive: {
        color: '#FFFFFF',
    },
    locationCurrent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#EEF6FB',
        padding: 16,
        borderRadius: 14,
        marginBottom: 20,
    },
    locationCurrentText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4A9EC4',
    },
    addTaskBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    addTaskText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A9EC4',
    },
    toolsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    toolChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8ECF0',
    },
    toolChipActive: {
        backgroundColor: '#1A2332',
        borderColor: '#1A2332',
    },
    toolText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4A5568',
    },
    toolTextActive: {
        color: '#FFFFFF',
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    typeCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 22,
        paddingHorizontal: 14,
        alignItems: 'center',
        gap: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A2332',
    },
    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
    },
    reviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F3F6',
    },
    reviewLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E99A4',
    },
    reviewValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A2332',
        maxWidth: '60%',
        textAlign: 'right',
    },
    priceBreakdown: {
        marginTop: 20,
        backgroundColor: '#1A2332',
        borderRadius: 16,
        padding: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    priceLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    priceValue: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    priceLabelSm: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
    priceValueSm: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
    totalRow: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        paddingTop: 10,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 16,
        backgroundColor: '#F5F8FA',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#E8ECF0',
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
