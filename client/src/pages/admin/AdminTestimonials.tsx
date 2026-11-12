import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApiRequest, readAdminJson } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TESTIMONIAL_QUOTE_MAX } from "@shared/constants";
import type { Testimonial, TestimonialInvite } from "@shared/schema";
import { useSiteDetails } from "@/components/home26/useSiteContact";

// Testimonios en el panel: invitaciones de un solo uso, moderación y orden. Nada se publica sin
// la aprobación del administrador principal (super_admin); los editores generan invitaciones,
// corrigen erratas, pasan capturados a revisión, ordenan y ocultan.

type Invite = Omit<TestimonialInvite, "tokenHash"> & { state: "active" | "used" | "expired" | "revoked" };
type Tab = "captured" | "pending" | "approved" | "rejected";
type Draft = { authorName: string; authorTitle: string; authorCompany: string; quote: string; showCompany: boolean; rating: number };

const date = (value: string | Date | null | undefined) =>
  value ? new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "";
const inviteStates: Record<Invite["state"], string> = {
  active: "Vigente",
  used: "Usada",
  expired: "Vencida",
  revoked: "Anulada",
};
const tabs: { key: Tab; label: string }[] = [
  { key: "captured", label: "Capturados" },
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobados" },
  { key: "rejected", label: "Rechazados" },
];
const emptyDraft: Draft = { authorName: "", authorTitle: "", authorCompany: "", quote: "", showCompany: false, rating: 5 };

// Mensaje para WhatsApp o correo: cortés, sin urgencia; el despacho lo revisa antes de enviarlo
const inviteMessage = (name: string, url: string) =>
  `${name ? `Estimado(a) ${name}:` : "Buen día:"} en Santos & Saucedo le agradeceríamos un breve comentario sobre su experiencia con la firma. ` +
  `Puede escribirlo en este enlace personal, de un solo uso, que vence en 30 días: ${url}\n` +
  `Solo se publica con su autorización y después de nuestra revisión. Muchas gracias.`;

