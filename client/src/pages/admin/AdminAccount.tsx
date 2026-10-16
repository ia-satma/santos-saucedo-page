import { useState } from "react";
import { adminApiRequest, clearToken } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";
export default function AdminAccount() {
  const [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("La confirmación no coincide con la contraseña nueva.");
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
  return (
    <main className="admin-management-page admin-account-page">
      <p className="admin-page-kicker">Mi cuenta</p>
      <h1>Cambiar mi contraseña</h1>
      <p>
        Use al menos 15 caracteres. Al guardar se cerrarán todas sus sesiones y
        tendrá que iniciar sesión con la contraseña nueva.
      </p>
      <form onSubmit={save} className="admin-users-form">
        <div>
          <Label htmlFor="current-password">Contraseña actual</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="new-password">Contraseña nueva</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={15}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirmar contraseña nueva</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={15}
            maxLength={72}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
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
    </main>
  );
}
