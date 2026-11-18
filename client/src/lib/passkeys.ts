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

function explainPasskeyError(error: unknown): Error {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return new Error("El navegador canceló la operación o no encontró una Passkey registrada. Entra con correo y contraseña, registra una llave desde Mi cuenta y vuelve a intentarlo.");
  }
  return error instanceof Error ? error : new Error("No se pudo completar la operación con la llave de acceso.");
}

export async function signInWithPasskey(): Promise<void> {
  try {
    const options = await jsonRequest("/api/admin/passkeys/auth/options", { method: "POST", body: "{}" });
    const response = await startAuthentication({ optionsJSON: options });
    await jsonRequest("/api/admin/passkeys/auth/verify", { method: "POST", body: JSON.stringify({ response }) });
  } catch (error) {
    throw explainPasskeyError(error);
  }
}

export async function registerPasskey(name: string): Promise<void> {
  try {
    const options = await jsonRequest("/api/admin/passkeys/register/options", { method: "POST", body: "{}" });
    const response = await startRegistration({ optionsJSON: options });
    await jsonRequest("/api/admin/passkeys/register/verify", { method: "POST", body: JSON.stringify({ response, name }) });
  } catch (error) {
    throw explainPasskeyError(error);
  }
}
