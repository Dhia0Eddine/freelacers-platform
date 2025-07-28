// src/pages/login/LoginPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {Button} from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/login-form"
export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className={`flex min-h-svh w-full items-center justify-center p-6 md:p-10 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-2xl font-bold text-center mb-6">{t("login")}</h1>
          {error && <div className="bg-red-50 text-red-700 p-2 rounded">{error}</div>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">{t("email")}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t("email")}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">{t("password")}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
            disabled={loading}
          >
            {loading ? t("loading") : t("login")}
          </Button>
        </form>
      </div>
    </div>
  );
}
