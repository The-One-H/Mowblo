import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform,
    Alert,
    Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

// Lazy imports — these native modules may not be available without a native rebuild
let Location: any = null;
let ImagePicker: any = null;
try { Location = require('expo-location'); } catch (e) { /* native module not available */ }
try { ImagePicker = require('expo-image-picker'); } catch (e) { /* native module not available */ }
import { createJob } from '../../services/firebase';
import { useStore } from '../../store/useStore';

const STEPS = ['Type', 'When', 'Where', 'Details', 'Review'];

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

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TOOLS = [
    'Lawn Mower', 'Snow Shovel', 'Leaf Blower', 'Edge Trimmer', 'Rake', 'Salt Spreader',
];

function formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(d: Date): string {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function CreateJobScreen() {
    const router = useRouter();
    const { userId } = useAuth();
    const { homeAddress, setHomeAddress } = useStore();
    const [step, setStep] = useState(0);

    // Step 0: Type
    const [jobType, setJobType] = useState('');

    // Step 1: Time
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(() => {
        const d = new Date(); d.setHours(9, 0, 0, 0); return d;
    });
    const [frequency, setFrequency] = useState('once');
    const [recurringDay, setRecurringDay] = useState(1); // Monday default

    // Step 2: Location
    const [address, setAddress] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [showHomeInput, setShowHomeInput] = useState(false);
    const [tempHomeAddress, setTempHomeAddress] = useState('');

    // Step 3: Details
    const [tasks, setTasks] = useState([{ label: '', completed: false }]);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [instructions, setInstructions] = useState('');
    const [price, setPrice] = useState('50');
    const [mediaUris, setMediaUris] = useState<{ uri: string; type: 'image' | 'video' }[]>([]);

    const canProceed = () => {
        switch (step) {
            case 0: return !!jobType;
            case 1: return true; // date picker always has a value
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

    // Location handlers
    const useCurrentLocation = async () => {
        if (!Location) {
            Alert.alert('Not Available', 'Location requires a native rebuild. Please enter address manually.');
            return;
        }
        setIsLoadingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required.');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            const [geo] = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
            if (geo) {
                const addr = `${geo.street || ''} ${geo.name || ''}, ${geo.city || ''}, ${geo.region || ''}`.trim();
                setAddress(addr);
            }
        } catch (err) {
            Alert.alert('Error', 'Could not get location. Please enter manually.');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const useHomeAddress = () => {
        if (homeAddress) {
            setAddress(homeAddress);
        } else {
            setShowHomeInput(true);
        }
    };

    const saveHomeAddress = () => {
        if (tempHomeAddress.trim()) {
            setHomeAddress(tempHomeAddress.trim());
            setAddress(tempHomeAddress.trim());
            setShowHomeInput(false);
            setTempHomeAddress('');
        }
    };

    // Media handlers
    const pickImage = async () => {
        if (!ImagePicker) {
            Alert.alert('Not Available', 'Camera requires a native rebuild.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            const newMedia = result.assets.map((a: any) => ({ uri: a.uri, type: 'image' as const }));
            setMediaUris((prev: any) => [...prev, ...newMedia]);
        }
    };

    const takePhoto = async () => {
        if (!ImagePicker) {
            Alert.alert('Not Available', 'Camera requires a native rebuild.');
            return;
        }
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });
        if (!result.canceled) {
            setMediaUris((prev: any) => [...prev, { uri: result.assets[0].uri, type: 'image' }]);
        }
    };

    const recordVideo = async () => {
        if (!ImagePicker) {
            Alert.alert('Not Available', 'Camera requires a native rebuild.');
            return;
        }
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera permission is needed to record video.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['videos'],
            videoMaxDuration: 60,
        });
        if (!result.canceled) {
            setMediaUris((prev: any) => [...prev, { uri: result.assets[0].uri, type: 'video' }]);
        }
    };

    const removeMedia = (index: number) => {
        setMediaUris((prev: any) => prev.filter((_: any, i: number) => i !== index));
    };

    const handlePost = async () => {
        if (!userId) return;
        const dateStr = selectedDate.toISOString().split('T')[0];
        const timeStr = formatTime(selectedTime);

        try {
            await createJob({
                customerId: userId,
                type: jobType as 'lawn' | 'snow',
                status: 'posted',
                title: JOB_TYPES.find((j) => j.id === jobType)?.label || 'Job',
                location: { latitude: 0, longitude: 0, address },
                schedule: {
                    date: dateStr,
                    startTime: timeStr,
                    endTime: 'Flexible',
                    frequency: frequency as any,
                    ...(frequency !== 'once' ? { recurringDay: WEEKDAYS[recurringDay] } : {}),
                } as any,
                tasks: tasks.filter((t) => t.label.trim()),
                addons: [],
                toolsProvided: selectedTools,
                photos: mediaUris.map((m) => m.uri),
                instructions,
                price: parseFloat(price) || 50,
                platformFee: 0,
                proEarnings: 0,
            });

            Alert.alert('Job Posted! 🎉', 'Your job is now visible to nearby Pros.', [
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
                    <Text style={styles.headerTitle}>New Job</Text>
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
                {/* ============ Step 0: What? ============ */}
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

                {/* ============ Step 1: When? ============ */}
                {step === 1 && (
                    <Animated.View entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>When do you need it?</Text>

                        {/* Date Picker */}
                        <Text style={styles.fieldLabel}>Pick a date</Text>
                        <View style={styles.pickerCard}>
                            <Ionicons name="calendar-outline" size={22} color="#4A9EC4" />
                            <Text style={styles.pickerSelectedText}>{formatDate(selectedDate)}</Text>
                        </View>
                        <View style={styles.pickerContainer}>
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="spinner"
                                minimumDate={new Date()}
                                onChange={(_e: any, d?: Date) => { if (d) setSelectedDate(d); }}
                                textColor="#1A2332"
                                style={{ height: 150 }}
                            />
                        </View>

                        {/* Time Picker */}
                        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Start time</Text>
                        <View style={styles.pickerCard}>
                            <Ionicons name="time-outline" size={22} color="#E67E22" />
                            <Text style={styles.pickerSelectedText}>{formatTime(selectedTime)}</Text>
                        </View>
                        <View style={styles.pickerContainer}>
                            <DateTimePicker
                                value={selectedTime}
                                mode="time"
                                display="spinner"
                                minuteInterval={15}
                                onChange={(_e: any, d?: Date) => { if (d) setSelectedTime(d); }}
                                textColor="#1A2332"
                                style={{ height: 150 }}
                            />
                        </View>

                        {/* Frequency */}
                        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>How often?</Text>
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

                        {/* Recurring day picker for weekly/biweekly */}
                        {(frequency === 'weekly' || frequency === 'biweekly') && (
                            <View style={{ marginTop: 16 }}>
                                <Text style={styles.fieldLabel}>Repeat on which day?</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                                    <View style={styles.dayPickerRow}>
                                        {WEEKDAYS.map((day, i) => (
                                            <TouchableOpacity
                                                key={day}
                                                onPress={() => setRecurringDay(i)}
                                                style={[
                                                    styles.dayChip,
                                                    recurringDay === i && styles.dayChipActive,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dayChipText,
                                                        recurringDay === i && styles.dayChipTextActive,
                                                    ]}
                                                >
                                                    {day.slice(0, 3)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}
                    </Animated.View>
                )}

                {/* ============ Step 2: Where? ============ */}
                {step === 2 && (
                    <Animated.View entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>Where is the job?</Text>

                        {/* Quick location buttons */}
                        <View style={styles.locationShortcuts}>
                            <TouchableOpacity
                                style={styles.locationBtn}
                                onPress={useCurrentLocation}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={isLoadingLocation ? 'hourglass' : 'navigate'}
                                    size={20}
                                    color="#4A9EC4"
                                />
                                <Text style={styles.locationBtnText}>
                                    {isLoadingLocation ? 'Finding...' : 'Current Location'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.locationBtn, styles.homeBtn]}
                                onPress={useHomeAddress}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="home" size={20} color="#E67E22" />
                                <Text style={[styles.locationBtnText, { color: '#E67E22' }]}>
                                    {homeAddress ? 'My Home' : 'Set Home'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Save home address inline input */}
                        {showHomeInput && (
                            <View style={styles.homeInputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Enter your home address"
                                    placeholderTextColor="#A0AEC0"
                                    value={tempHomeAddress}
                                    onChangeText={setTempHomeAddress}
                                    autoFocus
                                />
                                <TouchableOpacity style={styles.saveHomeBtn} onPress={saveHomeAddress}>
                                    <Text style={styles.saveHomeBtnText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {homeAddress && !showHomeInput && (
                            <Text style={styles.savedHomeLabel}>
                                🏠 Saved: {homeAddress}
                            </Text>
                        )}

                        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Or enter address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="123 Kingston Crescent"
                            placeholderTextColor="#A0AEC0"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </Animated.View>
                )}

                {/* ============ Step 3: Details ============ */}
                {step === 3 && (
                    <Animated.View entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(200)}>
                        <Text style={styles.stepTitle}>Job Details</Text>

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

                        {/* Photo/Video Section */}
                        <Text style={[styles.fieldLabel, { marginTop: 24 }]}>
                            Show the Pro what to do
                        </Text>
                        <Text style={styles.fieldHint}>
                            Add photos or record a quick video to help the Pro understand the job
                        </Text>

                        <View style={styles.mediaButtonRow}>
                            <TouchableOpacity style={styles.mediaBtn} onPress={takePhoto}>
                                <Ionicons name="camera" size={22} color="#4A9EC4" />
                                <Text style={styles.mediaBtnText}>Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.mediaBtn} onPress={recordVideo}>
                                <Ionicons name="videocam" size={22} color="#E74C3C" />
                                <Text style={styles.mediaBtnText}>Video</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.mediaBtn} onPress={pickImage}>
                                <Ionicons name="images" size={22} color="#9B59B6" />
                                <Text style={styles.mediaBtnText}>Gallery</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Media Previews */}
                        {mediaUris.length > 0 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaPreviews}>
                                {mediaUris.map((media, i) => (
                                    <View key={i} style={styles.mediaPreview}>
                                        <Image source={{ uri: media.uri }} style={styles.mediaThumb} />
                                        {media.type === 'video' && (
                                            <View style={styles.videoBadge}>
                                                <Ionicons name="play" size={14} color="#FFF" />
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            style={styles.removeMedia}
                                            onPress={() => removeMedia(i)}
                                        >
                                            <Ionicons name="close-circle" size={22} color="#E74C3C" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

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

                {/* ============ Step 4: Review ============ */}
                {step === 4 && (
                    <Animated.View entering={FadeInRight.duration(250)}>
                        <Text style={styles.stepTitle}>Review & Post</Text>

                        <View style={styles.reviewCard}>
                            <ReviewRow label="Job Type" value={JOB_TYPES.find((j) => j.id === jobType)?.label || ''} />
                            <ReviewRow label="Location" value={address || 'Current location'} />
                            <ReviewRow label="Date" value={formatDate(selectedDate)} />
                            <ReviewRow label="Time" value={formatTime(selectedTime)} />
                            <ReviewRow label="Frequency" value={frequency + (frequency !== 'once' ? ` (${WEEKDAYS[recurringDay]})` : '')} />
                            <ReviewRow label="Tasks" value={tasks.filter((t) => t.label).map((t) => t.label).join(', ') || 'None'} />
                            <ReviewRow label="Tools" value={selectedTools.join(', ') || 'None provided'} />
                            <ReviewRow label="Media" value={mediaUris.length > 0 ? `${mediaUris.length} file(s)` : 'None'} />
                            <ReviewRow label="Budget" value={`$${price}`} />
                            {instructions ? <ReviewRow label="Notes" value={instructions} /> : null}
                        </View>

                        {/* Media preview in review */}
                        {mediaUris.length > 0 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewMedia}>
                                {mediaUris.map((media, i) => (
                                    <Image key={i} source={{ uri: media.uri }} style={styles.reviewThumb} />
                                ))}
                            </ScrollView>
                        )}

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
    fieldHint: {
        fontSize: 12,
        color: '#8E99A4',
        marginBottom: 12,
        marginTop: -4,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        color: '#1A2332',
        marginBottom: 16,
    },
    // Native picker styles
    pickerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 8,
    },
    pickerSelectedText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A2332',
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 8,
    },
    dayPickerRow: {
        flexDirection: 'row',
        gap: 8,
    },
    dayChip: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8ECF0',
    },
    dayChipActive: {
        backgroundColor: '#1A2332',
        borderColor: '#1A2332',
    },
    dayChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
    },
    dayChipTextActive: {
        color: '#FFFFFF',
    },
    // Frequency
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
    // Location
    locationShortcuts: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    locationBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#EEF6FB',
        padding: 16,
        borderRadius: 14,
    },
    homeBtn: {
        backgroundColor: '#FEF3E2',
    },
    locationBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A9EC4',
    },
    homeInputRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginBottom: 16,
    },
    saveHomeBtn: {
        backgroundColor: '#1A2332',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    saveHomeBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    savedHomeLabel: {
        fontSize: 13,
        color: '#8E99A4',
        marginBottom: 8,
    },
    // Media
    mediaButtonRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    mediaBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8ECF0',
    },
    mediaBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4A5568',
    },
    mediaPreviews: {
        marginBottom: 16,
    },
    mediaPreview: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 10,
        overflow: 'hidden',
    },
    mediaThumb: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    videoBadge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeMedia: {
        position: 'absolute',
        top: -2,
        right: -2,
    },
    // Tasks
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
    // Tools
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
    // Type grid
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
    // Review
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
    reviewMedia: {
        marginTop: 16,
        marginBottom: 8,
    },
    reviewThumb: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 8,
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
