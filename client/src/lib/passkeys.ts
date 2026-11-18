import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

async function jsonRequest(url: string, init?: RequestInit): Promise<any> {
  const response = await fetch(url, { credentials: "include", ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "No se pudo completar la operación con la llave de acceso.");
  return body;
}

export function passkeysSupported(): boolean {
  return typeof window !== "undefined" && window.isSecureContext && typeof window.PublicKeyCredential !== "undefined" && typeof navigator.credentials?.create === "function";
}

function explainPasskeyError(error: unknown, action: "login" | "register"): Error {
  if (error instanceof Error && error.name === "NotAllowedError") {
    return new Error(action === "register"
      ? "El registro se canceló o agotó el tiempo. Vuelve a pulsar Registrar llave y confirma en tu dispositivo. Si usas el QR, mantén el teléfono cerca y activa Bluetooth en ambos equipos."
      : "El acceso se canceló o agotó el tiempo. Elige el dispositivo donde guardaste la llave. Si aún no tienes una, entra con tu contraseña y regístrala en Mi cuenta.");
  }
  return error instanceof Error ? error : new Error("No se pudo completar la operación con la llave de acceso.");
}

export async function signInWithPasskey(): Promise<void> {
  try {
    const options = await jsonRequest("/api/admin/passkeys/auth/options", { method: "POST", body: "{}" });
    const response = await startAuthentication({ optionsJSON: options });
    await jsonRequest("/api/admin/passkeys/auth/verify", { method: "POST", body: JSON.stringify({ response }) });
  } catch (error) {
    throw explainPasskeyError(error, "login");
  }
}

export async function registerPasskey(name: string): Promise<void> {
  try {
    const options = await jsonRequest("/api/admin/passkeys/register/options", { method: "POST", body: "{}" });
    const response = await startRegistration({ optionsJSON: options });
    await jsonRequest("/api/admin/passkeys/register/verify", { method: "POST", body: JSON.stringify({ response, name }) });
  } catch (error) {
    throw explainPasskeyError(error, "register");
  }
}
