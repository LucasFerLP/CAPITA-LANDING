const API_URL: string | undefined = import.meta.env.VITE_API_URL;
const SESSION_KEY = "capital.session";

export class AuthError extends Error {}

export type AuthUser = { id: number; email: string; name: string };
type AuthResponse = { token: string; user: AuthUser };
type AuthPath = "login" | "register" | "forgot-password" | "reset-password";

const GENERIC_ERROR = "Algo salió mal de nuestro lado. Probá de nuevo en unos minutos.";

async function readMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message;
  } catch {
    return undefined;
  }
}

async function postAuth(path: AuthPath, body: Record<string, string>) {
  if (!API_URL) {
    throw new AuthError("El acceso todavía no está habilitado. Probá de nuevo más tarde.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL.replace(/\/$/, "")}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError("No pudimos conectarnos. Revisá tu conexión y probá de nuevo.");
  }

  if (response.status === 401) throw new AuthError("Email o contraseña incorrectos.");
  if (response.status === 400 || response.status === 409) {
    throw new AuthError((await readMessage(response)) ?? GENERIC_ERROR);
  }
  if (!response.ok) throw new AuthError(GENERIC_ERROR);
  return response;
}

async function startSession(path: "login" | "register", body: Record<string, string>) {
  const response = await postAuth(path, body);
  const session = (await response.json()) as AuthResponse;
  saveSession(session);
  return session.user;
}

function saveSession({ token, user }: AuthResponse) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name } }));
  } catch {
    // Storage can be unavailable (private mode); the login itself still succeeded.
  }
}

export function signIn(email: string, password: string) {
  return startSession("login", { email, password });
}

// The backend has no alias field yet: the alias is stored as the user's display name.
export function signUp(alias: string, email: string, password: string) {
  return startSession("register", { name: alias, email, password });
}

// The backend answers the same whether or not the email exists, so this never reveals accounts.
export async function requestPasswordReset(email: string) {
  await postAuth("forgot-password", { email });
}

export async function resetPassword(email: string, code: string, password: string) {
  await postAuth("reset-password", { email, code, password });
}
