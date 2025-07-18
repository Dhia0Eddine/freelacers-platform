// src/hooks/useRegister.ts
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

interface RegisterData {
  email: string
  password: string
  role: "customer" | "provider"
}

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    setError("")
    try {
      await axios.post("http://localhost:8000/auth/register", data)
      navigate("/login")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error }
}
