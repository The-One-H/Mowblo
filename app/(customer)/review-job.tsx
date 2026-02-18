import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { createReview } from '../../services/firebase';
import { useAuth } from '@clerk/clerk-expo';

export default function ReviewJobScreen() {
    const router = useRouter();
    const { jobId, proId, proName } = useLocalSearchParams();
    const { userId } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating.');
            return;
        }
        if (!userId || !proId || !jobId) return;

        setSubmitting(true);
        try {
            await createReview({
                toUserId: proId as string,
                fromUserId: userId,
                jobId: jobId as string,
                rating,
                comment: comment.trim(),
            });
            Alert.alert('Thanks! 🎉', 'Your review has been submitted.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            Alert.alert('Error', 'Failed to submit review. Please try again.');
        }
        setSubmitting(false);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="#1A2332" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Leave a Review</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <Animated.View entering={FadeInDown.duration(300)} style={styles.content}>
                        {/* Pro name */}
                        <View style={styles.proCard}>
                            <View style={styles.proAvatar}>
                                <Text style={styles.proAvatarText}>
                                    {(proName as string)?.[0]?.toUpperCase() || 'P'}
                                </Text>
                            </View>
                            <Text style={styles.proLabel}>
                                How was your experience with{' '}
                                <Text style={styles.proName}>{proName || 'your pro'}?</Text>
                            </Text>
                        </View>

                        {/* Star rating */}
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={star <= rating ? 'star' : 'star-outline'}
                                        size={48}
                                        color={star <= rating ? '#F6D155' : '#CBD5E0'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.ratingLabel}>
                            {rating === 0 && 'Tap to rate'}
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Great'}
                            {rating === 5 && 'Excellent!'}
                        </Text>

                        {/* Comment */}
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Share details about your experience..."
                            placeholderTextColor="#A0AEC0"
                            multiline
                            value={comment}
                            onChangeText={setComment}
                            textAlignVertical="top"
                        />

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting || rating === 0}
                        >
                            <Text style={styles.submitBtnText}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.skipBtn} onPress={() => router.back()}>
                            <Text style={styles.skipText}>Skip for now</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A2332',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        alignItems: 'center',
    },
    proCard: {
        alignItems: 'center',
        marginBottom: 32,
    },
    proAvatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#22543D',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    proAvatarText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#68D391',
    },
    proLabel: {
        fontSize: 17,
        color: '#4A5568',
        textAlign: 'center',
    },
    proName: {
        fontWeight: '700',
        color: '#1A2332',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#718096',
        marginBottom: 32,
    },
    commentInput: {
        width: '100%',
        minHeight: 120,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        color: '#1A2332',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 24,
    },
    submitBtn: {
        width: '100%',
        backgroundColor: '#22543D',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#68D391',
    },
    skipBtn: {
        marginTop: 16,
        paddingVertical: 12,
    },
    skipText: {
        fontSize: 15,
        color: '#A0AEC0',
        fontWeight: '500',
    },
});
