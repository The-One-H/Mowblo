import { create } from 'zustand';
import { UserRole, ServiceType, Location } from '../types';

interface AppState {
    // User State
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;

    // Active Context
    activeService: ServiceType;
    setActiveService: (service: ServiceType) => void;

    // Location State
    currentLocation: Location | null;
    setCurrentLocation: (location: Location) => void;

    // Saved Home Address
    homeAddress: string;
    setHomeAddress: (address: string) => void;

    // UI State
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    // Default to customer role
    userRole: 'customer',
    setUserRole: (role) => set({ userRole: role }),

    // Default to snow service (Mowblo spec preference for winter)
    activeService: 'snow',
    setActiveService: (service) => set({ activeService: service }),

    currentLocation: null,
    setCurrentLocation: (location) => set({ currentLocation: location }),

    homeAddress: '',
    setHomeAddress: (address) => set({ homeAddress: address }),

    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
}));
