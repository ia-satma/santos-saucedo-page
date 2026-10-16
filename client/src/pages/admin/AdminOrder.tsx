import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { adminApiRequest, useAdminAuth } from "@/lib/adminAuth";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { Button } from "@/components/ui/button";
type Item = { id: string; label: string; imageUrl?: string; visible: boolean };
type Result = { revision: string; items: Item[] };
const catalogs = {
  team: "Abogados y equipo",
  practices: "Prácticas",
  industries: "Industrias",
  gallery: "Galería de oficina",
};
export default function AdminOrder() {
  const { isAuthenticated, requireAuth } = useAdminAuth();
  const [catalog, setCatalog] = useState<keyof typeof catalogs>(() => {
    const key = new URLSearchParams(window.location.search).get("catalog");
    return key && key in catalogs ? (key as keyof typeof catalogs) : "team";
  });
  const [draft, setDraft] = useState<Item[]>([]);
  const [revision, setRevision] = useState("");
  const [baseline, setBaseline] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [dragged, setDragged] = useState<string | null>(null);
  const dirty = JSON.stringify(draft.map((x) => x.id)) !== baseline;
  useUnsavedChanges(dirty && !busy);
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  const query = useQuery<Result>({
    queryKey: ["/api/admin/catalog-order", catalog],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const r = await adminApiRequest(
        "GET",
        `/api/admin/catalog-order/${catalog}`,
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    },
  });
  const loadedCatalog = useRef<string>();
  useEffect(() => {
    if (query.data && (!dirty || loadedCatalog.current !== catalog)) {
      loadedCatalog.current = catalog;
      setDraft(query.data.items);
      setBaseline(JSON.stringify(query.data.items.map((x) => x.id)));
      setRevision(query.data.revision);
    }
  }, [query.data, catalog]);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= draft.length) return;
    const next = [...draft];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setDraft(next);
    setNotice("");
  };
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await adminApiRequest(
        "PUT",
        `/api/admin/catalog-order/${catalog}`,
        { ids: draft.map((x) => x.id), revision },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDraft(d.items);
      setRevision(d.revision);
      setBaseline(JSON.stringify(d.items.map((x: Item) => x.id)));
      setNotice(
        "Orden guardado. El sitio usará esta prioridad dentro de cada categoría.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (!isAuthenticated) return null;
  return (
    <main className="max-w-5xl mx-auto p-6">
      <Link href="/admin/dashboard" className="underline">
        ← Panel
      </Link>
      <header className="my-8">
        <h1 className="text-2xl">Orden del contenido</h1>
        <p className="text-sm text-muted-foreground mt-3">
          La lista completa incluye los registros ocultos. Arrastre las filas o
          use las flechas y guarde el orden. Los grupos del diseño público
          conservan su estructura.
        </p>
      </header>
      <label htmlFor="catalog-order" className="block text-sm mb-2">
        Catálogo
      </label>
      <select
        id="catalog-order"
        className="border p-3 bg-background"
        value={catalog}
        disabled={busy}
        onChange={(e) => {
          if (!dirty || window.confirm("¿Descartar el orden sin guardar?")) {
            setCatalog(e.target.value as keyof typeof catalogs);
            setError("");
            setNotice("");
          }
        }}
      >
        {Object.entries(catalogs).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-3 my-5">
        <Button
          disabled={!dirty || busy || query.isLoading}
          onClick={() => void save()}
        >
          {busy ? "Guardando…" : "Guardar orden"}
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => {
            if (
              !dirty ||
              window.confirm("¿Descartar este orden y recargar la lista?")
            ) {
              if (query.data) {
                setDraft(query.data.items);
                setRevision(query.data.revision);
                setBaseline(JSON.stringify(query.data.items.map((x) => x.id)));
              }
              void query.refetch();
            }
          }}
        >
          Recargar lista
        </Button>
      </div>
      {error && (
        <p role="alert" className="my-4 text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="my-4">
          {notice}
        </p>
      )}
      {query.isLoading && <p>Cargando catálogo…</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      <ol className="space-y-2">
        {draft.map((item, i) => (
          <li
            key={item.id}
            draggable={!busy}
            onDragStart={() => setDragged(item.id)}
            onDragEnd={() => setDragged(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = draft.findIndex((x) => x.id === dragged);
              if (from >= 0) move(from, i);
              setDragged(null);
            }}
            className="border bg-background p-3 flex items-center gap-4"
          >
            <span className="text-sm tabular-nums text-muted-foreground w-7">
              {i + 1}
            </span>
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                className="h-12 w-12 object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <strong className="block text-sm">{item.label}</strong>
              <span className="text-xs text-muted-foreground">
                {item.visible ? "Visible" : "Oculto"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={i === 0 || busy}
              aria-label={`Subir ${item.label}`}
              onClick={() => move(i, i - 1)}
            >
              ↑
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={i === draft.length - 1 || busy}
              aria-label={`Bajar ${item.label}`}
              onClick={() => move(i, i + 1)}
            >
              ↓
            </Button>
          </li>
        ))}
      </ol>
    </main>
  );
}
