const API_URL: string | undefined = import.meta.env.VITE_API_URL;

export class AuthError extends Error {}

export async function signIn(email: string, password: string) {
  if (!API_URL) {
    throw new AuthError("El acceso todavía no está habilitado. Probá de nuevo más tarde.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AuthError("No pudimos conectarnos. Revisá tu conexión y probá de nuevo.");
  }

  if (response.status === 401) {
    throw new AuthError("Email o contraseña incorrectos.");
  }
  if (!response.ok) {
    throw new AuthError("Algo salió mal de nuestro lado. Probá de nuevo en unos minutos.");
  }
}
