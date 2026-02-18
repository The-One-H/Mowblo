export type UserRole = 'customer' | 'pro';
export type ServiceType = 'lawn' | 'snow';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
    avatarUrl?: string;
}

export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

export interface Job {
    id: string;
    serviceType: ServiceType;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    price: number;
    customerLocation: Location;
    createdAt: string;
}
