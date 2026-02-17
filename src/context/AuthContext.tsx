'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    _id?: string;
    phone: string;
    name?: string;
    email?: string;
    role: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: any) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                const parsedUser = JSON.parse(storedUser);
                // Ensure ID normalization for stored user
                const normalizedUser = {
                    ...parsedUser,
                    id: parsedUser.id || parsedUser._id
                };
                setUser(normalizedUser);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: any) => {
        const normalizedUser = {
            ...newUser,
            id: newUser.id || newUser._id
        };
        setToken(newToken);
        setUser(normalizedUser);
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(normalizedUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
