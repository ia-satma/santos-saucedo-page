import { createContext, useContext, useEffect, lazy, Suspense } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminApiRequest, useAdminAuth } from "@/lib/adminAuth";
const PreviewContext = createContext(false);
export const useContentPreview = () => useContext(PreviewContext);
export function useContentEntity<T>(
  kind: "team" | "practices" | "news" | "industries",
  slug: string | undefined,
) {
  const preview = useContentPreview();
  const map = {
    team: "team",
    practices: "practice-groups",
    news: "news",
    industries: "industry-groups",
  };
  const url = preview
    ? `/api/admin/preview/${kind}/${slug}`
    : `/api/${map[kind]}/${slug}`;
  const query = useQuery<T>({
    queryKey: [url],
    enabled: !!slug,
    ...(preview
      ? {
          staleTime: 0,
          gcTime: 0,
          refetchOnWindowFocus: false,
          queryFn: async () => {
            const response = await adminApiRequest("GET", url);
            if (!response.ok)
              throw new Error("No se pudo cargar el contenido.");
            const item = await response.json();
            if (kind === "team" && item.imageUrl?.startsWith("/team_photos/")) {
              const photo = await adminApiRequest(
                "GET",
                `/api/admin/preview/team/${slug}/image`,
              );
              if (photo.ok)
                item.imageUrl = URL.createObjectURL(await photo.blob());
            }
            return item;
          },
        }
      : {}),
    retry: 1,
  });
  const image = (query.data as { imageUrl?: string } | undefined)?.imageUrl;
  useEffect(
    () => () => {
      if (preview && image?.startsWith("blob:")) URL.revokeObjectURL(image);
    },
    [preview, image],
  );
  return query;
}
const Team = lazy(() => import("@/pages/TeamMemberDetail"));
const Practice = lazy(() => import("@/pages/PracticeGroupDetail"));
const News = lazy(() => import("@/pages/NewsDetail"));
const Industry = lazy(() => import("@/pages/IndustryGroupDetail"));
export default function ContentPreview() {
  const { kind, slug } = useParams<{ kind: string; slug: string }>();
  const { setLanguage } = useLanguage();
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("lang");
    if (selected === "es" || selected === "en") setLanguage(selected);
  }, [kind, slug]);
  const { isAuthenticated, requireAuth } = useAdminAuth();
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  const back =
    kind === "team"
      ? `/admin/team/${slug}/edit`
      : kind === "news"
        ? `/admin/news/${slug}/edit`
        : kind === "practices"
          ? "/admin/practice-groups"
          : "/admin/industry-groups";
  if (!isAuthenticated) return null;
  const View = (
    {
      team: Team,
      practices: Practice,
      news: News,
      industries: Industry,
    } as Record<string, typeof Team>
  )[kind];
  if (!View) return <p>Vista previa desconocida.</p>;
  return (
    <PreviewContext.Provider value={true}>
      <aside
        className="fixed bottom-5 left-4 right-4 mx-auto max-w-xl bg-white border border-slate-300 rounded-md shadow-lg p-4 flex flex-wrap items-center justify-between gap-3 z-50 text-sm"
        aria-label="Vista previa privada"
      >
        <div>
          <strong className="block">Vista previa privada</strong>
          <span className="text-xs text-slate-500">
            Muestra la versión guardada. Abrir esta vista no publica el
            registro.
          </span>
        </div>
        <Link href={back} className="underline">
          Volver a editar
        </Link>
      </aside>
      <Suspense fallback={<p className="p-10">Preparando vista previa…</p>}>
        <View />
      </Suspense>
    </PreviewContext.Provider>
  );
}
