import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated as RNAnimated,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors } from '../../constants/theme';
import { useAvailableJobs, updateJobStatus } from '../../services/firebase';
import { useAuth } from '@clerk/clerk-expo';

const { width, height } = Dimensions.get('window');

// Mock coordinates for demo (Montreal area)
const INITIAL_REGION = {
    latitude: 45.5017,
    longitude: -73.5673,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

const JOB_PINS = [
    { id: '1', lat: 45.505, lng: -73.570, type: 'snow', title: 'Snow Removal' },
    { id: '2', lat: 45.498, lng: -73.560, type: 'lawn', title: 'Lawn Mowing' },
    { id: '3', lat: 45.510, lng: -73.575, type: 'snow', title: 'Snow Removal' },
    { id: '4', lat: 45.495, lng: -73.580, type: 'lawn', title: 'Lawn Mowing' },
];

export default function ProDashboard() {
    const router = useRouter();
    const { user } = useUser();
    const { userId } = useAuth();
    const { jobs, loading } = useAvailableJobs();

    const [isOnline, setIsOnline] = useState(false);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [selectedJob, setSelectedJob] = useState<string | null>(null);

    const toggleAnim = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        RNAnimated.spring(toggleAnim, {
            toValue: isOnline ? 1 : 0,
            damping: 15,
            stiffness: 120,
            useNativeDriver: false,
        }).start();
    }, [isOnline]);

    const toggleBg = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#2D3748', '#22543D'],
    });

    const toggleCircle = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 36],
    });

    const acceptJob = async (jobId: string) => {
        if (!userId) return;
        await updateJobStatus(jobId, 'accepted', { proId: userId });
        router.push({ pathname: '/(pro)/job-active', params: { jobId } });
    };

    // Combined display jobs (Firebase real jobs + mock pins for demo)
    const displayJobs = jobs.length > 0 ? jobs : [];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Map / List View */}
            {viewMode === 'map' ? (
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_DEFAULT}
                        initialRegion={INITIAL_REGION}
                        showsUserLocation
                        showsMyLocationButton={false}
                    >
                        {isOnline &&
                            JOB_PINS.map((pin) => (
                                <Marker
                                    key={pin.id}
                                    coordinate={{ latitude: pin.lat, longitude: pin.lng }}
                                    title={pin.title}
                                    onPress={() => setSelectedJob(pin.id)}
                                >
                                    <View
                                        style={[
                                            styles.pinContainer,
                                            {
                                                backgroundColor:
                                                    pin.type === 'snow' ? Colors.primary.blue : Colors.primary.green,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={pin.type === 'snow' ? 'snow' : 'leaf'}
                                            size={16}
                                            color="#fff"
                                        />
                                    </View>
                                </Marker>
                            ))}
                    </MapView>

                    {/* Overlays on map */}
                    <SafeAreaView style={styles.mapOverlay} edges={['top']}>
                        {/* Online toggle */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setIsOnline(!isOnline)}
                            style={styles.togglePill}
                        >
                            <RNAnimated.View style={[styles.toggleTrack, { backgroundColor: toggleBg }]}>
                                <RNAnimated.View
                                    style={[styles.toggleThumb, { transform: [{ translateX: toggleCircle }] }]}
                                />
                            </RNAnimated.View>
                            <Text style={[styles.toggleLabel, isOnline && { color: '#68D391' }]}>
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </Text>
                        </TouchableOpacity>

                        {/* View toggle button (top right) */}
                        <TouchableOpacity
                            style={styles.viewToggle}
                            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                        >
                            <Ionicons
                                name={viewMode === 'map' ? 'list' : 'map'}
                                size={22}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                    </SafeAreaView>

                    {/* Bottom job card (when a pin is selected) */}
                    {isOnline && selectedJob && (
                        <View style={styles.bottomCard}>
                            <View style={styles.cardHandle} />
                            <Text style={styles.cardTitle}>
                                {JOB_PINS.find((p) => p.id === selectedJob)?.title}
                            </Text>
                            <Text style={styles.cardAddress}>123 Maple Drive · 0.4 mi away</Text>
                            <View style={styles.cardDetails}>
                                <Text style={styles.cardDetailText}>Medium House · $55</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={styles.acceptBtn}
                                    onPress={() => {
                                        router.push({ pathname: '/(pro)/job-active', params: { jobId: selectedJob } });
                                    }}
                                >
                                    <Text style={styles.acceptBtnText}>Accept Job</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.skipBtn}
                                    onPress={() => setSelectedJob(null)}
                                >
                                    <Text style={styles.skipBtnText}>Skip</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Offline overlay */}
                    {!isOnline && (
                        <View style={styles.offlineOverlay}>
                            <View style={styles.offlineBubble}>
                                <Ionicons name="power-outline" size={28} color="#718096" />
                                <Text style={styles.offlineText}>Go online to see jobs</Text>
                            </View>
                        </View>
                    )}
                </View>
            ) : (
                /* List View */
                <View style={styles.listContainer}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.listHeader}>
                            <View>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setIsOnline(!isOnline)}
                                    style={styles.togglePillDark}
                                >
                                    <RNAnimated.View style={[styles.toggleTrack, { backgroundColor: toggleBg }]}>
                                        <RNAnimated.View
                                            style={[styles.toggleThumb, { transform: [{ translateX: toggleCircle }] }]}
                                        />
                                    </RNAnimated.View>
                                    <Text style={[styles.toggleLabel, isOnline && { color: '#68D391' }]}>
                                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.viewToggleDark}
                                onPress={() => setViewMode('map')}
                            >
                                <Ionicons name="map" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>$0</Text>
                                <Text style={styles.statLabel}>Today</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>Jobs</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>⭐ 5.0</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>
                        </View>
                    </SafeAreaView>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
                    >
                        <Text style={styles.sectionTitle}>
                            {isOnline ? 'Available Jobs' : 'Go online to see jobs'}
                        </Text>

                        {isOnline &&
                            JOB_PINS.map((job) => (
                                <TouchableOpacity
                                    key={job.id}
                                    style={styles.jobListCard}
                                    onPress={() => {
                                        router.push({ pathname: '/(pro)/job-active', params: { jobId: job.id } });
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.jobBadge,
                                            {
                                                backgroundColor:
                                                    job.type === 'snow' ? Colors.primary.blue + '20' : Colors.primary.green + '20',
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={job.type === 'snow' ? 'snow' : 'leaf'}
                                            size={22}
                                            color={job.type === 'snow' ? Colors.primary.blue : Colors.primary.green}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.jobListTitle}>{job.title}</Text>
                                        <Text style={styles.jobListAddr}>0.4 mi away · Medium House</Text>
                                    </View>
                                    <Text style={styles.jobListPrice}>$55</Text>
                                </TouchableOpacity>
                            ))}

                        {!isOnline && (
                            <View style={styles.offlineCard}>
                                <Ionicons name="power-outline" size={40} color="#4A5568" />
                                <Text style={styles.offlineCardText}>
                                    Tap the toggle to start receiving jobs
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    // Map mode
    mapContainer: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    pinContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    togglePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(13,17,23,0.9)',
        borderRadius: 24,
        paddingRight: 16,
        paddingVertical: 6,
        paddingLeft: 6,
        gap: 10,
    },
    togglePillDark: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    toggleTrack: {
        width: 70,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleThumb: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: '#718096',
        letterSpacing: 1,
    },
    viewToggle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(13,17,23,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewToggleDark: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#161B22',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomCard: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: '#161B22',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    cardHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#4A5568',
        alignSelf: 'center',
        marginBottom: 14,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cardAddress: {
        fontSize: 13,
        color: '#718096',
        marginTop: 4,
    },
    cardDetails: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#21262D',
        paddingTop: 12,
    },
    cardDetailText: {
        fontSize: 14,
        color: '#A0AEC0',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    acceptBtn: {
        flex: 3,
        backgroundColor: '#22543D',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    acceptBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#68D391',
    },
    skipBtn: {
        flex: 1,
        backgroundColor: '#21262D',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    skipBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#718096',
    },
    offlineOverlay: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    offlineBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(13,17,23,0.9)',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 16,
    },
    offlineText: {
        fontSize: 14,
        color: '#718096',
        fontWeight: '600',
    },
    // List mode
    listContainer: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#161B22',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#21262D',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 11,
        color: '#718096',
        marginTop: 4,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 14,
        marginTop: 8,
    },
    jobListCard: {
        backgroundColor: '#161B22',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    jobBadge: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    jobListTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    jobListAddr: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    jobListPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: '#68D391',
    },
    offlineCard: {
        backgroundColor: '#161B22',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    offlineCardText: {
        fontSize: 14,
        color: '#4A5568',
        textAlign: 'center',
    },
});
