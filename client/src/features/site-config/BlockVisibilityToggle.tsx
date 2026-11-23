import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { adminApiRequest } from "@/lib/adminAuth";
import { pageVisibility } from "@/lib/pageVisibility";
import { notifyCmsSaved } from "@/hooks/useCmsContent";

type LayoutState = { pages?: Record<string, { enabled?: boolean; blocks?: Record<string, boolean> }>; [key: string]: unknown };
type LayoutResponse = { content: LayoutState; revision: string };

const visibilityQueryKey = ["/api/admin/site-config", "layout", "visibility"];
const legacyBlockAliases: Record<string, Record<string, string>> = {
  team: { socios: "carrusel", colaboradores: "perfiles" },
};

async function loadLayout(): Promise<LayoutResponse> {
  const response = await adminApiRequest("GET", "/api/admin/site-config/layout");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "No se pudo cargar la visibilidad.");
  return data;
}

export function BlockVisibilityToggle({ pageId, blockKey, label }: { pageId: string; blockKey: string; label: string }) {
  const queryClient = useQueryClient();
  const query = useQuery<LayoutResponse>({ queryKey: visibilityQueryKey, queryFn: loadLayout, staleTime: 15000 });
  const state = pageVisibility(query.data?.content, pageId);
  const enabled = state.blocks[blockKey] !== false;

  const toggle = useMutation({
    mutationFn: async (next: boolean) => {
    const current = query.data;
    if (!current) return;
    const page = current.content.pages?.[pageId] ?? { enabled: true, blocks: {} };
    const blocks = { ...(page.blocks ?? {}), [blockKey]: next };
    const legacyKey = legacyBlockAliases[pageId]?.[blockKey];
    if (legacyKey) blocks[legacyKey] = next;
    const content: LayoutState = {
      ...current.content,
      pages: {
        ...(current.content.pages ?? {}),
        [pageId]: { ...page, blocks },
      },
    };
    const response = await adminApiRequest("PUT", "/api/admin/site-config/layout", { content, revision: current.revision });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo guardar la visibilidad.");
    queryClient.setQueryData(visibilityQueryKey, data as LayoutResponse);
    notifyCmsSaved();
    },
  });

  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground" title={`Controlar la visibilidad de ${label} en todos los idiomas`}>
      <span>{enabled ? "Visible" : "Oculto"}</span>
      <Switch
        checked={enabled}
        disabled={query.isLoading || query.isError || toggle.isPending}
        onCheckedChange={(next) => toggle.mutate(next)}
        aria-label={`${enabled ? "Ocultar" : "Mostrar"} ${label}`}
      />
    </label>
  );
}
