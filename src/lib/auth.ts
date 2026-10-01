const API_URL: string | undefined = import.meta.env.VITE_API_URL;

export class AuthError extends Error {}

async function post(path: string, body: Record<string, string>) {
  if (!API_URL) {
    throw new AuthError("El acceso todavía no está habilitado. Probá de nuevo más tarde.");
  }
  try {
    return await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError("No pudimos conectarnos. Revisá tu conexión y probá de nuevo.");
  }
}

const GENERIC_ERROR = "Algo salió mal de nuestro lado. Probá de nuevo en unos minutos.";

export async function signIn(email: string, password: string) {
  const response = await post("/auth/login", { email, password });
  if (response.status === 401) throw new AuthError("Email o contraseña incorrectos.");
  if (!response.ok) throw new AuthError(GENERIC_ERROR);
}

export async function signUp(alias: string, email: string, password: string) {
  const response = await post("/auth/register", { alias, email, password });
  if (response.status === 409) throw new AuthError("Ese alias o email ya está en uso.");
  if (!response.ok) throw new AuthError(GENERIC_ERROR);
}
