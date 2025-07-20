import React, { createContext, useContext, useEffect, useState } from "react";
import  { jwtDecode } from "jwt-decode";

interface UserInfo {
    sub: string;
    role: string;
    exp: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    userRole: string | null;
    login: (token: string) => void;
    logout: () => void;
    initialized: boolean;
    isCustomer: boolean;  // New helper property
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    // Function to decode JWT and extract user role
    const parseToken = (token: string) => {
        try {
            const decoded = jwtDecode<UserInfo>(token);
            setUserRole(decoded.role);
        } catch (error) {
            console.error("Failed to decode token:", error);
            setUserRole(null);
        }
    };

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                parseToken(storedToken);
            }
        } catch (error) {
            console.error("Failed to access localStorage:", error);
        }
        setInitialized(true);
    }, []);

    const login = (newToken: string) => {
        try {
            localStorage.setItem("token", newToken);
            setToken(newToken);
            parseToken(newToken);
        } catch (error) {
            console.error("Failed to save token to localStorage:", error);
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem("token");
            setToken(null);
            setUserRole(null);
        } catch (error) {
            console.error("Failed to remove token from localStorage:", error);
        }
    };

    const isAuthenticated = !!token;
    const isCustomer = userRole === 'customer';

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            token, 
            userRole, 
            login, 
            logout, 
            initialized,
            isCustomer
        }}>
            {initialized ? children : <div>Loading...</div>}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuthContext must be used inside AuthProvider");
    return context;
};
