import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  PlusIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import { adminApiRequest } from "@/lib/adminAuth";
import { uploadAdminMedia } from "@/lib/adminMediaUpload";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { MediaItem } from "@shared/schema";
const kinds = [
  ["all", "Todos"],
  ["image", "Imágenes"],
  ["video", "Videos"],
  ["document", "Documentos PDF"],
  ["archive", "Archivados"],
] as const;
export default function AdminMedia() {
  const [kind, setKind] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [altEs, setAltEs] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const url =
    kind === "archive" ? "/api/admin/media-archive" : "/api/admin/media";
  const query = useQuery<MediaItem[]>({
    queryKey: [url],
    queryFn: async () => {
      const r = await adminApiRequest("GET", url);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo cargar la biblioteca.");
      return d;
    },
  });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
    void queryClient.invalidateQueries({
      queryKey: ["/api/admin/media-archive"],
    });
    void queryClient.invalidateQueries({ queryKey: ["/api/admin/overview"] });
  };
  const upload = async (files: FileList) => {
    setBusy(true);
    setError("");
    setNotice("");
    let done = 0;
    try {
      for (const file of Array.from(files)) {
        setNotice(`Cargando ${done + 1} de ${files.length}: ${file.name}`);
        await uploadAdminMedia(file);
        done++;
      }
      setNotice(
        `${done} ${done === 1 ? "archivo cargado" : "archivos cargados"}. Ya puede seleccionarlos en los formularios.`,
      );
    } catch (e) {
      setError(
        `${done ? `${done} archivos cargados. ` : ""}${(e as Error).message}`,
      );
      setNotice("");
    } finally {
      setBusy(false);
      refresh();
      if (input.current) input.current.value = "";
    }
  };
  const action = async (method: string, path: string, data?: unknown) => {
    setBusy(true);
    setError("");
    try {
      const r = await adminApiRequest(method, path, data);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo guardar.");
      refresh();
      setEditing(null);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const filtered = (query.data ?? []).filter(
    (m) =>
      (kind === "all" ||
        kind === "archive" ||
        (kind === "document"
          ? m.mimeType === "application/pdf"
          : m.mimeType.startsWith(kind + "/"))) &&
      `${m.originalName} ${m.alt ?? ""} ${m.altEs ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <main className="admin-overview">
      <div className="admin-overview-heading">
        <div>
          <p className="admin-page-kicker">Archivos del sitio</p>
          <h1>Biblioteca de medios</h1>
          <p className="admin-page-description">
            Cargue imágenes, videos y PDFs para reutilizarlos en todo el sitio.
            Archivar retira el archivo del selector y conserva las referencias
            existentes.
          </p>
        </div>
        <button
          className="admin-primary-link"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <PlusIcon />
          {busy ? "Cargando…" : "Subir archivos"}
        </button>
        <input
          ref={input}
          hidden
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf"
          onChange={(e) => {
            if (e.target.files?.length) void upload(e.target.files);
          }}
        />
      </div>
      <div
        className="flex flex-wrap gap-2 mt-7 mb-5"
        role="group"
        aria-label="Filtrar tipo de archivo"
      >
        {kinds.map(([key, label]) => (
          <Button
            size="sm"
            key={key}
            variant={kind === key ? "default" : "outline"}
            onClick={() => setKind(key)}
          >
            {label}
          </Button>
        ))}
      </div>
      <label htmlFor="media-search" className="sr-only">
        Buscar archivos
      </label>
      <Input
        id="media-search"
        placeholder="Buscar por nombre o descripción…"
        className="max-w-md mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {notice && (
        <p role="status" className="text-sm my-5">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="admin-error mb-5">
          {error}
        </p>
      )}
      {query.isError && (
        <p role="alert" className="admin-error mb-5">
          {query.error.message}{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Reintentar
          </button>
        </p>
      )}
      {query.isLoading ? (
        <div className="admin-media-grid">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            {filtered.length} {filtered.length === 1 ? "archivo" : "archivos"} ·
            JPG, PNG, WebP, GIF, MP4, WebM y PDF · máximo 50 MB por archivo
          </p>
          <div className="admin-media-grid">
            {filtered.map((m) => (
              <article key={m.id} className="admin-media-card">
                <a
                  className="admin-media-preview"
                  href={m.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${m.originalName}`}
                >
                  {m.mimeType.startsWith("image/") ? (
                    <img
                      src={m.path}
                      alt={m.altEs || m.alt || m.originalName}
                      loading="lazy"
                    />
                  ) : m.mimeType.startsWith("video/") ? (
                    <VideoIcon />
                  ) : (
                    <FileTextIcon />
                  )}
                </a>
                <div className="admin-media-info">
                  <strong title={m.originalName}>{m.originalName}</strong>
                  <p>
                    {((m.size ?? 0) / 1024 / 1024).toLocaleString("es-MX", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    MB ·{" "}
                    {m.path.startsWith("/media/")
                      ? "Almacenamiento del proyecto"
                      : "Referencia existente"}
                  </p>
                  <div className="admin-media-actions">
                    <a href={m.path} target="_blank" rel="noopener noreferrer">
                      Abrir
                    </a>
                    <button
                      disabled={busy}
                      onClick={() => {
                        setEditing(m);
                        setAlt(m.alt ?? "");
                        setAltEs(m.altEs ?? "");
                      }}
                    >
                      Descripciones
                    </button>
                    {kind === "archive" ? (
                      <button
                        disabled={busy}
                        onClick={() =>
                          void action("PATCH", `/api/admin/media/${m.id}`, {
                            restore: true,
                          })
                        }
                      >
                        Restaurar
                      </button>
                    ) : (
                      <button
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              "¿Archivar este archivo? Se puede restaurar y las páginas que ya lo usan seguirán funcionando.",
                            )
                          )
                            void action("DELETE", `/api/admin/media/${m.id}`);
                        }}
                      >
                        Archivar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <div className="admin-empty">
              <ImageIcon className="w-7 h-7 mb-3" />
              <p>
                {kind === "archive"
                  ? "No hay archivos archivados."
                  : search
                    ? "No encontramos archivos con esa búsqueda."
                    : "No hay archivos de este tipo. Use “Subir archivos” para añadir el primero."}
              </p>
            </div>
          )}
        </>
      )}
      <Link
        href="/admin/site-config/media"
        className="inline-flex gap-3 items-center text-xs mt-10 underline"
      >
        Editar imágenes y video de las páginas
        <ArrowRightIcon />
      </Link>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !busy) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Descripciones del archivo</DialogTitle>
          <DialogDescription>
            Estos textos identifican el archivo en la biblioteca. Cada página
            conserva su texto alternativo editorial.
          </DialogDescription>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (editing)
                void action("PATCH", `/api/admin/media/${editing.id}`, {
                  alt,
                  altEs,
                });
            }}
          >
            <div>
              <label htmlFor="media-alt-es" className="text-sm block mb-2">
                Descripción en español
              </label>
              <Input
                id="media-alt-es"
                maxLength={500}
                value={altEs}
                onChange={(e) => setAltEs(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="media-alt-en" className="text-sm block mb-2">
                Descripción en inglés
              </label>
              <Input
                id="media-alt-en"
                maxLength={500}
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
            </div>
            <Button disabled={busy} type="submit">
              {busy ? "Guardando…" : "Guardar descripciones"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
