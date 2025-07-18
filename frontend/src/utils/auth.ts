// src/utils/auth.ts
export function saveToken(token: string) {
  localStorage.setItem("access_token", token)
}

export function getToken(): string | null {
  return localStorage.getItem("access_token")
}

export function clearToken() {
  localStorage.removeItem("access_token")
}
