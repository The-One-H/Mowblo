import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../../store/useStore';
import { Colors } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const LAWN_ADDONS = [
    { id: 'standard', label: 'Standard Mow', price: 0, included: true },
    { id: 'edge', label: 'Edge Trimming', price: 12 },
    { id: 'weed', label: 'Weed Whacking', price: 10 },
    { id: 'leaf', label: 'Leaf Blowout', price: 15 },
    { id: 'garden', label: 'Garden Bed Edging', price: 20 },
    { id: 'bag', label: 'Bag & Dispose Clippings', price: 8 },
    { id: 'deep', label: 'First-Time Deep Clean', price: 25 },
];

const SNOW_ADDONS = [
    { id: 'driveway', label: 'Driveway Clearing', price: 0, included: true },
    { id: 'walkway', label: 'Front Walkway', price: 10 },
    { id: 'patio', label: 'Back Patio', price: 12 },
    { id: 'roof', label: 'Roof Rake (de-icing)', price: 20 },
    { id: 'salt', label: 'De-Icing Salt Application', price: 15 },
    { id: 'sidewalk', label: 'Sidewalk to Street', price: 8 },
    { id: 'perimeter', label: 'Full Property Perimeter', price: 35 },
];

const PROPERTY_TYPES = [
    { id: 'house', label: 'House', icon: 'home' },
    { id: 'condo', label: 'Condo', icon: 'business' },
    { id: 'commercial', label: 'Commercial', icon: 'storefront' },
];

const SIZES = [
    { id: 'small', label: 'Small', subtitle: '<2,000 ft²', basePrice: 35 },
    { id: 'medium', label: 'Medium', subtitle: '2,000-5,000 ft²', basePrice: 45 },
    { id: 'large', label: 'Large', subtitle: '5,000+ ft²', basePrice: 65 },
];

export default function ConfigureServiceScreen() {
    const router = useRouter();
    const { activeService } = useStore();
    const isSnow = activeService === 'snow';

    const [propertyType, setPropertyType] = useState('house');
    const [sizeIndex, setSizeIndex] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [instructions, setInstructions] = useState('');

    const addons = isSnow ? SNOW_ADDONS : LAWN_ADDONS;
    const accentColor = isSnow ? Colors.primary.blue : Colors.primary.green;
    const accentDark = isSnow ? Colors.accent.blue : Colors.accent.green;

    const toggleAddon = (id: string) => {
        setSelectedAddons((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
        );
    };

    const { subtotal, fee, total } = useMemo(() => {
        const base = SIZES[sizeIndex].basePrice + (isSnow ? 10 : 0);
        const addonsTotal = addons
            .filter((a) => selectedAddons.includes(a.id))
            .reduce((sum, a) => sum + a.price, 0);
        const sub = base + addonsTotal;
        const f = Math.round(sub * 0.1 * 100) / 100;
        return { subtotal: sub, fee: f, total: sub + f };
    }, [sizeIndex, selectedAddons, isSnow]);

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1A2332" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isSnow ? '❄️ Snow Removal' : '🌿 Lawn Mowing'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 180 }}
            >
                {/* Property Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Type</Text>
                    <View style={styles.propertyTypes}>
                        {PROPERTY_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => setPropertyType(type.id)}
                                style={[
                                    styles.propertyCard,
                                    propertyType === type.id && {
                                        borderColor: accentColor,
                                        backgroundColor: accentColor + '10',
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={type.icon as any}
                                    size={28}
                                    color={propertyType === type.id ? accentColor : Colors.text.grayMid}
                                />
                                <Text
                                    style={[
                                        styles.propertyLabel,
                                        propertyType === type.id && { color: accentDark, fontWeight: '700' },
                                    ]}
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Property Size */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Size</Text>
                    <View style={styles.sizeRow}>
                        {SIZES.map((size, idx) => (
                            <TouchableOpacity
                                key={size.id}
                                onPress={() => setSizeIndex(idx)}
                                style={[
                                    styles.sizeCard,
                                    sizeIndex === idx && {
                                        borderColor: accentColor,
                                        backgroundColor: accentColor + '10',
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.sizeLabel,
                                        sizeIndex === idx && { color: accentDark, fontWeight: '700' },
                                    ]}
                                >
                                    {size.label}
                                </Text>
                                <Text style={styles.sizeSub}>{size.subtitle}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Add-ons */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Add-ons</Text>
                    <View style={styles.addonsList}>
                        {addons.map((addon) => {
                            const isIncluded = addon.included;
                            const isSelected = isIncluded || selectedAddons.includes(addon.id);
                            return (
                                <TouchableOpacity
                                    key={addon.id}
                                    disabled={isIncluded}
                                    onPress={() => toggleAddon(addon.id)}
                                    style={[
                                        styles.addonItem,
                                        isSelected && !isIncluded && { backgroundColor: accentColor + '08' },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.addonCheckbox,
                                            isSelected && { backgroundColor: accentColor, borderColor: accentColor },
                                        ]}
                                    >
                                        {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                                    </View>
                                    <Text style={[styles.addonLabel, isIncluded && { color: Colors.text.grayMid }]}>
                                        {addon.label}
                                    </Text>
                                    <Text style={[styles.addonPrice, isIncluded && { color: accentColor }]}>
                                        {isIncluded ? 'Included' : `+$${addon.price}`}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Special Instructions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Special Instructions</Text>
                    <TextInput
                        style={styles.instructionsInput}
                        placeholder="Anything your Pro should know? e.g. gate code, dog in backyard..."
                        placeholderTextColor={Colors.text.grayMid}
                        multiline
                        maxLength={300}
                        value={instructions}
                        onChangeText={setInstructions}
                    />
                    <Text style={styles.charCount}>{instructions.length}/300</Text>
                </View>
            </ScrollView>

            {/* Sticky Bottom Summary */}
            <View style={styles.stickyBottom}>
                <LinearGradient
                    colors={[accentDark, accentColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.stickyGradient}
                >
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Subtotal</Text>
                        <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabelSm}>Mowblo fee (10%)</Text>
                        <Text style={styles.priceValueSm}>${fee.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.continueButton} activeOpacity={0.9}>
                        <Text style={styles.continueButtonText}>Continue to Schedule →</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A2332',
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A2332',
        marginBottom: 12,
    },
    propertyTypes: {
        flexDirection: 'row',
        gap: 10,
    },
    propertyCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    propertyLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A2332',
    },
    sizeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    sizeCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    sizeLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A2332',
    },
    sizeSub: {
        fontSize: 11,
        color: Colors.text.grayMid,
        marginTop: 2,
    },
    addonsList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
    },
    addonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F3F6',
        gap: 12,
    },
    addonCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D8DF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addonLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#1A2332',
    },
    addonPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A2332',
    },
    instructionsInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        minHeight: 100,
        fontSize: 14,
        color: '#1A2332',
        textAlignVertical: 'top',
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: Colors.text.grayMid,
        marginTop: 4,
    },
    stickyBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    stickyGradient: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    priceLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    priceLabelSm: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    priceValueSm: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    totalRow: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 8,
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
    continueButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A2332',
    },
});
