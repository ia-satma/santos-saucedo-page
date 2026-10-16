import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApiRequest } from "@/lib/adminAuth";
import { uploadAdminMedia, browserMediaMime } from "@/lib/adminMediaUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { siteLink } from "@shared/siteControls";
import type { MediaItem } from "@shared/schema";

export function MediaField({
  value,
  onChange,
  video = false,
  document = false,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  video?: boolean;
  document?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,setProgress]=useState(0);
  const controller=useRef<AbortController>();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const media = useQuery<MediaItem[]>({
    queryKey: ["/api/admin/media"],
    enabled: open,
    queryFn: async () => {
      const r = await adminApiRequest("GET", "/api/admin/media");
      if (!r.ok) throw new Error("No se pudo cargar la biblioteca.");
      return r.json();
    },
  });
  const prefix = document ? "application/pdf" : video ? "video/" : "image/";
  const matches =
    media.data?.filter(
      (m) =>
        m.mimeType?.startsWith(prefix) &&
        [m.originalName, m.alt, m.altEs]
          .join(" ")
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    ) ?? [];
  const upload = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      if (!browserMediaMime(file).startsWith(prefix))
        throw new Error(
          document
            ? "Elija un PDF."
            : video
              ? "Elija un video MP4 o WebM."
              : "Elija una imagen PNG, JPG, WebP o GIF.",
        );
      controller.current=new AbortController();
      const saved = await uploadAdminMedia(file,{onProgress:setProgress,signal:controller.current.signal});
      onChange(saved.path);
      void media.refetch();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };
  const validReference=Boolean(value)&&siteLink.safeParse(value).success;
  return (
    <div className="space-y-3">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Elija un archivo o escriba una URL HTTPS"
      />
      {validReference && !video && !document && (
        <img
          src={value}
          alt="Vista previa del archivo seleccionado"
          className="max-h-36 max-w-full object-contain bg-muted p-2"
          loading="lazy"
        />
      )}
      {validReference && video && (
        <video
          src={value}
          controls
          preload="none"
          className="max-h-40 max-w-full"
        />
      )}
      {validReference && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline block"
        >
          {document ? "Abrir PDF ↗" : "Abrir archivo ↗"}
        </a>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
        >
          {open ? "Cerrar biblioteca" : "Elegir de Galería"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => input.current?.click()}
        >
          {uploading ? `Subiendo ${progress}%…` : "Subir archivo"}
        </Button>
        {uploading&&<Button type="button" variant="outline" size="sm" onClick={()=>controller.current?.abort()}>Cancelar carga</Button>}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
          >
            Quitar referencia
          </Button>
        )}
        <input
          ref={input}
          type="file"
          hidden
          accept={
            document
              ? "application/pdf"
              : video
                ? "video/mp4,video/webm,video/quicktime,video/ogg,.m4v,.mov,.ogv"
                : "image/png,image/jpeg,image/webp,image/gif"
          }
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
      </div>
      <p className="text-sm text-muted-foreground">Hasta 200 MB. La referencia actual cambia solo cuando termina la carga.</p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {open && (
        <div className="border p-3 space-y-3">
          <Input
            aria-label="Buscar archivo en la biblioteca"
            placeholder="Buscar por nombre o descripción"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {media.isLoading && <p role="status">Cargando biblioteca…</p>}
          {media.isError && <p role="alert">{media.error.message}</p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-96 overflow-y-auto">
            {matches.map((m) => (
              <button
                type="button"
                key={m.id}
                className="min-w-0 border p-2 text-left hover:border-primary focus-visible:outline focus-visible:outline-2"
                onClick={() => {
                  onChange(m.path);
                  setOpen(false);
                }}
              >
                {!video && !document && (
                  <img
                    src={m.path}
                    alt={m.altEs || m.originalName}
                    className="h-20 w-full object-contain"
                    loading="lazy"
                  />
                )}
                <span className="block truncate text-xs mt-2">
                  {m.originalName}
                </span>
              </button>
            ))}
          </div>
          {!media.isLoading && !matches.length && (
            <p className="text-sm text-muted-foreground">
              No hay archivos de este tipo que coincidan con la búsqueda.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
