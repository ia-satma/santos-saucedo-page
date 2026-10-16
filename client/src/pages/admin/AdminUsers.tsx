import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  PersonIcon,
  PlusIcon,
  Pencil1Icon,
  LockClosedIcon,
  ExitIcon,
  CopyIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { adminApiRequest } from "@/lib/adminAuth";
import { queryClient } from "@/lib/queryClient";
import {
  adminPermissions,
  adminRoleLabels,
  manageableRoles,
  rolePermissions,
  type ManagedAdminUser,
} from "@shared/adminAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

async function request(method: string, path: string, data?: unknown) {
  const r = await adminApiRequest(method, path, data),
    body = await r.json();
  if (!r.ok)
    throw new Error(body.error || "No se pudo completar la operación.");
  return body;
}
const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Aún no inicia sesión";
const eventLabels: Record<string, string> = {
  "user.created": "Cuenta creada",
  "user.updated": "Datos o permisos actualizados",
  "password.reset": "Contraseña restablecida",
  "password.changed": "Contraseña cambiada",
  "sessions.revoked": "Sesiones cerradas",
  "login.succeeded": "Inicio de sesión correcto",
  "login.failed": "Intento de acceso rechazado",
};
type AccountDraft = {
  username: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
};
const emptyDraft = (): AccountDraft => ({
  username: "",
  email: "",
  role: "editor",
  permissions: [],
  isActive: true,
});
export default function AdminUsers() {
  const me = useQuery<{ id: string; role: string }>({
    queryKey: ["/api/admin/me"],
    queryFn: () => request("GET", "/api/admin/me"),
  });
  const allowed = me.data?.role === "super_admin";
  const users = useQuery<ManagedAdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: () => request("GET", "/api/admin/users"),
    enabled: allowed,
  });
  const events = useQuery<
    {
      id: string;
      userId: string | null;
      actorId: string | null;
      action: string;
      createdAt: string | null;
    }[]
  >({
    queryKey: ["/api/admin/access-events"],
    queryFn: () => request("GET", "/api/admin/access-events"),
    enabled: allowed,
  });
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [editor, setEditor] = useState<"create" | ManagedAdminUser | null>(null);
  const [draft, setDraft] = useState<AccountDraft>(emptyDraft),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [confirmation, setConfirmation] = useState<{
    user: ManagedAdminUser;
    action: "password" | "sessions/revoke";
  } | null>(null);
  const [secret, setSecret] = useState<{
      email: string;
      password: string;
    } | null>(null),
    [revealed, setRevealed] = useState(false),
    [copied, setCopied] = useState(false);
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    void queryClient.invalidateQueries({
      queryKey: ["/api/admin/access-events"],
    });
  };
  const open = (user?: ManagedAdminUser) => {
    setError("");
    setNotice("");
    setEditor(user || "create");
    setDraft(
      user
        ? {
            username: user.username,
            email: user.email,
            role: user.role,
            permissions: user.permissions || [],
            isActive: user.isActive === true,
          }
        : emptyDraft(),
    );
  };
  const showSecret = (email: string, password: string) => {
    setSecret({ email, password });
    setRevealed(false);
    setCopied(false);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || busy) return;
    setBusy(true);
    setError("");
    try {
      const creating = editor === "create";
      const body = await request(
        creating ? "POST" : "PUT",
        creating ? "/api/admin/users" : `/api/admin/users/${editor.id}`,
        creating
          ? {
              username: draft.username,
              email: draft.email,
              role: draft.role,
              permissions: draft.permissions,
            }
          : { ...draft, revision: editor.revision },
      );
      setEditor(null);
      refresh();
      setNotice(
        creating
          ? "Cuenta creada. Guarde la contraseña que aparece a continuación."
          : "Cuenta actualizada. Las sesiones anteriores de esa persona se cerraron.",
      );
      if (creating) showSecret(body.user.email, body.generatedPassword);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const confirmAction = async () => {
    if (!confirmation || busy) return;
    setBusy(true);
    setError("");
    try {
      const { user, action } = confirmation;
      const body = await request(
        "POST",
        `/api/admin/users/${user.id}/${action}`,
        {},
      );
      setConfirmation(null);
      refresh();
      if (action === "password") showSecret(user.email, body.generatedPassword);
      setNotice(
        action === "password"
          ? "Contraseña restablecida y sesiones cerradas."
          : "Las sesiones de la cuenta se cerraron.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret!.password);
      setCopied(true);
    } catch {
      setError(
        "No se pudo copiar. Muestre la contraseña y cópiela manualmente.",
      );
    }
  };
  if (me.isLoading)
    return (
      <div className="admin-management-page">
        <Skeleton className="h-24" />
      </div>
    );
  if (!allowed)
    return (
      <main className="admin-management-page">
        <h1>Usuarios y permisos</h1>
        <p>Solo el administrador principal puede administrar cuentas.</p>
        <Link href="/admin/dashboard">Volver al resumen</Link>
      </main>
    );
  const rows = (users.data || []).filter(
    (u) =>
      `${u.username} ${u.email} ${adminRoleLabels[u.role] || u.role}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) &&
      (filter === "all" || (filter === "active" ? u.isActive : !u.isActive)),
  );
  const self =
    editor !== null && editor !== "create" && editor.id === me.data?.id;
  const inherited = rolePermissions[draft.role] || [];
  return (
    <main className="admin-management-page admin-users-page">
      <div className="admin-users-heading">
        <div>
          <p className="admin-page-kicker">Administración de accesos</p>
          <h1>Usuarios y permisos</h1>
          <p>
            Defina quién puede entrar al CMS y qué secciones puede administrar.
            Estas cuentas son independientes de los perfiles de abogados del
            sitio.
          </p>
        </div>
        <Button onClick={() => open()}>
          <PlusIcon />
          Crear usuario
        </Button>
      </div>
      <div className="admin-users-security-note">
        <LockClosedIcon />
        <p>
          Solo el administrador principal administra cuentas. Desactivar una
          cuenta conserva su historial y cierra sus sesiones.
        </p>
        <Link href="/admin/account">Cambiar mi contraseña</Link>
      </div>
      {notice && (
        <p role="status" className="admin-users-notice">
          {notice}
        </p>
      )}
      {!editor && !confirmation && !secret && error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <div className="admin-users-toolbar">
        <div>
          <Label htmlFor="user-search">Buscar usuarios</Label>
          <Input
            id="user-search"
            placeholder="Nombre, correo o rol…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="user-state">Estado de la cuenta</Label>
          <select
            id="user-state"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todas las cuentas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>
      {users.isLoading ? (
        <Skeleton className="h-64" />
      ) : users.isError ? (
        <div role="alert">
          <p>No se pudieron cargar los usuarios.</p>
          <Button variant="outline" onClick={() => void users.refetch()}>
            Intentar de nuevo
          </Button>
        </div>
      ) : (
        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <caption className="sr-only">
              Cuentas del CMS de Santos y Saucedo
            </caption>
            <thead>
              <tr>
                <th>Persona</th>
                <th>Rol y acceso</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th>Administrar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>
                      {u.username}
                      {u.id === me.data?.id && (
                        <span className="admin-users-self">Su cuenta</span>
                      )}
                    </strong>
                    <span>{u.email}</span>
                  </td>
                  <td>
                    <strong>{adminRoleLabels[u.role] || u.role}</strong>
                    <span>
                      {u.role === "super_admin"
                        ? "Acceso completo y usuarios"
                        : `${(rolePermissions[u.role] || []).length} secciones por rol${u.permissions?.length ? ` · ${u.permissions.length} permisos adicionales` : ""}`}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-users-state ${u.isActive ? "is-active" : ""}`}
                    >
                      {u.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td>{date(u.lastLogin)}</td>
                  <td>
                    <div className="admin-users-actions">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => open(u)}
                        aria-label={`Editar a ${u.username}`}
                      >
                        <Pencil1Icon />
                        Editar
                      </Button>
                      {u.id !== me.data?.id && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setError("");
                              setConfirmation({ user: u, action: "password" });
                            }}
                            aria-label={`Restablecer contraseña de ${u.username}`}
                            title="Restablecer contraseña"
                          >
                            <LockClosedIcon />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setError("");
                              setConfirmation({
                                user: u,
                                action: "sessions/revoke",
                              });
                            }}
                            aria-label={`Cerrar sesiones de ${u.username}`}
                            title="Cerrar sesiones"
                          >
                            <ExitIcon />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="p-8">No hay cuentas que coincidan con la búsqueda.</p>
          )}
        </div>
      )}
      <section className="admin-users-history">
        <h2>Historial de accesos y cambios</h2>
        <p>
          Últimos 100 eventos. Las contraseñas y los tokens de sesión nunca
          aparecen en el historial.
        </p>
        {events.isLoading ? (
          <Skeleton className="h-24" />
        ) : events.isError ? (
          <p role="alert">
            No se pudo cargar el historial.{" "}
            <button onClick={() => void events.refetch()}>Reintentar</button>
          </p>
        ) : events.data?.length ? (
          <ol>
            {events.data.map((event) => (
              <li key={event.id}>
                <PersonIcon />
                <div>
                  <strong>{eventLabels[event.action] || event.action}</strong>
                  <span>
                    {users.data?.find((u) => u.id === event.userId)?.email ||
                      "Cuenta no identificada"}
                    {event.actorId && event.actorId !== event.userId
                      ? ` · Por ${users.data?.find((u) => u.id === event.actorId)?.username || "administrador"}`
                      : ""}
                  </span>
                </div>
                <time>{date(event.createdAt)}</time>
              </li>
            ))}
          </ol>
        ) : (
          <p>Los nuevos accesos y cambios de cuentas aparecerán aquí.</p>
        )}
      </section>
      <Dialog
        open={!!editor}
        onOpenChange={(v) => {
          if (!v && !busy) {
            setEditor(null);
            setError("");
          }
        }}
      >
        <DialogContent className="admin-user-dialog">
          <DialogTitle>
            {editor === "create"
              ? "Crear usuario del CMS"
              : "Editar cuenta y permisos"}
          </DialogTitle>
          <DialogDescription>
            {editor === "create"
              ? "Se generará una contraseña segura al crear la cuenta. Se mostrará una sola vez."
              : "Los permisos se aplican en el servidor. Guardar cierra las sesiones anteriores de esta persona."}
          </DialogDescription>
          <form onSubmit={save} className="admin-users-form">
            <div className="admin-users-fields">
              <div>
                <Label htmlFor="account-username">Nombre de usuario</Label>
                <Input
                  id="account-username"
                  autoComplete="off"
                  required
                  minLength={2}
                  maxLength={80}
                  pattern="[a-zA-Z0-9._@+\-]+"
                  value={draft.username}
                  onChange={(e) =>
                    setDraft({ ...draft, username: e.target.value })
                  }
                />
                <p>Letras, números, puntos o guiones.</p>
              </div>
              <div>
                <Label htmlFor="account-email">Correo electrónico</Label>
                <Input
                  id="account-email"
                  type="email"
                  autoComplete="off"
                  required
                  maxLength={254}
                  value={draft.email}
                  onChange={(e) =>
                    setDraft({ ...draft, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="account-role">Rol</Label>
              <select
                id="account-role"
                disabled={self}
                value={draft.role}
                onChange={(e) =>
                  setDraft({ ...draft, role: e.target.value, permissions: [] })
                }
              >
                {!manageableRoles.includes(draft.role as any) && (
                  <option value={draft.role}>
                    {adminRoleLabels[draft.role] || draft.role}
                  </option>
                )}
                {manageableRoles.map((r) => (
                  <option value={r} key={r}>
                    {adminRoleLabels[r]}
                  </option>
                ))}
              </select>
              {self && (
                <p>
                  Su cuenta conserva la administración principal para evitar que
                  pierda acceso.
                </p>
              )}
              {draft.role === "super_admin" && (
                <p>
                  Puede administrar todas las secciones, crear usuarios y
                  cambiar sus permisos.
                </p>
              )}
              {draft.role === "viewer" && (
                <p>
                  Puede consultar las secciones habilitadas; no puede guardar
                  cambios ni ejecutar procesos.
                </p>
              )}
            </div>
            <fieldset>
              <legend>Acceso a las secciones</legend>
              <p>
                Los permisos del rol aparecen marcados. Puede conceder secciones
                adicionales; la administración de usuarios es exclusiva del
                administrador principal.
              </p>
              <div className="admin-users-permissions">
                {adminPermissions.map((p) => {
                  const base =
                    draft.role === "super_admin" || inherited.includes(p.key);
                  return (
                    <label key={p.key}>
                      <input
                        type="checkbox"
                        checked={base || draft.permissions.includes(p.key)}
                        disabled={base || busy}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            permissions: e.target.checked
                              ? [...draft.permissions, p.key]
                              : draft.permissions.filter((k) => k !== p.key),
                          })
                        }
                      />
                      <span>
                        <strong>
                          {p.label}
                          {base && <small>Incluido en el rol</small>}
                        </strong>
                        <span>{p.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {editor !== "create" && (
              <label className="admin-users-toggle">
                <input
                  type="checkbox"
                  disabled={self || busy}
                  checked={draft.isActive}
                  onChange={(e) =>
                    setDraft({ ...draft, isActive: e.target.checked })
                  }
                />
                <span>
                  Cuenta activa
                  <small>Una cuenta inactiva no puede iniciar sesión.</small>
                </span>
              </label>
            )}
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setEditor(null);
                  setError("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={busy}>
                {busy
                  ? "Guardando…"
                  : editor === "create"
                    ? "Crear cuenta"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!confirmation}
        onOpenChange={(v) => {
          if (!v && !busy) {
            setConfirmation(null);
            setError("");
          }
        }}
      >
        <DialogContent className="admin-user-dialog">
          <DialogTitle>
            {confirmation?.action === "password"
              ? "Restablecer contraseña"
              : "Cerrar sesiones"}
          </DialogTitle>
          <DialogDescription>
            {confirmation?.action === "password"
              ? "Se generará una contraseña nueva y se cerrarán todas las sesiones de esta cuenta."
              : "La persona tendrá que volver a iniciar sesión. Su contraseña seguirá siendo la misma."}
          </DialogDescription>
          <p>{confirmation?.user.email}</p>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setConfirmation(null)}
            >
              Cancelar
            </Button>
            <Button disabled={busy} onClick={() => void confirmAction()}>
              {busy ? "Aplicando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!secret}
        onOpenChange={(v) => {
          if (!v) {
            setSecret(null);
            setError("");
          }
        }}
      >
        <DialogContent className="admin-user-dialog">
          <DialogTitle>Guarde la contraseña</DialogTitle>
          <DialogDescription>
            Esta contraseña se muestra una sola vez. Compártala de forma privada
            con la persona que usará la cuenta. No se envía por correo
            automáticamente.
          </DialogDescription>
          <p>{secret?.email}</p>
          <Label htmlFor="generated-password">Contraseña generada</Label>
          <Input
            id="generated-password"
            type={revealed ? "text" : "password"}
            readOnly
            autoComplete="off"
            value={secret?.password || ""}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setRevealed(!revealed)}>
              <EyeOpenIcon />
              {revealed ? "Ocultar" : "Mostrar"}
            </Button>
            <Button variant="outline" onClick={() => void copy()}>
              <CopyIcon />
              {copied ? "Copiada" : "Copiar contraseña"}
            </Button>
          </div>
          {error && <p role="alert">{error}</p>}
          <DialogFooter>
            <Button onClick={() => setSecret(null)}>Ya la guardé</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
