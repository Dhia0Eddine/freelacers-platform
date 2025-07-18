// src/components/auth/RegisterForm.tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRegister } from "@/hooks/useRegister"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"customer" | "provider">("customer")
  const { register, isLoading, error } = useRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register({ email, password, role })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div>
        <Label>Password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <div>
        <Label>Role</Label>
        <Select value={role} onValueChange={(value) => setRole(value as "customer" | "provider")}>
          <SelectTrigger>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="provider">Provider</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </Button>
    </form>
  )
}
