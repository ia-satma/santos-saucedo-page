import { AiUsageCard } from "@/components/admin/AiUsageCard";
import { adminLinkTone } from "@/features/admin/appearance";
import { allAdminLinks } from "@/features/admin/navigation";
import { useMyPermissions } from "@/lib/adminAuth";
import { canVisitAdminPath, hasAdminPermission } from "@shared/adminAccess";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  FileTextIcon,
  PersonIcon,
  ImageIcon,
  LayersIcon,
  ReaderIcon,
  MixerHorizontalIcon,
  EnvelopeClosedIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { adminApiRequest } from "@/lib/adminAuth";
import { Skeleton } from "@/components/ui/skeleton";
interface Overview {
  team: { total: number; visible: number };
  practices: { total: number; visible: number };
  news: { total: number; visible: number };
  media: { total: number };
  unread: number;
  recent: {
    id: string;
    title: string;
    category: string;
    date: string;
    visible: boolean;
  }[];
}
const destinations = [
  [
    "/admin/content",
    "Páginas del sitio",
    "Portada, firma, oficina, contacto y textos legales",
    FileTextIcon,
  ],
  [
    "/admin/team",
    "Abogados y equipo",
    "Biografías, cargos, fotografías y visibilidad",
    PersonIcon,
  ],
  [
    "/admin/practice-groups",
    "Áreas de práctica",
    "Servicios, descripciones y profesionales",
    LayersIcon,
  ],
  [
    "/admin/media",
    "Imágenes, video y documentos",
    "Todo el material del sitio en una biblioteca",
    ImageIcon,
  ],
  [
    "/admin/news",
    "Monitor Laboral",
    "Publicaciones, borradores y contenido bilingüe",
    ReaderIcon,
  ],
] as const;
export default function AdminOverview() {
  const access=useQuery<{role:string;permissions:string[]}>({queryKey:["/api/admin/me"],queryFn:async()=>{const r=await adminApiRequest("GET","/api/admin/me");if(!r.ok)throw new Error("Sesión no disponible");return r.json();}});
  const query = useQuery<Overview>({
    queryKey: ["/api/admin/overview"],
    queryFn: async () => {
      const r = await adminApiRequest("GET", "/api/admin/overview");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    },
  });
  const d = query.data;
  const metrics = [
    {
      label: "Perfiles del equipo",
      value: d?.team.total,
      detail: d ? `${d.team.visible} visibles en el sitio` : "",
    },
    {
      label: "Áreas de práctica",
      value: d?.practices.visible,
      detail: d ? `${d.practices.total} registros en el catálogo` : "",
    },
    {
      label: "Publicaciones",
      value: d?.news.total,
      detail: d ? `${d.news.visible} publicadas y vigentes` : "",
    },
    {
      label: "Archivos en biblioteca",
      value: d?.media.total,
      detail: "Imágenes, video y documentos",
    },
  ];
  return (
    <main className="admin-overview">
      <div className="admin-overview-heading">
        <div>
          <p className="admin-page-kicker">Santos & Saucedo</p>
          <h1>Panel de administración</h1>
          <p className="admin-page-description">
            Actualice el contenido de Santos &amp; Saucedo. Elija una sección
            para empezar.
          </p>
        </div>
        <Link href="/admin/news/new" className="admin-primary-link">
          <PlusIcon />
          Nueva publicación
        </Link>
      </div>
      {query.isError && (
        <div className="admin-error mt-6" role="alert">
          {query.error.message}{" "}
          <button
            onClick={() => void query.refetch()}
            className="underline ml-2"
          >
            Reintentar
          </button>
        </div>
      )}
      <section className="admin-metrics" aria-label="Estado del contenido">
        {metrics.map((m) => (
          <div className="admin-metric" key={m.label} data-tone={m.label === "Perfiles del equipo" ? "blue" : m.label === "Áreas de práctica" ? "teal" : m.label === "Publicaciones" ? "green" : "orange"}>
            <span className="admin-metric-label">{m.label}</span>
            {query.isLoading ? (
              <Skeleton className="h-9 w-16 my-3" />
            ) : (
              <strong className="admin-metric-value">{m.value ?? "—"}</strong>
            )}
            <span className="admin-metric-foot">
              {m.detail || "Datos no disponibles"}
            </span>
          </div>
        ))}
      </section>
      <section className="my-8 grid gap-6 lg:grid-cols-[minmax(250px,.7fr)_minmax(0,1.3fr)]"><div>{hasAdminPermission(access.data,"advanced")?<AiUsageCard/>:<p className="border bg-white p-5">Use los accesos disponibles para su función.</p>}</div><div className="border bg-white p-6"><h2 className="text-xl font-semibold mb-5">Creación con IA y accesos</h2><div className="grid sm:grid-cols-2 gap-3">{allAdminLinks.filter(item=>['/admin/agents','/admin/presentations','/admin/generated-images','/admin/generated-audio','/admin/users','/admin/integrations','/admin/cookie-consent'].includes(item.href)&&canVisitAdminPath(access.data,item.href)).map(item=><Link key={item.href} href={item.href} className="admin-shortcut border p-4" data-tone={adminLinkTone(item.href, item.href.includes("users") || item.href.includes("integrations") || item.href.includes("cookie-consent") ? "amber" : "teal")}><span className="admin-shortcut-icon"><item.icon /></span><strong>{item.label}</strong><span className="block text-sm text-muted-foreground mt-1">{item.hint}</span></Link>)}</div></div></section>
      <div className="admin-overview-grid">
        <section>
          <div className="admin-section-heading">
            <h2>¿Qué necesita editar?</h2>
            <Link href="/admin/content">Ver todas las secciones</Link>
          </div>
          <div className="admin-edit-pages">
            {destinations.map(([href, label, description, Icon]) => (
              <Link href={href} key={href} className="admin-edit-page">
                <span className="admin-edit-page-icon">
                  <Icon />
                </span>
                <div>
                  <strong>{label}</strong>
                  <p>{description}</p>
                </div>
                <ChevronRightIcon />
              </Link>
            ))}
          </div>
        </section>
        <aside>
          <div className="admin-section-heading">
            <h2>Para tener a la mano</h2>
          </div>
          <div className="admin-side-note">
            <ImageIcon />
            <h3>Una biblioteca para todo.</h3>
            <p>
              Suba una imagen una vez y reutilícela en las páginas,
              publicaciones y perfiles. Reemplazar una referencia conserva el
              archivo anterior.
            </p>
            <Link href="/admin/media">
              Abrir biblioteca <ArrowRightIcon />
            </Link>
          </div>
          <div className="admin-quick-links">
            <Link href="/admin/order">
              <MixerHorizontalIcon />
              Ordenar abogados y contenido
              <ChevronRightIcon />
            </Link>
            <Link href="/admin/inbox">
              <EnvelopeClosedIcon />
              {d?.unread
                ? `${d.unread} mensajes sin leer`
                : "Mensajes y suscripciones"}
              <ChevronRightIcon />
            </Link>
            <Link href="/admin/manual">
              <FileTextIcon />
              Guía de uso del panel
              <ChevronRightIcon />
            </Link>
          </div>
        </aside>
      </div>
      <section className="admin-recent">
        <div className="admin-section-heading">
          <h2>Últimas publicaciones del catálogo</h2>
          <Link href="/admin/news">Abrir Monitor Laboral</Link>
        </div>
        {query.isLoading ? (
          <div className="space-y-5 py-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : d?.recent.length ? (
          d.recent.map((n) => (
            <article className="admin-recent-row" key={n.id}>
              <div>
                <strong>{n.title}</strong>
                <p>
                  {n.category}
                  {n.date
                    ? ` · ${new Date(n.date).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`
                    : ""}
                </p>
              </div>
              <span className={`admin-status ${n.visible ? "is-live" : ""}`}>
                {n.visible ? "Publicada" : "Borrador"}
              </span>
              <Link href={`/admin/news/${n.id}/edit`}>Editar</Link>
            </article>
          ))
        ) : (
          <div className="admin-empty">
            {query.isError
              ? "El catálogo no está disponible."
              : "Aún no hay publicaciones. Cree la primera entrada del Monitor Laboral."}
          </div>
        )}
      </section>
    </main>
  );
}
