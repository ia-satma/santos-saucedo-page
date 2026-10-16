import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
  ExternalLinkIcon,
  ExitIcon,
  HamburgerMenuIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { useAdminAuth, adminApiRequest } from "@/lib/adminAuth";
import { useCmsMedia } from "@/lib/cmsMedia";
import { AdminLanguageScope } from "@/contexts/LanguageContext";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { adminNavigation, allAdminLinks, activeAdminLink } from "./navigation";
import {
  adminRoleLabels,
  canVisitAdminPath,
  isReadOnlyAdmin,
  type AccessUser,
} from "@shared/adminAccess";
import { adminLinkTone } from "./appearance";
import "./admin.css";

export function AdminShell({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  const { isAuthenticated, isLoading, requireAuth, logout } = useAdminAuth();
  const media = useCmsMedia();
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("ss-admin-open-groups");
      return new Set(
        saved ? JSON.parse(saved) : adminNavigation.map((g) => g.id),
      );
    } catch {
      return new Set(adminNavigation.map((g) => g.id));
    }
  });
  const toggleGroup = (id: string) =>
    setExpanded((old) => {
      const next = new Set(old);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem(
          "ss-admin-open-groups",
          JSON.stringify(Array.from(next)),
        );
      } catch {}
      return next;
    });
  useEffect(() => {
    const active = activeAdminLink(path);
    const group = adminNavigation.find((g) =>
      g.items.some((i) => i.href === active?.href),
    );
    if (group) setExpanded((old) => new Set(Array.from(old).concat(group.id)));
  }, [path]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const me = useQuery<AccessUser>({
    queryKey: ["/api/admin/me"],
    enabled: isAuthenticated,
    staleTime: 60000,
    queryFn: async () => {
      const r = await adminApiRequest("GET", "/api/admin/me");
      if (!r.ok) throw new Error("Sesión no disponible");
      return r.json();
    },
  });
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);
  useEffect(() => {
    setMobile(false);
    setSearchOpen(false);
  }, [path]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const active = activeAdminLink(path);
  const activeGroup = adminNavigation.find(g => g.items.some(i => i.href === active?.href));
  const pageTone = adminLinkTone(active?.href || path, activeGroup?.tone);
  const signOut = async () => {
    if (!window.confirm("¿Cerrar la sesión del panel?")) return;
    try {
      await adminApiRequest("POST", "/api/admin/logout", {});
    } finally {
      logout();
    }
  };
  const navigation = (
    <>
      <Link
        href="/admin/dashboard"
        className="admin-brand"
        aria-label="Santos y Saucedo, resumen del panel"
      >
        <img src={media.brand.logoDark} alt="Santos & Saucedo" />
        <span>Administración del sitio</span>
      </Link>
      <button
        type="button"
        className="admin-sidebar-search"
        onClick={() => setSearchOpen(true)}
      >
        <MagnifyingGlassIcon />
        <span>¿Qué quiere hacer?</span>
        <kbd>⌘ K</kbd>
      </button>
      <nav
        aria-label="Navegación de administración"
        className="admin-navigation"
      >
        {adminNavigation.map((group) => {
          const visibleItems = group.items.filter((item) =>
            canVisitAdminPath(me.data, item.href),
          );
          if (!visibleItems.length) return null;
          const items = (
            <ul>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const selected = active?.href === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`admin-nav-link ${selected ? "is-active" : ""}`}
                      data-tone={adminLinkTone(item.href, group.tone)}
                      aria-current={selected ? "page" : undefined}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          );
          return (
            <section key={group.id} className="admin-nav-group" data-tone={group.tone}>
              <button
                type="button"
                className="admin-nav-group-heading"
                aria-expanded={expanded.has(group.id)}
                onClick={() => toggleGroup(group.id)}
              >
                <span className="admin-group-name"><span className="admin-group-dot" aria-hidden="true" />{group.label}</span>
                <ChevronRightIcon
                  className={expanded.has(group.id) ? "rotate-90" : ""}
                />
              </button>
              {expanded.has(group.id) && (
                <>
                  {group.description && (
                    <p className="admin-nav-group-description">
                      {group.description}
                    </p>
                  )}
                  {items}
                </>
              )}
            </section>
          );
        })}
      </nav>
      <div className="admin-sidebar-foot">
        <span className="admin-account-mark">SS</span>
        <div>
          <strong>Equipo editorial</strong>
          <span>
            {adminRoleLabels[me.data?.role || ""] || "Sesión de administración"}
          </span>
        </div>
        <button
          onClick={() => void signOut()}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <ExitIcon />
        </button>
      </div>
    </>
  );
  if (isLoading || me.isLoading)
    return (
      <div className="admin-shell">
        <div className="admin-loading">Cargando el espacio de trabajo…</div>
      </div>
    );
  if (!isAuthenticated) return null;
  const matches = allAdminLinks.filter(
    (x) =>
      canVisitAdminPath(me.data, x.href) &&
      `${x.label} ${x.hint}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .includes(
          search
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase(),
        ),
  );
  return (
    <div className="admin-shell" data-tone={pageTone}>
      <a className="admin-skip" href="#admin-main">
        Saltar al contenido
      </a>
      <aside className="admin-sidebar">{navigation}</aside>
      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="admin-mobile-panel p-0" data-tone={pageTone}>
          <SheetTitle className="sr-only">Navegación del panel</SheetTitle>
          <SheetDescription className="sr-only">
            Secciones de administración del sitio
          </SheetDescription>
          {navigation}
        </SheetContent>
      </Sheet>
      <div className="admin-main-column">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <button
              className="admin-mobile-trigger"
              aria-label="Abrir navegación"
              onClick={() => setMobile(true)}
            >
              <HamburgerMenuIcon />
            </button>
            <span>Panel</span>
            <ChevronRightIcon />
            <strong>{active?.label || "Contenido del sitio"}</strong>
          </div>
          <div className="admin-top-actions">
            <button
              className="admin-search-trigger"
              aria-label="Buscar sección"
              onClick={() => setSearchOpen(true)}
            >
              <MagnifyingGlassIcon />
              <span>Buscar sección</span>
              <kbd>⌘ K</kbd>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-view-site"
            >
              Ver sitio <ExternalLinkIcon />
            </a>
          </div>
        </header>
        <div className="admin-workspace" id="admin-main" tabIndex={-1}>
          {me.data && isReadOnlyAdmin(me.data) && (
            <p className="admin-users-notice mx-6 mt-6" role="status">
              Modo consulta: puede revisar las secciones habilitadas. Su cuenta
              no permite guardar cambios ni ejecutar procesos.
            </p>
          )}
          <AdminLanguageScope>
            {canVisitAdminPath(me.data, path) ? (
              children
            ) : (
              <main className="admin-management-page">
                <h1>Acceso restringido</h1>
                <p>
                  Su cuenta no tiene permiso para esta sección. Solicite acceso
                  al administrador principal.
                </p>
                <Link href="/admin/dashboard">Volver al resumen</Link>
              </main>
            )}
          </AdminLanguageScope>
        </div>
        <footer className="admin-workspace-footer">
          <span>Santos &amp; Saucedo · Gestión de contenido</span>
          <span>Los cambios de contenido se aplican al guardar.</span>
        </footer>
      </div>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="admin-search-dialog">
          <DialogTitle>Encontrar una sección</DialogTitle>
          <DialogDescription>
            Busque por lo que necesita editar.
          </DialogDescription>
          <label className="sr-only" htmlFor="admin-search">
            Buscar sección
          </label>
          <input
            id="admin-search"
            autoFocus
            placeholder="Por ejemplo: abogados, fotos, contacto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          <div className="admin-search-results">
            {matches.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                onClick={() => setSearchOpen(false)}
              >
                <item.icon />
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </div>
                <ChevronRightIcon />
              </Link>
            ))}
            {!matches.length && (
              <p>No encontramos una sección con ese nombre.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
