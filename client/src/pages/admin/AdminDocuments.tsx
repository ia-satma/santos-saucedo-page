import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Pencil, Archive } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type GeneratedDocument = {
  id: string; title: string; sourceText: string; instructions: string | null;
  mode: "preserve" | "organize"; language: string; version: number;
  docxUrl: string | null; pdfUrl: string | null; createdAt: string;
};

export default function AdminDocuments() {
  const { isAuthenticated, requireAuth } = useAdminAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [mode, setMode] = useState<"preserve" | "organize">("organize");
  const [editingId, setEditingId] = useState<string | null>(null);
  useEffect(() => { requireAuth(); }, [requireAuth]);
  const documents = useQuery<GeneratedDocument[]>({
    queryKey: ["/api/admin/documents"], enabled: isAuthenticated,
    queryFn: async () => { const response = await adminApiRequest("GET", "/api/admin/documents"); if (!response.ok) throw new Error("No se pudieron cargar los documentos."); return response.json(); },
  });
  const save = useMutation({
    mutationFn: async () => {
      const response = await adminApiRequest(editingId ? "PATCH" : "POST", editingId ? `/api/admin/documents/${editingId}` : "/api/admin/documents/generate", { title, sourceText, instructions: instructions || null, mode, language: "es" });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || "No se pudo guardar el documento."); return body;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] }); toast({ title: editingId ? "Nueva versión guardada" : "Documento generado" }); setEditingId(null); setTitle(""); setSourceText(""); setInstructions(""); },
    onError: (error) => toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" }),
  });
  const archive = useMutation({
    mutationFn: async (id: string) => { const response = await adminApiRequest("POST", `/api/admin/documents/${id}/archive`, {}); if (!response.ok) throw new Error("No se pudo archivar."); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] }),
  });
  const edit = (document: GeneratedDocument) => { setEditingId(document.id); setTitle(document.title); setSourceText(document.sourceText); setInstructions(document.instructions || ""); setMode(document.mode); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <div className="space-y-6">
    <AdminPageHeader title="Documentos con membrete" description="Genera documentos editables con la identidad de Santos & Saucedo." />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label htmlFor="document-title">Título</Label><Input id="document-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título del documento" /></div>
        <div><Label htmlFor="document-source">Contenido</Label><Textarea id="document-source" value={sourceText} onChange={(event) => setSourceText(event.target.value)} placeholder="Pega aquí el contenido del documento" className="min-h-[280px]" /></div>
        <div><Label htmlFor="document-instructions">Indicaciones editoriales</Label><Textarea id="document-instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Opcional" /></div>
        <div><Label>Modo</Label><Select value={mode} onValueChange={(value: "preserve" | "organize") => setMode(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="organize">Organizar contenido</SelectItem><SelectItem value="preserve">Preservar párrafos</SelectItem></SelectContent></Select></div>
        <Button className="w-full" disabled={save.isPending || !title.trim() || !sourceText.trim()} onClick={() => save.mutate()}>{save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}{editingId ? "Guardar nueva versión" : "Generar documento"}</Button>
      </CardContent></Card>
      <Card><CardContent className="pt-6"><div className="mb-4"><h2 className="text-lg font-semibold">Historial de documentos</h2><p className="text-sm text-muted-foreground">Los archivos se conservan en App Storage.</p></div>{documents.isLoading ? <p className="text-sm text-muted-foreground">Cargando documentos…</p> : documents.data?.length ? <div className="divide-y">{documents.data.map((document) => <div key={document.id} className="flex items-start justify-between gap-4 py-4"><div className="min-w-0"><p className="font-medium truncate">{document.title}</p><p className="text-xs text-muted-foreground">Versión {document.version} · {new Date(document.createdAt).toLocaleString("es-MX")}</p><div className="mt-2 flex flex-wrap gap-2">{document.docxUrl && <a className="text-sm underline" href={document.docxUrl}>Descargar DOCX</a>}{document.pdfUrl && <a className="text-sm underline" href={document.pdfUrl}>Descargar PDF</a>}</div></div><div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" aria-label="Editar documento" onClick={() => edit(document)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Archivar documento" onClick={() => archive.mutate(document.id)}><Archive className="h-4 w-4" /></Button></div></div>)}</div> : <p className="text-sm text-muted-foreground">Todavía no hay documentos generados.</p>}</CardContent></Card>
    </div>
  </div>;
}
