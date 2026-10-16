import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  adminApiRequest,
  readAdminJson,
  useMyPermissions,
} from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
type Article = {
  id: string;
  title: string;
  titleEs: string;
  published: boolean;
  translatedLanguages: string[];
  missingLanguages: string[];
};
export default function AdminTranslations() {
  const { toast } = useToast(),
    { has } = useMyPermissions();
  const [search, setSearch] = useState(""),
    [busy, setBusy] = useState<string | null>(null);
  const query = useQuery<{ languages: string[]; articles: Article[] }>({
    queryKey: ["/api/admin/translation-overview"],
    queryFn: async () =>
      readAdminJson(
        await adminApiRequest("GET", "/api/admin/translation-overview"),
        "No se pudo cargar la cobertura.",
      ),
  });
  const translate = async (article: Article) => {
    setBusy(article.id);
    try {
      const result = await readAdminJson<{ success: boolean; error?: string }>(
        await adminApiRequest("POST", "/api/agents/run/polyglot_translator", {
          articleId: article.id,
          targetLanguages: article.missingLanguages,
          applyChanges: true,
        }),
        "No se pudo completar la traducción.",
      );
      if (!result.success)
        throw new Error(result.error || "La traducción requiere revisión.");
      toast({ title: "Traducciones guardadas en el borrador" });
      void queryClient.invalidateQueries({
        queryKey: ["/api/admin/translation-overview"],
      });
    } catch (error) {
      toast({
        title: "No se guardó la traducción",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };
  return (
    <main className="admin-management-page">
      <p className="admin-page-kicker">Contenido multilingüe</p>
      <h1>Traducciones</h1>
      <p className="my-4 max-w-3xl">
        Español e inglés se editan en el Monitor Laboral. Las traducciones
        adicionales se guardan por artículo. Para aplicar traducciones
        automáticas, la publicación debe estar en borrador.
      </p>
      <div className="flex flex-wrap gap-3 my-6">
        <Input
          aria-label="Buscar artículos para traducir"
          placeholder="Buscar por título…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button
          variant="outline"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          Actualizar
        </Button>
      </div>
      {query.isPending ? (
        <p role="status">Cargando artículos…</p>
      ) : query.isError ? (
        <p role="alert">{query.error.message}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-3">Artículo</th>
                <th className="p-3">Idiomas guardados</th>
                <th className="p-3">Pendientes</th>
                <th className="p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {query.data.articles
                .filter((a) =>
                  (a.title + " " + a.titleEs)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((a) => (
                  <tr className="border-t" key={a.id}>
                    <td className="p-3">
                      <Link
                        className="underline"
                        href={`/admin/news/${a.id}/edit`}
                      >
                        {a.titleEs || a.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {a.published ? "Publicada" : "Borrador"}
                      </p>
                    </td>
                    <td className="p-3 uppercase">
                      {a.translatedLanguages.join(", ")}
                    </td>
                    <td className="p-3 uppercase">
                      {a.missingLanguages.join(", ") || "Completas"}
                    </td>
                    <td className="p-3">
                      <Button
                        disabled={
                          !!busy ||
                          a.published ||
                          !a.missingLanguages.length ||
                          !has("agents")
                        }
                        onClick={() => void translate(a)}
                      >
                        {busy === a.id ? "Traduciendo…" : "Traducir borrador"}
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!query.data.articles.length && (
            <p className="p-4">Todavía no hay publicaciones.</p>
          )}
        </div>
      )}
    </main>
  );
}