export default function AdminTestimonials() {
  const [tab, setTab] = useState<Tab>("captured");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [invite, setInvite] = useState({ clientName: "", clientEmail: "" });
  const [created, setCreated] = useState<{ url: string; name: string; email: string; expiresAt: string } | null>(null);
  const [editing, setEditing] = useState<{ id: string; draft: Draft } | null>(null);
  const [manual, setManual] = useState<{ draft: Draft; consent: boolean } | null>(null);
  const [googleJsonResult, setGoogleJsonResult] = useState<{ imported: number; alreadyPresent: number; ratingsOnly: number; nextCursor: string | null } | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [googleUrlResult, setGoogleUrlResult] = useState<{ imported: number; alreadyPresent: number; reviewed: number } | null>(null);
  const { googleReviewsUrl } = useSiteDetails();
  useEffect(() => {
    if (!googleMapsUrl && googleReviewsUrl) setGoogleMapsUrl(googleReviewsUrl);
  }, [googleMapsUrl, googleReviewsUrl]);

  const me = useQuery<{ role: string; username?: string }>({
    queryKey: ["/api/admin/me"],
    queryFn: async () => readAdminJson(await adminApiRequest("GET", "/api/admin/me"), "Sesión no disponible."),
  });
  const canApprove = me.data?.role === "super_admin";
  const list = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"],
    queryFn: async () =>
      readAdminJson(await adminApiRequest("GET", "/api/admin/testimonials"), "No se pudieron cargar los testimonios."),
  });
  const invites = useQuery<Invite[]>({
    queryKey: ["/api/admin/testimonials/invites"],
    queryFn: async () =>
      readAdminJson(await adminApiRequest("GET", "/api/admin/testimonials/invites"), "No se pudieron cargar las invitaciones."),
  });

  const run = async (key: string, action: () => Promise<unknown>, done?: string) => {
    setBusy(key);
    setError("");
    setNotice("");
    try {
      await action();
      if (done) setNotice(done);
      await Promise.all([list.refetch(), invites.refetch()]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  const call = async (method: string, url: string, body?: unknown) =>
    readAdminJson(await adminApiRequest(method, url, body), "No se pudo completar la acción.");

  const createInvite = () =>
    run("invite", async () => {
      const result = await call("POST", "/api/admin/testimonials/invites", {
        clientName: invite.clientName.trim() || undefined,
        clientEmail: invite.clientEmail.trim() || undefined,
      });
      const { url, invite: row } = result as { url: string; invite: Invite };
      setCreated({ url, name: invite.clientName.trim(), email: invite.clientEmail.trim(), expiresAt: String(row.expiresAt) });
      setInvite({ clientName: "", clientEmail: "" });
    });

  const importGoogleUrl = () =>
    run("google-url", async () => {
      const mapsUrl = googleMapsUrl.trim();
      if (!mapsUrl) throw new Error("Introduce el enlace de la ficha de Google Maps.");
      const result = await call("POST", "/api/admin/testimonials/import-google-url", { mapsUrl }) as { imported: number; alreadyPresent: number; reviewed: number };
      setGoogleUrlResult(result);
    }, "Reseñas extraídas como capturadas. Revisa y aprueba manualmente las que deban publicarse.");

  const importGoogleJson = (file: File) =>
    run("google-json", async () => {
      if (file.size > 900_000) throw new Error("El archivo JSON supera 900 KB. Descarga una página más pequeña desde el laboratorio de Google.");
      let payload: unknown;
      try { payload = JSON.parse(await file.text()); } catch { throw new Error("El archivo no contiene un JSON válido."); }
      const result = await call("POST", "/api/admin/testimonials/import-google-json", { payload }) as { imported: number; alreadyPresent: number; ratingsOnly: number; nextCursor: string | null };
      setGoogleJsonResult(result);
    }, "JSON importado como capturado para revisión humana.");

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Enlace copiado.");
    } catch {
      setNotice("No se pudo copiar automáticamente: seleccione el enlace y cópielo.");
    }
  };

  const rows = (list.data ?? []).filter((t) => t.status === tab);
  const counts = Object.fromEntries(tabs.map(({ key }) => [key, (list.data ?? []).filter((t) => t.status === key).length]));
  const approvedIds = (list.data ?? []).filter((t) => t.status === "approved").map((t) => t.id);
  const move = (id: string, delta: number) => {
    const ids = [...approvedIds];
    const i = ids.indexOf(id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    void run(id, () => call("POST", "/api/admin/testimonials/reorder", { ids }));
  };
  const draftOf = (t: Testimonial): Draft => ({
    authorName: t.authorName,
    authorTitle: t.authorTitle ?? "",
    authorCompany: t.authorCompany ?? "",
    quote: t.quote,
    showCompany: !!t.showCompany,
    rating: t.rating || 5,
  });

  const draftFields = (draft: Draft, set: (d: Draft) => void, prefix: string) => (
    <div className="grid gap-4 sm:grid-cols-3">
      {(
        [
          ["authorName", "Nombre completo"],
          ["authorTitle", "Puesto"],
          ["authorCompany", "Empresa"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="space-y-1 text-sm">
          <span className="block">{label}</span>
          <Input id={`${prefix}-${key}`} value={draft[key]} maxLength={160} onChange={(e) => set({ ...draft, [key]: e.target.value })} />
        </label>
      ))}
      <label className="space-y-1 text-sm">
        <span className="block">Calificación</span>
        <select className="h-10 w-full border bg-background px-3" value={draft.rating} onChange={(e) => set({ ...draft, rating: Number(e.target.value) })}>
          {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{"★".repeat(value)} ({value}/5)</option>)}
        </select>
      </label>
      <label className="space-y-1 text-sm sm:col-span-3">
        <span className="block">Comentario ({draft.quote.length} de {TESTIMONIAL_QUOTE_MAX})</span>
        <Textarea value={draft.quote} maxLength={TESTIMONIAL_QUOTE_MAX} className="min-h-[140px]" onChange={(e) => set({ ...draft, quote: e.target.value })} />
      </label>
      <label className="flex items-center gap-3 text-sm sm:col-span-3">
        <Checkbox checked={draft.showCompany} onCheckedChange={(v) => set({ ...draft, showCompany: v === true })} />
        Mostrar la empresa en el sitio (solo si el cliente lo autorizó)
      </label>
    </div>
  );
  const manualCanSave = !!manual
    && manual.consent
    && manual.draft.authorName.trim().length >= 3
    && manual.draft.quote.trim().length >= 20;

  return (
    <main className="mx-auto max-w-6xl space-y-10 p-6" data-testid="admin-testimonials">
      <header>
        <h1 className="text-3xl font-semibold">Testimonios</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Los clientes escriben su comentario desde un enlace personal de un solo uso. Todo llega como capturado, pasa a revisión y solo
          se publica en /testimonios cuando el administrador principal lo aprueba.
          {!canApprove && me.data && " Su cuenta puede generar invitaciones, corregir erratas, ordenar y ocultar; la aprobación es del administrador principal."}
        </p>
      </header>

      {error && (
        <p role="alert" className="border border-red-300 bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="border border-emerald-300 bg-emerald-50 p-3 text-emerald-900">
          {notice}
        </p>
      )}

      {/* Invitación: se genera aquí y se envía a mano (WhatsApp o correo); el sistema no envía nada */}
      <section className="space-y-4 border p-5" aria-labelledby="invite-title" data-testid="section-invite">
        <h2 id="invite-title" className="text-xl font-semibold">
          Nueva invitación
        </h2>
        <p className="text-sm text-muted-foreground">
          El nombre y el correo son una nota interna para reconocer la invitación; no se publican ni se envían.
        </p>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="block">Cliente (opcional)</span>
            <Input value={invite.clientName} maxLength={160} onChange={(e) => setInvite({ ...invite, clientName: e.target.value })} data-testid="input-invite-name" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="block">Correo del cliente (opcional)</span>
            <Input type="email" value={invite.clientEmail} maxLength={254} onChange={(e) => setInvite({ ...invite, clientEmail: e.target.value })} data-testid="input-invite-email" />
          </label>
          <Button disabled={busy === "invite"} onClick={() => void createInvite()} data-testid="button-create-invite">
            {busy === "invite" ? "Generando…" : "Generar enlace"}
          </Button>
        </div>
        {created && (
          <div className="space-y-3 border-t pt-4" data-testid="invite-created">
            <label className="block space-y-1 text-sm">
              <span className="block font-medium">
                Enlace para {created.name || "el cliente"} · vence el {date(created.expiresAt)}
              </span>
              <Input readOnly value={created.url} onFocus={(e) => e.currentTarget.select()} data-testid="input-invite-url" />
            </label>
            <p className="text-sm text-muted-foreground">
              Por seguridad, el enlace se muestra solo ahora. Si se pierde, genere otro y anule este.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void copy(created.url)} data-testid="button-copy-invite">
                Copiar enlace
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(inviteMessage(created.name, created.url))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-invite-whatsapp"
                >
                  Abrir WhatsApp
                </a>
              </Button>
              {created.email && (
                <Button variant="outline" asChild>
                  <a
                    href={`mailto:${created.email}?subject=${encodeURIComponent("Su comentario sobre Santos & Saucedo")}&body=${encodeURIComponent(inviteMessage(created.name, created.url))}`}
                    data-testid="link-invite-email"
                  >
                    Abrir correo
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Moderación */}
      <section className="space-y-5" aria-labelledby="moderation-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="moderation-title" className="text-xl font-semibold">
            Comentarios recibidos
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void run("google", () => call("POST", "/api/admin/testimonials/import-google"), "Reseñas nuevas importadas como capturadas para revisión.")} data-testid="button-import-google-testimonials">
              Actualizar desde Google
            </Button>
            <Button variant="outline" onClick={() => setManual(manual ? null : { draft: { ...emptyDraft }, consent: false })} data-testid="button-manual-testimonial">
              {manual ? "Cerrar captura" : "Añadir manualmente"}
            </Button>
          </div>
        </div>
        <details className="border p-4" data-testid="google-testimonials-lab">
          <summary className="cursor-pointer font-medium">Laboratorio de importación desde Google</summary>
          <div className="mt-3 space-y-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p>Conecta la ficha de Google Maps de Santos & Saucedo. El agente verifica el enlace, busca la ficha con Google Places y deja las reseñas como capturadas para revisión humana. La conexión usa la clave de Google Places configurada en los secretos del servidor.</p>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="space-y-1">
                  <span className="block text-foreground">Enlace de Google Maps</span>
                  <Input value={googleMapsUrl} onChange={(event) => setGoogleMapsUrl(event.target.value)} placeholder="https://www.google.com/maps/place/..." data-testid="input-google-maps-url" />
                </label>
                <Button variant="outline" disabled={busy === "google-url" || !googleMapsUrl.trim()} onClick={() => void importGoogleUrl()} data-testid="button-extract-google-testimonials">
                  {busy === "google-url" ? "Extrayendo…" : "Extraer reseñas con agente"}
                </Button>
              </div>
              {googleUrlResult && <p role="status">Última extracción: {googleUrlResult.imported} nuevas, {googleUrlResult.alreadyPresent} ya existentes de {googleUrlResult.reviewed} reseñas. Todas quedan capturadas hasta su aprobación.</p>}
            </div>
            <div className="space-y-2 border-t pt-3">
              <p>También puedes cargar el JSON del laboratorio externo. El CMS valida el enlace, elimina duplicados y conserva la revisión humana.</p>
              <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-foreground">
                Cargar JSON de Google
                <input type="file" accept="application/json,.json" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importGoogleJson(file); event.target.value = ""; }} data-testid="input-google-testimonials-json" />
              </label>
              {busy === "google-json" && <span role="status"> Validando e importando…</span>}
              {googleJsonResult && <p role="status">Última carga: {googleJsonResult.imported} importadas, {googleJsonResult.alreadyPresent} ya existentes y {googleJsonResult.ratingsOnly} solo con estrellas.{googleJsonResult.nextCursor ? " Hay más resultados disponibles con el siguiente cursor." : ""}</p>}
            </div>
          </div>
        </details>
        {manual && (
          <form
            className="space-y-4 border p-5"
            onSubmit={(e) => {
              e.preventDefault();
              void run(
                "manual",
                async () => {
                  await call("POST", "/api/admin/testimonials", { ...manual.draft, consentConfirmed: manual.consent });
                  setManual(null);
                  setTab("captured");
                },
                "Testimonio guardado como capturado.",
              );
            }}
          >
            <p className="text-sm text-muted-foreground">
              Para comentarios recibidos por correo o en persona. Entra como capturado y pasa a pendientes antes de solicitar aprobación.
            </p>
            {draftFields(manual.draft, (draft) => setManual({ ...manual, draft }), "manual")}
            <label className="flex items-start gap-3 text-sm">
              <Checkbox className="mt-0.5" checked={manual.consent} onCheckedChange={(v) => setManual({ ...manual, consent: v === true })} />
              Confirmo que el cliente autorizó por escrito publicar su comentario con su nombre y puesto (y su empresa, si se
              marca arriba).
            </label>
            <p className="text-xs text-muted-foreground">Para guardar, usa un nombre de al menos 3 caracteres, un comentario de al menos 20 y confirma la autorización por escrito.</p>
            <Button type="submit" disabled={busy === "manual" || !manualCanSave}>
              Guardar como capturado
            </Button>
          </form>
        )}

        <div role="tablist" aria-label="Estado" className="flex flex-wrap gap-2">
          {tabs.map(({ key, label }) => (
            <Button
              key={key}
              role="tab"
              aria-selected={tab === key}
              variant={tab === key ? "default" : "outline"}
              onClick={() => setTab(key)}
              data-testid={`tab-${key}`}
            >
              {label} ({counts[key] ?? 0})
            </Button>
          ))}
        </div>

        {list.isLoading && <p role="status">Cargando…</p>}
        {list.isError && <p role="alert">{list.error.message}</p>}
        {!list.isLoading && !rows.length && <p className="text-muted-foreground">No hay comentarios en esta lista.</p>}

        {rows.map((t, index) => {
          const isEditing = editing?.id === t.id;
          const locked = t.status === "approved" && !canApprove;
          return (
            <article key={t.id} className="space-y-4 border p-5" data-testid={`admin-testimonial-${t.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{t.authorName}</h3>
                  <p className="text-sm">
                    {[t.authorTitle, t.authorCompany].filter(Boolean).join(" · ")}
                    {t.authorCompany && (t.showCompany ? " (empresa visible)" : " (empresa oculta)")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.origin === "invite" ? "Por enlace de invitación" : t.origin === "google" ? "Importado de Google" : "Capturado en el panel"} · recibido {date(t.createdAt)}
                    {t.approvedAt && ` · aprobado por ${t.approvedByName} el ${date(t.approvedAt)}`}
                    {t.status === "rejected" && t.reviewedAt && ` · rechazado por ${t.reviewedByName} el ${date(t.reviewedAt)}`}
                    {t.status === "approved" && !t.published && " · oculto en el sitio"}
                  </p>
                </div>
                {t.status === "approved" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" aria-label="Subir" disabled={index === 0 || !!busy} onClick={() => move(t.id, -1)}>
                      ↑
                    </Button>
                    <Button size="sm" variant="outline" aria-label="Bajar" disabled={index === rows.length - 1 || !!busy} onClick={() => move(t.id, 1)}>
                      ↓
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(
                      t.id,
                      async () => {
                        await call("PUT", `/api/admin/testimonials/${t.id}`, editing.draft);
                        setEditing(null);
                      },
                      "Cambios guardados.",
                    );
                  }}
                >
                  {draftFields(editing.draft, (draft) => setEditing({ id: t.id, draft }), `edit-${t.id}`)}
                  <div className="flex gap-3">
                    <Button type="submit" disabled={busy === t.id}>
                      Guardar corrección
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-1 text-amber-500" aria-label={`${t.rating || 5} de 5 estrellas`} title={`${t.rating || 5} de 5 estrellas`}>{"★".repeat(t.rating || 5)}<span className="sr-only">{t.rating || 5} de 5 estrellas</span></div>
                  <blockquote className="whitespace-pre-line break-words border-s-2 ps-4 text-[17px] leading-relaxed">{t.quote}</blockquote>
                </>
              )}

              {!isEditing && (
                <div className="flex flex-wrap gap-3">
                  {canApprove && t.status === "captured" && (
                    <Button
                      disabled={busy === t.id}
                      onClick={() => void run(t.id, () => call("POST", `/api/admin/testimonials/${t.id}/status`, { status: "pending" }), "Testimonio enviado a pendientes de revisión.")}
                      data-testid={`button-review-${t.id}`}
                    >
                      Pasar a pendientes
                    </Button>
                  )}
                  {canApprove && t.status === "pending" && (
                    <Button
                      disabled={busy === t.id}
                      onClick={() => void run(t.id, () => call("POST", `/api/admin/testimonials/${t.id}/status`, { status: "approved" }), "Aprobado y publicado en /testimonios.")}
                      data-testid={`button-approve-${t.id}`}
                    >
                      Aprobar y publicar
                    </Button>
                  )}
                  {canApprove && t.status !== "rejected" && (
                    <Button
                      variant="outline"
                      disabled={busy === t.id}
                      onClick={() => {
                        if (t.status === "approved" && !window.confirm("¿Rechazar y retirar del sitio este testimonio?")) return;
                        void run(t.id, () => call("POST", `/api/admin/testimonials/${t.id}/status`, { status: "rejected" }), "Rechazado.");
                      }}
                      data-testid={`button-reject-${t.id}`}
                    >
                      Rechazar
                    </Button>
                  )}
                  {canApprove && t.status === "rejected" && (
                    <Button variant="outline" disabled={busy === t.id} onClick={() => void run(t.id, () => call("POST", `/api/admin/testimonials/${t.id}/status`, { status: "pending" }))}>
                      Regresar a pendientes
                    </Button>
                  )}
                  {!locked && (
                    <Button variant="outline" disabled={busy === t.id} onClick={() => setEditing({ id: t.id, draft: draftOf(t) })} data-testid={`button-edit-${t.id}`}>
                      Corregir errata
                    </Button>
                  )}
                  {t.status === "approved" && (t.published || canApprove) && (
                    <Button
                      variant="outline"
                      disabled={busy === t.id}
                      onClick={() =>
                        void run(t.id, () => call("POST", `/api/admin/testimonials/${t.id}/visibility`, { published: !t.published }), t.published ? "Oculto en el sitio." : "Visible en el sitio.")
                      }
                      data-testid={`button-visibility-${t.id}`}
                    >
                      {t.published ? "Ocultar del sitio" : "Mostrar en el sitio"}
                    </Button>
                  )}
                  {canApprove && (
                    <Button
                      variant="outline"
                      className="text-red-700"
                      disabled={busy === t.id}
                      onClick={() => {
                        if (!window.confirm("¿Borrar definitivamente este testimonio? No se puede deshacer.")) return;
                        void run(t.id, () => call("DELETE", `/api/admin/testimonials/${t.id}`), "Testimonio borrado.");
                      }}
                    >
                      Borrar
                    </Button>
                  )}
                  {!canApprove && (t.status === "captured" || t.status === "pending") && (
                    <p className="self-center text-sm text-muted-foreground">Pendiente de revisión del administrador principal.</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Invitaciones enviadas */}
      <section className="space-y-4" aria-labelledby="invites-title">
        <h2 id="invites-title" className="text-xl font-semibold">
          Invitaciones
        </h2>
        {invites.isError && <p role="alert">{invites.error.message}</p>}
        {!invites.isLoading && !invites.data?.length && <p className="text-muted-foreground">Aún no hay invitaciones.</p>}
        {!!invites.data?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pe-4 font-medium">Cliente</th>
                  <th className="py-2 pe-4 font-medium">Creada</th>
                  <th className="py-2 pe-4 font-medium">Vence</th>
                  <th className="py-2 pe-4 font-medium">Estado</th>
                  <th className="py-2 font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {invites.data.map((i) => (
                  <tr key={i.id} className="border-b align-top" data-testid={`invite-row-${i.id}`}>
                    <td className="py-2 pe-4">
                      {i.clientName || "—"}
                      {i.clientEmail && <span className="block text-muted-foreground">{i.clientEmail}</span>}
                    </td>
                    <td className="py-2 pe-4">
                      {date(i.createdAt)}
                      {i.createdByName && <span className="block text-muted-foreground">por {i.createdByName}</span>}
                    </td>
                    <td className="py-2 pe-4">{date(i.expiresAt)}</td>
                    <td className="py-2 pe-4">
                      {inviteStates[i.state]}
                      {i.usedAt && <span className="block text-muted-foreground">{date(i.usedAt)}</span>}
                    </td>
                    <td className="py-2">
                      {i.state === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === i.id}
                          onClick={() => {
                            if (!window.confirm("¿Anular esta invitación? El enlace dejará de funcionar.")) return;
                            void run(i.id, () => call("POST", `/api/admin/testimonials/invites/${i.id}/revoke`), "Invitación anulada.");
                          }}
                        >
                          Anular
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
