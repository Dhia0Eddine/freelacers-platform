import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_URL } from "@/config";

interface UserInfo {
    sub: string;
    role?: string;
    exp: number;
}

interface UserData {
    id: number;
    email: string;
    role: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    userRole: string | null;
    userData: UserData | null;
    login: (token: string) => void;
    logout: () => void;
    initialized: boolean;
    isCustomer: boolean;
    isProvider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [initialized, setInitialized] = useState(false);

    // Function to fetch user data from the server
    const fetchUserData = async (authToken: string) => {
        try {
            const response = await axios.get(`${API_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            
            console.log("User data fetched:", response.data);
            
            setUserData(response.data);
            setUserRole(response.data.role);
            
            return response.data;
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            return null;
        }
    };

    // Function to decode JWT - only used as fallback
    const parseToken = (tokenToParse: string) => {
        try {
            console.log("Attempting to decode token:", tokenToParse.substring(0, 20) + "...");
            
            const decoded = jwtDecode<UserInfo>(tokenToParse);
            console.log("Token decoded successfully:", decoded);
            
            // We'll use this role only temporarily until we fetch the actual user data
            if (decoded.role) {
                console.log(`Setting temporary role from token: ${decoded.role}`);
                setUserRole(decoded.role);
            }
        } catch (error) {
            console.error("Failed to decode token:", error);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem("token");
                
                if (storedToken) {
                    console.log("Found token in storage, length:", storedToken.length);
                    setToken(storedToken);
                    
                    // First do a quick parse of the token for immediate UI feedback
                    parseToken(storedToken);
                    
                    // Then fetch the actual user data from the server
                    await fetchUserData(storedToken);
                } else {
                    console.log("No token found in storage");
                }
            } catch (error) {
                console.error("Failed to initialize auth:", error);
            } finally {
                setInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    const login = async (newToken: string) => {
        try {
            localStorage.setItem("token", newToken);
            setToken(newToken);
            
            // First do a quick parse of the token for immediate UI feedback
            parseToken(newToken);
            
            // Then fetch the actual user data from the server
            await fetchUserData(newToken);
        } catch (error) {
            console.error("Failed to process login:", error);
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem("token");
            setToken(null);
            setUserRole(null);
            setUserData(null);
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    const isAuthenticated = !!token;
    
    // Determine user role based on userData first, then fallback to token-parsed role
    const isProvider = userRole === 'provider';
    const isCustomer = userRole === 'customer';

    console.log("Auth context state:", { isAuthenticated, userRole, isProvider, isCustomer });

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            token, 
            userRole, 
            userData,
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
