// src/hooks/useAuth.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api";
import { useAuthContext } from "@/context/AuthContext";

interface LoginData {
  email: string;
  password: string;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: setTokenInContext } = useAuthContext();

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      // Use the authService from our api.ts file
      const response = await authService.login(data.email, data.password);

      // Update token in context
      setTokenInContext(response.access_token);

      // Redirect to homepage
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
