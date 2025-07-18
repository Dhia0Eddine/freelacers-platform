// src/hooks/useAuth.ts
import { useState } from "react";
import axios from "@/lib/axios"; // your custom axios instance
import { useNavigate } from "react-router-dom";
import type { LoginData, AuthResponse } from "@/types/auth";
import qs from "qs"; // used to encode form data for FastAPI
import { useAuthContext } from "@/context/AuthContext";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: setTokenInContext } = useAuthContext(); // Use context to update state

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>(
        "/auth/login",
        qs.stringify({
          // FastAPI's OAuth2PasswordRequestForm expects these exact names
          username: data.email,
          password: data.password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Save token to localStorage
      const token = response.data.access_token;
      localStorage.setItem("token", token);

      // Update token in context
      setTokenInContext(token);

      // Redirect to homepage
      navigate("/");
    } catch (err: any) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        // Handle validation errors array (unlikely with OAuth2PasswordRequestForm, but safe)
        const messages = detail.map((item: any) => item.msg).join(", ");
        setError(messages);
      } else {
        // Handle string error messages
        setError(detail || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
