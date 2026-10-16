import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ContactSubmission, NewsletterSubscriber } from "@shared/schema";
export default function AdminInbox() {
  const { isAuthenticated, requireAuth } = useAdminAuth();
  const [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [state, setState] = useState("all"),
    [busy, setBusy] = useState("");
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  const read = async (url: string) => {
    const r = await adminApiRequest("GET", url);
    if (!r.ok) throw new Error("No se pudo cargar la información.");
    return r.json();
  };
  const contacts = useQuery<ContactSubmission[]>({
    queryKey: ["/api/admin/contact-submissions"],
    enabled: isAuthenticated,
    queryFn: () => read("/api/admin/contact-submissions"),
  });
  const subscribers = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/admin/newsletter-subscribers"],
    enabled: isAuthenticated,
    queryFn: () => read("/api/admin/newsletter-subscribers"),
  });
  const update = async (url: string, data: unknown, id: string) => {
    setError("");
    setBusy(id);
    try {
      const r = await adminApiRequest("PATCH", url, data);
      if (!r.ok)
        throw new Error((await r.json()).error || "No se pudo guardar.");
      await Promise.all([contacts.refetch(), subscribers.refetch()]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  const download = async () => {
    setBusy("export");
    setError("");
    try {
      const r = await adminApiRequest(
        "GET",
        "/api/admin/newsletter-subscribers/export",
      );
      if (!r.ok) throw new Error("No se pudo exportar.");
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "suscripciones-santos.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  const matches = (values: unknown[]) =>
    values.join(" ").toLocaleLowerCase().includes(search.toLocaleLowerCase());
  const messages =
    contacts.data?.filter(
      (m) =>
        matches([m.fullName, m.email, m.company, m.message, m.practiceArea]) &&
        (state === "all" || (state === "active" ? !m.read : m.read)),
    ) || [];
  const subscriptions =
    subscribers.data?.filter(
      (s) =>
        matches([s.name, s.email, s.company]) &&
        (state === "all" || (state === "active" ? s.isActive : !s.isActive)),
    ) || [];
  if (!isAuthenticated) return null;
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-7">
      <header>
        <h1 className="text-3xl font-semibold">Formularios recibidos</h1>
        <p className="text-muted-foreground mt-3">
          Contacto y suscripciones enviados desde el sitio. Las acciones se
          guardan en el CMS.
        </p>
      </header>
      <div className="flex flex-wrap gap-4">
        <label className="flex-1 min-w-52 space-y-2">
          <span>Buscar</span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, correo, empresa o mensaje"
          />
        </label>
        <label className="space-y-2">
          <span className="block">Estado</span>
          <select
            className="border min-h-11 px-3 bg-background"
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="active">Sin leer / Activas</option>
            <option value="inactive">Leídos / Inactivas</option>
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">
            Contacto ({contacts.data?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            Suscripciones ({subscribers.data?.length ?? 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="contacts" className="space-y-4 mt-6">
          {contacts.isLoading && <p role="status">Cargando mensajes…</p>}
          {contacts.isError && (
            <p role="alert">
              {contacts.error.message}
              <Button variant="outline" onClick={() => void contacts.refetch()}>
                Reintentar
              </Button>
            </p>
          )}
          {!contacts.isLoading && !contacts.isError && !messages.length && (
            <p>No hay mensajes que coincidan.</p>
          )}
          {messages.map((m) => (
            <article key={m.id} className="border p-5">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{m.fullName}</h2>
                  <p>
                    {m.email} · {m.company}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.submittedAt
                      ? new Date(m.submittedAt).toLocaleString("es-MX")
                      : ""}{" "}
                    · {m.practiceArea}
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={busy === m.id}
                  onClick={() =>
                    void update(
                      `/api/admin/contact-submissions/${m.id}`,
                      { read: !m.read },
                      m.id,
                    )
                  }
                >
                  {m.read ? "Marcar sin leer" : "Marcar leído"}
                </Button>
              </div>
              <p className="whitespace-pre-line mt-4 break-words">
                {m.message}
              </p>
            </article>
          ))}
        </TabsContent>
        <TabsContent value="subscribers" className="mt-6 space-y-5">
          <div className="flex flex-wrap justify-between gap-4">
            <h2 className="text-xl font-semibold">
              Suscripciones al Monitor Laboral
            </h2>
            <Button
              variant="outline"
              disabled={busy === "export"}
              onClick={() => void download()}
            >
              Exportar CSV
            </Button>
          </div>
          {subscribers.isLoading && (
            <p role="status">Cargando suscripciones…</p>
          )}
          {subscribers.isError && (
            <p role="alert">
              {subscribers.error.message}
              <Button
                variant="outline"
                onClick={() => void subscribers.refetch()}
              >
                Reintentar
              </Button>
            </p>
          )}
          {!subscribers.isLoading &&
            !subscribers.isError &&
            !subscriptions.length && <p>No hay suscripciones que coincidan.</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Correo</th>
                  <th className="p-3">Nombre / empresa</th>
                  <th className="p-3">Idioma</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3">{s.email}</td>
                    <td className="p-3">
                      {s.name} {s.company}
                    </td>
                    <td className="p-3">{s.preferredLanguage}</td>
                    <td className="p-3">
                      {s.isActive ? "Activa" : "Inactiva"}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy === s.id}
                        onClick={() =>
                          void update(
                            `/api/admin/newsletter-subscribers/${s.id}`,
                            { isActive: !s.isActive },
                            s.id,
                          )
                        }
                      >
                        {s.isActive ? "Dar de baja" : "Reactivar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
