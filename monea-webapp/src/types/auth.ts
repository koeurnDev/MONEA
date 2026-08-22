export interface AuthUser {
    id: string;
    userId: string;
    email: string;
    name: string | null;
    role: string;
    weddingId?: string;
    type: "admin" | "user" | "staff";
}

export interface StaffUser {
    staffId: string;
    weddingId: string;
    role: "EVENT_STAFF";
    name: string;
}
