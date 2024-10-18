import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: string | null;
    username: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    const [userRole, setUserRole] = useState<string | null>(() => {
        return localStorage.getItem('userRole');
    });
    const [username, setUsername] = useState<string | null>(() => {
        return localStorage.getItem('username');
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:3001/check-auth', {
                    withCredentials: true,
                });
                if (response.data.isAuthenticated) {
                    setIsAuthenticated(true);
                    setUserRole(response.data.role);
                    setUsername(response.data.username);

                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userRole', response.data.role);
                    localStorage.setItem('username', response.data.username);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                setIsAuthenticated(false);
                setUserRole(null);
                setUsername(null);

                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userRole');
                localStorage.removeItem('username');
            }
        };

        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:3001/login', { username, password }, {
                withCredentials: true,
            });
            setIsAuthenticated(true);
            setUserRole(response.data.role);
            setUsername(response.data.username);

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', response.data.role);
            localStorage.setItem('username', response.data.username);
        } catch (error) {
            console.error('Login failed:', error);
            setIsAuthenticated(false);
            setUserRole(null);
            setUsername(null);

            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:3001/logout', {}, { withCredentials: true });
            setIsAuthenticated(false);
            setUserRole(null);
            setUsername(null);

            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};