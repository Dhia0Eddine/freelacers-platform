// // src/components/forms/LoginForm.tsx
// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/hooks/useAuth";
// import { useNavigate } from "react-router-dom";

// export const LoginForm = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { login, isLoading, error } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const success = await login({ email, password });
//     if (success) navigate("/"); // Redirect to homepage
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <Input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />
//       <Input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />
//       {error && <p className="text-red-500 text-sm">{error}</p>}
//       <Button type="submit" disabled={isLoading} className="w-full">
//         {isLoading ? "Logging in..." : "Login"}
//       </Button>
//     </form>
//   );
// };
