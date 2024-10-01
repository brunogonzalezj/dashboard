import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:3001/check-auth', { withCredentials: true });
                if (response.data.isAuthenticated) {
                    setIsAuthenticated(true);
                    setUserRole(response.data.role);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
            }
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:3001/login', { username, password }, { withCredentials: true });
            setIsAuthenticated(true);
            setUserRole(response.data.role);
        } catch (error) {
            throw new Error('Login failed');
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:3001/logout', {}, { withCredentials: true });
            setIsAuthenticated(false);
            setUserRole(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};