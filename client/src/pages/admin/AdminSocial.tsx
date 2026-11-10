import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Archive, Copy, Image as ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SocialAsset = {
  id: string;
  kind: "post" | "carousel";
  title: string;
  topic: string;
  language: string;
  format: string;
  slideCount: number;
  status: string;
  renderStatus: string;
  previewUrl: string | null;
  packageUrl: string | null;
  createdAt: string;
};

export default function AdminSocial() {
  const { isAuthenticated, requireAuth } = useAdminAuth();
  const { toast } = useToast();
  const [kind, setKind] = useState<"post" | "carousel">("post");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("es");
  const [format, setFormat] = useState("square");
  const [slideCount, setSlideCount] = useState("1");
  const [sourceNotes, setSourceNotes] = useState("");
  useEffect(() => { requireAuth(); }, [requireAuth]);

  const assets = useQuery<SocialAsset[]>({
    queryKey: ["/api/admin/social-assets"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await adminApiRequest("GET", "/api/admin/social-assets");
      if (!response.ok) throw new Error("No se pudieron cargar los contenidos sociales.");
      return response.json();
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      const response = await adminApiRequest("POST", "/api/admin/social-assets/generate", {
        kind,
        title,
        topic,
        language,
        format,
        slideCount: kind === "carousel" ? Math.max(2, Number(slideCount) || 2) : 1,
        palette: "navy-lime",
        includeImages: false,
        sourceNotes,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "No se pudo generar el contenido.");
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-assets"] });
      toast({ title: kind === "carousel" ? "Carrusel generado" : "Post generado" });
      setTitle("");
      setTopic("");
      setSourceNotes("");
    },
    onError: (error) => toast({ title: "No se pudo generar", description: error.message, variant: "destructive" }),
  });

  const assetAction = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "copy" | "redesign" | "archive" }) => {
      const response = await adminApiRequest(action === "archive" ? "POST" : "POST", `/api/admin/social-assets/${id}/${action}`, action === "redesign" ? { status: "ready" } : {});
      if (!response.ok) throw new Error("La acción no se pudo completar.");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/social-assets"] }),
    onError: (error) => toast({ title: "No se pudo completar", description: error.message, variant: "destructive" }),
  });

  return <div className="space-y-6" data-testid="page-admin-social">
    <AdminPageHeader title="Post y Carruseles IA" description="Genera piezas sociales con la identidad de Santos & Saucedo y conserva cada versión en App Storage." />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label htmlFor="social-kind">Tipo de pieza</Label><Select value={kind} onValueChange={(value: "post" | "carousel") => setKind(value)}><SelectTrigger id="social-kind"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="post">Post</SelectItem><SelectItem value="carousel">Carrusel</SelectItem></SelectContent></Select></div>
        <div><Label htmlFor="social-title">Título</Label><Input id="social-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tema de la publicación" /></div>
        <div><Label htmlFor="social-topic">Tema e instrucciones</Label><Textarea id="social-topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Describe el contenido que debe comunicar la pieza" className="min-h-[150px]" /></div>
        <div><Label htmlFor="social-notes">Material de apoyo</Label><Textarea id="social-notes" value={sourceNotes} onChange={(event) => setSourceNotes(event.target.value)} placeholder="Datos, fechas o fuente editorial opcional" /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="social-language">Idioma</Label><Select value={language} onValueChange={setLanguage}><SelectTrigger id="social-language"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="es">Español</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></div><div><Label htmlFor="social-format">Formato</Label><Select value={format} onValueChange={setFormat}><SelectTrigger id="social-format"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="square">Cuadrado</SelectItem><SelectItem value="portrait">Vertical</SelectItem><SelectItem value="story">Historia</SelectItem><SelectItem value="landscape">Horizontal</SelectItem></SelectContent></Select></div></div>
        {kind === "carousel" && <div><Label htmlFor="social-slides">Diapositivas</Label><Input id="social-slides" type="number" min={2} max={12} value={slideCount} onChange={(event) => setSlideCount(event.target.value)} /></div>}
        <Button className="w-full" disabled={generate.isPending || !title.trim() || !topic.trim()} onClick={() => generate.mutate()}>{generate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Generar con IA</Button>
      </CardContent></Card>
      <Card><CardContent className="pt-6"><div className="mb-4"><h2 className="text-lg font-semibold">Piezas guardadas</h2><p className="text-sm text-muted-foreground">Cada preview y paquete editable queda protegido en App Storage.</p></div>{assets.isLoading ? <p className="text-sm text-muted-foreground">Cargando piezas…</p> : assets.data?.length ? <div className="divide-y">{assets.data.map((asset) => <div key={asset.id} className="grid gap-4 py-5 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-start"><div className="overflow-hidden rounded-md border bg-slate-50">{asset.previewUrl ? <img src={asset.previewUrl} alt={asset.title} className="block aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5E8F17]">{asset.kind === "carousel" ? "Carrusel" : "Post"}</span><span className="text-xs text-muted-foreground">{asset.format} · {asset.language} · {asset.slideCount} piezas</span></div><h3 className="mt-1 truncate font-medium">{asset.title}</h3><p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{asset.topic}</p><div className="mt-3 flex flex-wrap gap-3 text-sm">{asset.previewUrl && <a className="underline" href={asset.previewUrl} target="_blank" rel="noreferrer">Ver preview</a>}{asset.packageUrl && <a className="underline" href={asset.packageUrl}>Descargar paquete</a>}</div></div><div className="flex gap-1 md:flex-col"><Button variant="ghost" size="icon" aria-label="Duplicar pieza" onClick={() => assetAction.mutate({ id: asset.id, action: "copy" })}><Copy className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Archivar pieza" onClick={() => assetAction.mutate({ id: asset.id, action: "archive" })}><Archive className="h-4 w-4" /></Button></div></div>)}</div> : <p className="text-sm text-muted-foreground">Todavía no hay posts ni carruseles generados.</p>}</CardContent></Card>
    </div>
  </div>;
}
