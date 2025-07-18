// src/services/authAPI.ts
import axios from "@/lib/axios"; // Custom axios instance with base URL

export const loginUser = async (email: string, password: string) => {
  const data = new URLSearchParams();
  data.append("username", email);
  data.append("password", password);

  const response = await axios.post("/auth/login", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data; // { access_token, token_type }
};
