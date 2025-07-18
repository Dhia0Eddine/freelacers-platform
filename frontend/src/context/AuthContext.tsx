import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem("token");
            if (storedToken) setToken(storedToken);
        } catch (error) {
            console.error("Failed to access localStorage:", error);
        }
        setInitialized(true);
    }, []);

    const login = (newToken: string) => {
        try {
            localStorage.setItem("token", newToken);
            setToken(newToken);
        } catch (error) {
            console.error("Failed to save token to localStorage:", error);
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem("token");
            setToken(null);
        } catch (error) {
            console.error("Failed to remove token from localStorage:", error);
        }
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout, initialized }}>
            {initialized ? children : <div>Loading...</div>}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuthContext must be used inside AuthProvider");
    return context;
};
