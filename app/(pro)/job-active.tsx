import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { updateJobStatus, Job } from '../../services/firebase';
import { useAuth } from '@clerk/clerk-expo';

let ImagePicker: any = null;
try { ImagePicker = require('expo-image-picker'); } catch (e) { }

const { width } = Dimensions.get('window');

const FLOW_STEPS = [
    { label: 'Navigate', icon: 'navigate', desc: 'Head to the job location' },
    { label: 'Arrive', icon: 'location', desc: 'Confirm you have arrived' },
    { label: 'Before Photo', icon: 'camera', desc: 'Take a before photo' },
    { label: 'Work', icon: 'construct', desc: 'Complete the job' },
    { label: 'After Photo', icon: 'camera', desc: 'Take an after photo' },
    { label: 'Done', icon: 'checkmark-circle', desc: 'Mark the job complete' },
];

export default function JobActiveScreen() {
    const router = useRouter();
    const { jobId } = useLocalSearchParams();
    const { userId } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
    const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
    const mapRef = useRef<MapView>(null);

    // Pro's mock location (would be real GPS in production)
    const proLocation = { latitude: 45.5017, longitude: -73.5673 };

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) { setLoading(false); return; }
            try {
                const snap = await getDoc(doc(db, 'jobs', jobId as string));
                if (snap.exists()) {
                    setJob({ id: snap.id, ...snap.data() } as Job);
                }
            } catch (err) {
                console.warn('Failed to fetch job:', err);
            }
            setLoading(false);
        };
        fetchJob();
    }, [jobId]);

    // Fit map to show both markers
    useEffect(() => {
        if (job && mapRef.current && currentStep === 0) {
            const jobLat = job.location?.latitude || 45.505;
            const jobLng = job.location?.longitude || -73.570;
            mapRef.current.fitToCoordinates(
                [proLocation, { latitude: jobLat, longitude: jobLng }],
                { edgePadding: { top: 80, right: 60, bottom: 200, left: 60 }, animated: true }
            );
        }
    }, [job, currentStep]);

    const takePhoto = async (type: 'before' | 'after') => {
        if (!ImagePicker) {
            Alert.alert('Not Available', 'Camera requires a native rebuild.');
            return;
        }
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera access is needed.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
        if (!result.canceled) {
            if (type === 'before') setBeforePhoto(result.assets[0].uri);
            else setAfterPhoto(result.assets[0].uri);
        }
    };

    const handleNext = async () => {
        if (currentStep < FLOW_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Mark job complete
            if (job?.id) {
                await updateJobStatus(job.id, 'completed');
            }
            Alert.alert('Job Complete! 🎉', `You earned $${job?.proEarnings?.toFixed(2) || '0.00'}`, [
                { text: 'OK', onPress: () => router.replace('/(pro)/dashboard') },
            ]);
        }
    };

    const step = FLOW_STEPS[currentStep];
    const isLastStep = currentStep === FLOW_STEPS.length - 1;
    const jobLat = job?.location?.latitude || 45.505;
    const jobLng = job?.location?.longitude || -73.570;

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#68D391" />
            </View>
        );
    }

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
                    <Animated.View entering={FadeInDown.duration(300)} key={currentStep}>
                        {/* Step 0: Navigate — show map with both locations */}
                        {currentStep === 0 && (
                            <View style={styles.mapCard}>
                                <MapView
                                    ref={mapRef}
                                    style={styles.mapView}
                                    provider={PROVIDER_DEFAULT}
                                    initialRegion={{
                                        latitude: (proLocation.latitude + jobLat) / 2,
                                        longitude: (proLocation.longitude + jobLng) / 2,
                                        latitudeDelta: 0.04,
                                        longitudeDelta: 0.04,
                                    }}
                                    showsUserLocation={false}
                                >
                                    {/* Pro location */}
                                    <Marker coordinate={proLocation} title="You">
                                        <View style={[styles.mapPin, { backgroundColor: '#4A9EC4' }]}>
                                            <Ionicons name="person" size={14} color="#fff" />
                                        </View>
                                    </Marker>
                                    {/* Job location */}
                                    <Marker coordinate={{ latitude: jobLat, longitude: jobLng }} title="Job">
                                        <View style={[styles.mapPin, { backgroundColor: '#E53935' }]}>
                                            <Ionicons name="location" size={14} color="#fff" />
                                        </View>
                                    </Marker>
                                </MapView>

                                {/* Job info overlay */}
                                <View style={styles.mapInfoOverlay}>
                                    <Ionicons name="location-outline" size={20} color="#68D391" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.mapInfoTitle}>
                                            {job?.location?.address || 'Job Location'}
                                        </Text>
                                        <Text style={styles.mapInfoSub}>
                                            {job?.schedule?.date || 'ASAP'} · {job?.schedule?.startTime || 'Flexible'}
                                        </Text>
                                    </View>
                                    <Text style={styles.mapInfoPrice}>${job?.price || 0}</Text>
                                </View>
                            </View>
                        )}

                        {/* Steps 1+: standard card UI */}
                        {currentStep > 0 && (
                            <View style={styles.stepCard}>
                                <View style={styles.stepIconBg}>
                                    <Ionicons name={step.icon as any} size={48} color="#68D391" />
                                </View>
                                <Text style={styles.stepLabel}>{step.label}</Text>
                                <Text style={styles.stepDesc}>{step.desc}</Text>

                                {/* Step 1: Arrive */}
                                {currentStep === 1 && (
                                    <View style={styles.infoCard}>
                                        <Ionicons name="alert-circle-outline" size={20} color="#F6AD55" />
                                        <Text style={styles.infoTitle}>Make sure you're at the right address</Text>
                                    </View>
                                )}

                                {/* Step 2: Before photo */}
                                {currentStep === 2 && (
                                    <View style={styles.photoSection}>
                                        {beforePhoto ? (
                                            <Image source={{ uri: beforePhoto }} style={styles.photoPreview} />
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.photoSlot}
                                                onPress={() => takePhoto('before')}
                                            >
                                                <Ionicons name="camera-outline" size={32} color="#4A5568" />
                                                <Text style={styles.photoSlotText}>Take Before Photo</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}

                                {/* Step 3: Work */}
                                {currentStep === 3 && job && (
                                    <View style={styles.taskListSection}>
                                        <Text style={styles.taskListTitle}>Tasks:</Text>
                                        {(job.tasks || []).map((task: any, i: number) => (
                                            <View key={i} style={styles.taskRow}>
                                                <Ionicons name="checkbox-outline" size={18} color="#68D391" />
                                                <Text style={styles.taskText}>{task.label}</Text>
                                            </View>
                                        ))}
                                        {job.instructions ? (
                                            <View style={styles.instructionsBox}>
                                                <Text style={styles.instructionsLabel}>Special Instructions:</Text>
                                                <Text style={styles.instructionsText}>{job.instructions}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                )}

                                {/* Step 4: After photo */}
                                {currentStep === 4 && (
                                    <View style={styles.photoSection}>
                                        {afterPhoto ? (
                                            <Image source={{ uri: afterPhoto }} style={styles.photoPreview} />
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.photoSlot}
                                                onPress={() => takePhoto('after')}
                                            >
                                                <Ionicons name="camera-outline" size={32} color="#4A5568" />
                                                <Text style={styles.photoSlotText}>Take After Photo</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}

                                {/* Step 5: Done — payout summary */}
                                {currentStep === 5 && (
                                    <View style={styles.payoutCard}>
                                        <Text style={styles.payoutLabel}>YOUR EARNINGS</Text>
                                        <Text style={styles.payoutValue}>
                                            ${job?.proEarnings?.toFixed(2) || '0.00'}
                                        </Text>
                                        <Text style={styles.payoutSub}>
                                            Job: ${job?.price?.toFixed(2) || '0.00'} · Fee: -${job?.platformFee?.toFixed(2) || '0.00'}
                                        </Text>
                                        <Text style={styles.payoutTip}>Customer will be charged after completion</Text>
                                    </View>
                                )}
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
                            {isLastStep
                                ? 'Complete Job'
                                : currentStep === 0
                                    ? "I'm On My Way"
                                    : `Confirm ${step.label}`}
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
    // Map card (step 0)
    mapCard: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#161B22',
        borderWidth: 1,
        borderColor: '#21262D',
    },
    mapView: {
        width: '100%',
        height: 280,
    },
    mapPin: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    mapInfoOverlay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 18,
    },
    mapInfoTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E2E8F0',
    },
    mapInfoSub: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    mapInfoPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#68D391',
    },
    // Step card
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
        flex: 1,
    },
    // Photo section
    photoSection: {
        width: '100%',
    },
    photoSlot: {
        height: 160,
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
        fontSize: 14,
        color: '#4A5568',
        fontWeight: '600',
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    // Task list
    taskListSection: {
        width: '100%',
        gap: 10,
    },
    taskListTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#A0AEC0',
        marginBottom: 4,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#0D1117',
        borderRadius: 10,
        padding: 12,
    },
    taskText: {
        fontSize: 14,
        color: '#E2E8F0',
        flex: 1,
    },
    instructionsBox: {
        backgroundColor: '#0D1117',
        borderRadius: 10,
        padding: 14,
        marginTop: 6,
    },
    instructionsLabel: {
        fontSize: 12,
        color: '#718096',
        fontWeight: '600',
        marginBottom: 4,
    },
    instructionsText: {
        fontSize: 14,
        color: '#E2E8F0',
    },
    // Payout
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
    // Bottom bar
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
