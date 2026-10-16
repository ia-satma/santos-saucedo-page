import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApiRequest } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CareerApplication } from "@shared/schema";
type Row = Omit<CareerApplication, "cvPath"> & { hasCv: boolean };
const states = {
  received: "Recibida",
  reviewed: "Revisada",
  contacted: "Contactado",
  closed: "Cerrada",
};
export default function AdminApplications() {
  const [search, setSearch] = useState(""),
    [archive, setArchive] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState("");
  const query = useQuery<Row[]>({
    queryKey: ["/api/admin/career-applications"],
    queryFn: async () => {
      const r = await adminApiRequest("GET", "/api/admin/career-applications");
      if (!r.ok) throw new Error("No se pudieron cargar las candidaturas.");
      return r.json();
    },
  });
  const update = async (id: string, data: unknown) => {
    setBusy(id);
    setError("");
    try {
      const r = await adminApiRequest(
        "PATCH",
        `/api/admin/career-applications/${id}`,
        data,
      );
      if (!r.ok) throw new Error("No se pudo guardar.");
      await query.refetch();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  const download = async (row: Row) => {
    setBusy(row.id);
    setError("");
    try {
      const r = await adminApiRequest(
        "GET",
        `/api/admin/career-applications/${row.id}/cv`,
      );
      if (!r.ok)
        throw new Error("El CV no está disponible; reintente la descarga.");
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = row.cvOriginalName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  const rows = (query.data || []).filter(
    (r) =>
      Boolean(r.archivedAt) === archive &&
      [r.fullName, r.email, r.interest, r.message]
        .join(" ")
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-7">
      <header>
        <h1 className="text-3xl font-semibold">Candidaturas y CV</h1>
        <p className="mt-3 text-muted-foreground">
          Solicitudes recibidas desde Carreras y Semillero. Los CV se descargan
          con autorización; archivar conserva el expediente.
        </p>
      </header>
      <div className="flex flex-wrap gap-4">
        <Input
          aria-label="Buscar candidaturas"
          placeholder="Nombre, correo o área"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-lg"
        />
        <Button variant="outline" onClick={() => setArchive(!archive)}>
          {archive ? "Ver activas" : "Ver archivadas"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {query.isLoading && <p role="status">Cargando candidaturas…</p>}
      {query.isError && (
        <p role="alert">
          {query.error.message}
          <Button variant="outline" onClick={() => void query.refetch()}>
            Reintentar
          </Button>
        </p>
      )}
      {!query.isLoading && !query.isError && !rows.length && (
        <p>Aún no hay candidaturas que coincidan.</p>
      )}
      {rows.map((row) => (
        <article key={row.id} className="border p-5 space-y-4">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{row.fullName}</h2>
              <p>
                {row.email} · {row.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {row.interest} ·{" "}
                {row.submittedAt
                  ? new Date(row.submittedAt).toLocaleString("es-MX")
                  : ""}{" "}
                · {row.read ? "Leída" : "Sin leer"}
              </p>
            </div>
            <Button
              variant="outline"
              disabled={busy === row.id}
              onClick={() => void download(row)}
            >
              Descargar CV privado
            </Button>
          </div>
          <p className="whitespace-pre-line break-words">{row.message}</p>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="space-y-2">
              <span className="block">Seguimiento</span>
              <select
                value={row.status || "received"}
                disabled={busy === row.id}
                className="min-h-11 border bg-background px-3"
                onChange={(e) =>
                  void update(row.id, { status: e.target.value })
                }
              >
                {Object.entries(states).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="outline"
              disabled={busy === row.id}
              onClick={() => void update(row.id, { read: !row.read })}
            >
              {row.read ? "Marcar sin leer" : "Marcar leída"}
            </Button>
            <Button
              variant="outline"
              disabled={busy === row.id}
              onClick={() => void update(row.id, { archived: !row.archivedAt })}
            >
              {row.archivedAt ? "Restaurar" : "Archivar"}
            </Button>
          </div>
        </article>
      ))}
    </main>
  );
}
