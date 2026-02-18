import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Platform,
    TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors } from '../../constants/theme';
import { useAvailableJobs, updateJobStatus, Job } from '../../services/firebase';
import { useAuth } from '@clerk/clerk-expo';

let ExpoLocation: any = null;
try { ExpoLocation = require('expo-location'); } catch (e) { }

const { width, height } = Dimensions.get('window');

const INITIAL_REGION = {
    latitude: 45.5017,
    longitude: -73.5673,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
};

const RADIUS_OPTIONS = [5, 10, 15, 25, 50]; // km

/**
 * Haversine formula — distance between two lat/lng points in km.
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
}

export default function ProDashboard() {
    const router = useRouter();
    const { user } = useUser();
    const { userId } = useAuth();
    const { jobs, loading } = useAvailableJobs();

    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [radiusKm, setRadiusKm] = useState(15);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLat, setUserLat] = useState(INITIAL_REGION.latitude);
    const [userLng, setUserLng] = useState(INITIAL_REGION.longitude);
    const [locationLoaded, setLocationLoaded] = useState(false);
    const mapRef = useRef<MapView | null>(null);

    const firstName = user?.firstName || 'Pro';

    // Get user location
    useEffect(() => {
        (async () => {
            if (!ExpoLocation) return;
            try {
                const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;
                const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy?.Balanced });
                setUserLat(loc.coords.latitude);
                setUserLng(loc.coords.longitude);
                setLocationLoaded(true);
                // Center map on user
                mapRef.current?.animateToRegion({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.08,
                    longitudeDelta: 0.08,
                }, 600);
            } catch (err) {
                console.warn('Location error:', err);
            }
        })();
    }, []);

    // Add distance to each job and filter by radius
    const jobsWithDistance = jobs.map((job) => ({
        ...job,
        distance: haversineKm(
            userLat, userLng,
            job.location?.latitude || 0,
            job.location?.longitude || 0
        ),
    }));

    const nearbyJobs = jobsWithDistance
        .filter((j) => j.distance <= radiusKm)
        .filter((j) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                (j.title || '').toLowerCase().includes(q) ||
                (j.location?.address || '').toLowerCase().includes(q) ||
                (j.type || '').toLowerCase().includes(q)
            );
        })
        .sort((a, b) => a.distance - b.distance);

    const acceptJob = async (job: Job) => {
        if (!userId || !job.id) return;
        await updateJobStatus(job.id, 'accepted', { proId: userId });
        router.push({ pathname: '/(pro)/job-active', params: { jobId: job.id } });
    };

    const getJobIcon = (type: string) => {
        switch (type) {
            case 'snow': return 'snow';
            case 'lawn': return 'leaf';
            case 'edge': return 'cut';
            case 'leaf': return 'flash';
            case 'hedge': return 'resize';
            default: return 'construct';
        }
    };

    const getJobColor = (type: string) => {
        switch (type) {
            case 'snow': return Colors.primary.blue;
            case 'lawn': return Colors.primary.green;
            case 'edge': return '#E67E22';
            case 'leaf': return '#9B59B6';
            case 'hedge': return '#27AE60';
            default: return '#718096';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {viewMode === 'map' ? (
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={PROVIDER_DEFAULT}
                        initialRegion={INITIAL_REGION}
                        showsUserLocation
                        showsMyLocationButton={false}
                    >
                        {/* Radius circle overlay */}
                        <Circle
                            center={{ latitude: userLat, longitude: userLng }}
                            radius={radiusKm * 1000}
                            strokeColor="rgba(104,211,145,0.5)"
                            fillColor="rgba(104,211,145,0.08)"
                            strokeWidth={2}
                        />

                        {nearbyJobs.map((job) => (
                            <Marker
                                key={job.id}
                                coordinate={{
                                    latitude: job.location?.latitude || 45.5017,
                                    longitude: job.location?.longitude || -73.5673,
                                }}
                                title={job.title}
                                onPress={() => setSelectedJob(job)}
                            >
                                <View
                                    style={[
                                        styles.pinContainer,
                                        { backgroundColor: getJobColor(job.type) },
                                    ]}
                                >
                                    <Ionicons
                                        name={getJobIcon(job.type) as any}
                                        size={16}
                                        color="#fff"
                                    />
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Top overlays */}
                    <SafeAreaView style={styles.mapOverlay} edges={['top']}>
                        <View style={styles.statusPill}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.statusText}>Online · {nearbyJobs.length} jobs within {radiusKm} km</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.viewToggle}
                            onPress={() => setViewMode('list')}
                        >
                            <Ionicons name="list" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    {/* Radius slider overlay */}
                    <View style={styles.radiusOverlay}>
                        <View style={styles.radiusPill}>
                            <Ionicons name="locate-outline" size={16} color="#68D391" />
                            <Text style={styles.radiusLabel}>{radiusKm} km</Text>
                        </View>
                        <Slider
                            style={styles.radiusSlider}
                            minimumValue={1}
                            maximumValue={50}
                            step={1}
                            value={radiusKm}
                            onValueChange={(v: number) => setRadiusKm(v)}
                            minimumTrackTintColor="#68D391"
                            maximumTrackTintColor="#21262D"
                            thumbTintColor="#68D391"
                        />
                    </View>

                    {/* Bottom job card (when a pin is selected) */}
                    {selectedJob && (
                        <View style={styles.bottomCard}>
                            <View style={styles.cardHandle} />
                            <Text style={styles.cardTitle}>{selectedJob.title}</Text>
                            <Text style={styles.cardAddress}>
                                {selectedJob.location?.address || 'No address'}
                            </Text>
                            <View style={styles.cardDetails}>
                                <Text style={styles.cardDetailText}>
                                    {selectedJob.schedule?.date || 'ASAP'} · {selectedJob.schedule?.startTime || 'Flexible'}
                                </Text>
                                {locationLoaded && (
                                    <Text style={styles.cardDistanceText}>
                                        📍 {formatDistance(
                                            haversineKm(userLat, userLng,
                                                selectedJob.location?.latitude || 0,
                                                selectedJob.location?.longitude || 0)
                                        )} away
                                    </Text>
                                )}
                            </View>
                            <View style={styles.cardPriceRow}>
                                <Text style={styles.cardPrice}>${selectedJob.price?.toFixed(2) || '0.00'}</Text>
                                <Text style={styles.cardEarnings}>
                                    You earn: ${selectedJob.proEarnings?.toFixed(2) || '0.00'}
                                </Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={styles.acceptBtn}
                                    onPress={() => acceptJob(selectedJob)}
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

                    {/* Empty state when no jobs */}
                    {nearbyJobs.length === 0 && !loading && (
                        <View style={styles.emptyOverlay}>
                            <View style={styles.emptyBubble}>
                                <Ionicons name="search-outline" size={28} color="#718096" />
                                <Text style={styles.emptyText}>
                                    {jobs.length > 0 ? `No jobs within ${radiusKm} km` : 'No jobs available right now'}
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    {jobs.length > 0 ? 'Try increasing your radius' : 'New jobs will appear here in real-time'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {loading && (
                        <View style={styles.emptyOverlay}>
                            <ActivityIndicator size="large" color="#68D391" />
                        </View>
                    )}
                </View>
            ) : (
                /* List View */
                <View style={styles.listContainer}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.listHeader}>
                            <View>
                                <Text style={styles.greeting}>Hey {firstName} 👋</Text>
                                <View style={styles.onlineRow}>
                                    <View style={styles.onlineDot} />
                                    <Text style={styles.onlineLabel}>Online · {nearbyJobs.length} jobs</Text>
                                </View>
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
                                <Text style={styles.statValue}>${nearbyJobs.reduce((sum, j) => sum + (j.proEarnings || 0), 0).toFixed(0)}</Text>
                                <Text style={styles.statLabel}>Potential</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{nearbyJobs.length}</Text>
                                <Text style={styles.statLabel}>Within {radiusKm} km</Text>
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
                        {/* Search bar */}
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={18} color="#4A5568" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search jobs by name, address, type..."
                                placeholderTextColor="#4A5568"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                                clearButtonMode="while-editing"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color="#4A5568" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={styles.sectionTitle}>Available Jobs</Text>

                        {nearbyJobs.map((job) => (
                            <TouchableOpacity
                                key={job.id}
                                style={styles.jobListCard}
                                onPress={() => {
                                    if (job.id) {
                                        router.push({ pathname: '/(pro)/job-active', params: { jobId: job.id } });
                                    }
                                }}
                            >
                                <View
                                    style={[
                                        styles.jobBadge,
                                        { backgroundColor: getJobColor(job.type) + '20' },
                                    ]}
                                >
                                    <Ionicons
                                        name={getJobIcon(job.type) as any}
                                        size={22}
                                        color={getJobColor(job.type)}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.jobListTitle}>{job.title}</Text>
                                    <Text style={styles.jobListAddr}>
                                        {job.location?.address || 'No address'} · {formatDistance(job.distance)}
                                    </Text>
                                </View>
                                <Text style={styles.jobListPrice}>${job.price || 0}</Text>
                            </TouchableOpacity>
                        ))}

                        {nearbyJobs.length === 0 && !loading && (
                            <View style={styles.emptyCard}>
                                <Ionicons name="search-outline" size={40} color="#4A5568" />
                                <Text style={styles.emptyCardText}>
                                    No jobs available yet. New ones appear in real-time!
                                </Text>
                            </View>
                        )}

                        {loading && (
                            <View style={styles.emptyCard}>
                                <ActivityIndicator size="large" color="#68D391" />
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
        width: '100%',
        height: '100%',
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
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(13,17,23,0.85)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#68D391',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#68D391',
    },
    pinContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    viewToggle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(13,17,23,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Radius overlay
    radiusOverlay: {
        position: 'absolute',
        bottom: 140,
        left: 20,
        right: 20,
        zIndex: 5,
    },
    radiusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'center',
        backgroundColor: 'rgba(13,17,23,0.9)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        marginBottom: 8,
    },
    radiusLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#68D391',
    },
    radiusSlider: {
        width: '100%',
        height: 36,
    },
    // Bottom card
    bottomCard: {
        position: 'absolute',
        bottom: 140,
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
    cardDistanceText: {
        fontSize: 13,
        color: '#68D391',
        fontWeight: '600',
        marginTop: 4,
    },
    cardPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    cardPrice: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    cardEarnings: {
        fontSize: 13,
        color: '#68D391',
        fontWeight: '600',
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
    // Empty overlay
    emptyOverlay: {
        position: 'absolute',
        bottom: 140,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    emptyBubble: {
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(13,17,23,0.9)',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderRadius: 20,
    },
    emptyText: {
        fontSize: 15,
        color: '#A0AEC0',
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 12,
        color: '#4A5568',
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
        paddingTop: 8,
        paddingBottom: 12,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    onlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    onlineLabel: {
        fontSize: 13,
        color: '#68D391',
        fontWeight: '600',
    },
    viewToggleDark: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#161B22',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#21262D',
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
        borderRadius: 16,
        paddingVertical: 16,
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
        marginTop: 12,
        marginBottom: 16,
    },
    // Search bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#161B22',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 4,
        gap: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#21262D',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#E2E8F0',
        paddingVertical: 12,
    },
    jobListCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#161B22',
        borderRadius: 16,
        padding: 16,
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
        fontSize: 16,
        fontWeight: '700',
        color: '#E2E8F0',
    },
    jobListAddr: {
        fontSize: 12,
        color: '#718096',
        marginTop: 3,
    },
    jobListPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: '#68D391',
    },
    emptyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyCardText: {
        fontSize: 14,
        color: '#4A5568',
        textAlign: 'center',
        maxWidth: 240,
    },
});
