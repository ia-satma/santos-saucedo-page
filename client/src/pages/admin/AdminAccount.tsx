import { useEffect, useState } from "react";
import { adminApiRequest, clearToken } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";
import { passkeysSupported, registerPasskey } from "@/lib/passkeys";
import { Eye, EyeOff } from "lucide-react";
export default function AdminAccount() {
  const [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [showCurrent, setShowCurrent] = useState(false),
    [showPassword, setShowPassword] = useState(false),
    [showConfirm, setShowConfirm] = useState(false),
    [passkeyName, setPasskeyName] = useState(""),
    [passkeys, setPasskeys] = useState<Array<{ id: string; name: string; createdAt: string; lastUsedAt: string | null }>>([]),
    [passkeyBusy, setPasskeyBusy] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const loadPasskeys = async () => {
    const response = await fetch("/api/admin/passkeys", { credentials: "include" });
    if (response.ok) setPasskeys(await response.json());
  };
  useEffect(() => { if (passkeysSupported()) void loadPasskeys(); }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("La confirmación no coincide con la contraseña nueva.");
      return;
    }
    if (password.length < 8 || password.length > 16) {
      setError("La contraseña nueva debe tener entre 8 y 16 caracteres.");
      return;
    }
    setBusy(true);
    try {
      const r = await adminApiRequest("POST", "/api/admin/password/change", {
        currentPassword: current,
        newPassword: password,
      });
      const data = await r.json();
      if (!r.ok)
        throw new Error(data.error || "No se pudo cambiar la contraseña.");
      clearToken();
      queryClient.clear();
      window.location.assign("/admin/login");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const addPasskey = async () => {
    if (!passkeyName.trim()) return setError("Escriba un nombre para la llave.");
    setPasskeyBusy(true);
    setError("");
    try {
      await registerPasskey(passkeyName.trim());
      setPasskeyName("");
      await loadPasskeys();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPasskeyBusy(false);
    }
  };
  const removePasskey = async (id: string) => {
    const response = await fetch(`/api/admin/passkeys/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
    if (response.ok) await loadPasskeys();
    else setError((await response.json().catch(() => ({}))).error || "No se pudo eliminar la llave.");
  };
  return (
    <main className="admin-management-page admin-account-page">
      <p className="admin-page-kicker">Mi cuenta</p>
      <h1>Cambiar mi contraseña</h1>
      <p>
        Use entre 8 y 16 caracteres. Al guardar se cerrarán todas sus sesiones y
        tendrá que iniciar sesión con la contraseña nueva.
      </p>
      <form onSubmit={save} className="admin-users-form">
        <div>
          <Label htmlFor="current-password">Contraseña actual</Label>
          <div className="admin-login-password-control">
            <Input
              id="current-password"
              type={showCurrent ? "text" : "password"}
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              minLength={8}
              maxLength={16}
              required
            />
            <button type="button" className="admin-login-password-toggle" aria-label={showCurrent ? "Ocultar contraseña actual" : "Mostrar contraseña actual"} onClick={() => setShowCurrent((visible) => !visible)}>
              {showCurrent ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="new-password">Contraseña nueva</Label>
          <div className="admin-login-password-control">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              maxLength={16}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="admin-login-password-toggle" aria-label={showPassword ? "Ocultar contraseña nueva" : "Mostrar contraseña nueva"} onClick={() => setShowPassword((visible) => !visible)}>
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirmar contraseña nueva</Label>
          <div className="admin-login-password-control">
            <Input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              maxLength={16}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button type="button" className="admin-login-password-toggle" aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"} onClick={() => setShowConfirm((visible) => !visible)}>
              {showConfirm ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <Button disabled={busy} type="submit">
          {busy ? "Guardando…" : "Cambiar contraseña y cerrar sesiones"}
        </Button>
      </form>
      {passkeysSupported() && (
        <section className="admin-account-passkeys" aria-labelledby="passkeys-title">
          <h2 id="passkeys-title">Llaves de acceso</h2>
          <p>Registre hasta dos dispositivos para entrar sin escribir la contraseña. Mantenga una contraseña activa como respaldo.</p>
          <div className="admin-account-passkey-add">
            <Label htmlFor="passkey-name">Nombre de la llave</Label>
            <div className="admin-account-passkey-row">
              <Input id="passkey-name" value={passkeyName} maxLength={80} placeholder="MacBook, iPhone o llave USB" onChange={(e) => setPasskeyName(e.target.value)} />
              <Button type="button" onClick={addPasskey} disabled={passkeyBusy || passkeys.length >= 2}>{passkeyBusy ? "Registrando…" : "Registrar llave"}</Button>
            </div>
          </div>
          <ul className="admin-account-passkey-list">
            {passkeys.map((passkey) => (
              <li key={passkey.id}>
                <span>{passkey.name}</span>
                <Button type="button" variant="ghost" onClick={() => removePasskey(passkey.id)}>Quitar</Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
