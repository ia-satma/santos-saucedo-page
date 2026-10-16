import { useEffect, useState, type ReactNode } from "react";
import { DownloadIcon, ReloadIcon } from "@radix-ui/react-icons";
import { adminApiRequest } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function validateAssetUrl(url: string) {
  if (!/^\/(?:api\/admin\/(?:generated-presentations|copies-ai)\/|generated-(?:images|audio)\/)/.test(url)
    || url.includes("..") || url.includes("\\")) throw new Error("Ruta de archivo no válida.");
}

async function assetBlob(url: string): Promise<Blob> {
  validateAssetUrl(url);
  const response = await adminApiRequest("GET", url);
  if (!response.ok) throw new Error(response.status === 404
    ? "El archivo ya no está disponible. El historial se conserva."
    : "No se pudo abrir el archivo. Reintente con su sesión activa.");
  return response.blob();
}

export function AssetDownloadButton({ url, filename, children, testId }: {
  url: string; filename: string; children: ReactNode; testId?: string;
}) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  return <Button type="button" size="sm" variant="outline" disabled={busy}
    data-testid={testId} onClick={async () => {
      setBusy(true);
      try {
        const objectUrl = URL.createObjectURL(await assetBlob(url));
        const link = document.createElement("a");
        link.href = objectUrl; link.download = filename;
        document.body.appendChild(link); link.click(); link.remove();
        // Give the browser time to acquire the blob before releasing it.
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
      } catch (error) {
        toast({ title: "No se pudo descargar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
      } finally { setBusy(false); }
    }}><DownloadIcon aria-hidden="true" />{busy ? "Preparando…" : children}</Button>;
}

function usePrivateAsset(url: string) {
  const [state, setState] = useState<{ url: string; error: string }>({ url: "", error: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false, objectUrl = "";
    setState({ url: "", error: "" });
    assetBlob(url).then(blob => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setState({ url: objectUrl, error: "" });
    }).catch(error => {
      if (!cancelled) setState({ url: "", error: error.message || "No se pudo cargar la vista previa." });
    });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}

export function PrivateAssetPreview({ url, label, pdf = false }: { url: string; label: string; pdf?: boolean }) {
  const asset = usePrivateAsset(url);
  if (asset.error) return <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm">
    <p>{asset.error}</p><Button type="button" variant="outline" size="sm" className="mt-3" onClick={asset.retry}><ReloadIcon />Reintentar vista previa</Button>
  </div>;
  if (!asset.url) return <div role="status" aria-label={`Cargando ${label}`} className="aspect-video rounded-md bg-muted animate-pulse" />;
  return pdf
    ? <iframe src={asset.url} title={label} className="h-[65vh] w-full rounded-md border" />
    : <img src={asset.url} alt={label} className="w-full rounded-md border" />;
}
