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
    isProvider: boolean;  // Add this property to fix the TypeScript error
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    // Function to decode JWT and extract user role
    const parseToken = (token: string) => {
        try {
            // Add more detailed logging for token debugging
            console.log("Attempting to decode token:", token.substring(0, 20) + "...");
            
            const decoded = jwtDecode<UserInfo>(token);
            console.log("Token decoded successfully:", decoded);
            
            if (!decoded.role) {
                console.error("Token decoded but no role found:", decoded);
                setUserRole("customer"); // Default to customer if no role found
            } else {
                // Normalize role names to match backend (only 'customer' or 'provider')
                const normalizedRole = decoded.role === "freelancer" ? "provider" : decoded.role;
                console.log(`Setting normalized user role to: ${normalizedRole}`);
                setUserRole(normalizedRole);
            }
        } catch (error) {
            console.error("Failed to decode token:", error);
            console.error("Token content:", token.substring(0, 20) + "...");
            // Default to customer when token decoding fails
            console.log("Setting default role to customer due to decoding failure");
            setUserRole("customer");
        }
    };

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                console.log("Found token in storage, length:", storedToken.length);
                setToken(storedToken);
                parseToken(storedToken);
            } else {
                console.log("No token found in storage");
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
    const isCustomer = userRole === 'customer' || userRole === null || userRole === undefined;
    const isProvider = userRole === 'provider';

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            token, 
            userRole, 
            login, 
            logout, 
            initialized,
            isCustomer,
            isProvider
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
