export interface User {
    id: number;
    username: string;
    role: string;
    company: string | null;
    fullName: string | null;
    email: string | null;
    phone: string | null;
    password: string | null;
}