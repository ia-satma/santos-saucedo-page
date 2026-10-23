import { useState } from "react";
import { Link } from "wouter";
import { formatNewsDate } from "@/lib/newsDate";
import { selectHomeMonitorItems, getHomeMonitorImage } from "@shared/monitorEditorial";
import type { News } from "@shared/schema";
import type { Lang26 } from "@/components/home26/content";

type Props = {
  items: News[];
  language: Lang26;
  limit?: number;
  isLoading?: boolean;
  isError?: boolean;
};

const COPY = {
  es: {
    loading: "Cargando publicaciones…",
    error: "No fue posible cargar las publicaciones.",
    empty: "Aún no hay publicaciones.",
    imageUnavailable: "Imagen no disponible",
    category: { press: "Prensa", insights: "Análisis", rankings: "Rankings", events: "Eventos", alerts: "Alertas" } as Record<string, string>,
  },
  en: {
    loading: "Loading publications…",
    error: "The publications could not be loaded.",
    empty: "There are no publications yet.",
    imageUnavailable: "Image unavailable",
    category: { press: "Press", insights: "Insights", rankings: "Rankings", events: "Events", alerts: "Alerts" } as Record<string, string>,
  },
};

function categoryFor(item: News, language: Lang26) {
  if (!item.category) return null;
  return COPY[language].category[item.category] ||
    (language === "es" && item.categoryEs) ||
    item.category.charAt(0).toUpperCase() + item.category.slice(1);
}

function ArticleMeta({ item, language }: { item: News; language: Lang26 }) {
  const category = categoryFor(item, language);
  const date = formatNewsDate(item.date, language);
  return (
    <p className="ss-label flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] tracking-[0.1em] text-ss-medio">
      {category && <span className="text-ss-marino">{category}</span>}
      {category && date && <span aria-hidden="true" className="text-ss-claro">·</span>}
      {date && (
        <time dateTime={item.date ? new Date(item.date).toISOString() : undefined} className="font-normal tracking-[0.06em]">
          {date}
        </time>
      )}
    </p>
  );
}

function ArticleImage({ item, featured, label }: { item: News; featured: boolean; label: string }) {
  const [failed, setFailed] = useState(false);
  const image = getHomeMonitorImage(item);
  if (!image || failed) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-end border-l-2 border-ss-rule bg-ss-paper p-5 ${featured ? "min-h-[128px]" : "min-h-[96px]"}`}
      >
        <span className="ss-label text-[10px] tracking-[0.12em] text-ss-medio">{label}</span>
      </div>
    );
  }
  return (
    <img
      src={image}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      width={1024}
      height={1024}
      className={`block h-full min-h-[180px] w-full object-cover object-[50%_40%] transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.015] motion-reduce:transition-none ${
        featured ? "aspect-[16/9] md:aspect-[1.62/1]" : "aspect-[16/9]"
      }`}
    />
  );
}

function ArticleCard({ item, language, featured }: { item: News; language: Lang26; featured: boolean }) {
  const title = language === "es" ? item.titleEs || item.title : item.title;
  const excerpt = language === "es" ? item.excerptEs || item.excerpt : item.excerpt;
  const fallback = COPY[language].imageUnavailable;

  return (
    <article
      data-testid={`home-monitor-card-${item.slug}`}
      data-featured={featured}
      className={`group min-w-0 ${featured ? "" : "border-t border-ss-rule pt-5 first:border-t-0 first:pt-0 md:pt-6 md:first:pt-0"}`}
    >
      <Link
        href={`/news/${item.slug}`}
        aria-label={title}
        className="inline-link block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ss-marino"
      >
        <div className={`overflow-hidden bg-ss-paper ${featured ? "rounded-[10px]" : "rounded-[8px]"}`}>
          <ArticleImage key={getHomeMonitorImage(item)} item={item} featured={featured} label={fallback} />
        </div>
        <div className={featured ? "pt-5 md:pt-7" : "pt-4"}>
          <ArticleMeta item={item} language={language} />
          <h3 className={`ss-display mt-3 break-words text-ss-marino decoration-1 underline-offset-[5px] group-hover:underline group-focus-visible:underline ${
            featured
              ? "max-w-[34ch] text-[clamp(28px,2.7vw,40px)] leading-[1.12] tracking-[-0.02em]"
              : "text-[clamp(22px,1.8vw,27px)] leading-[1.18] tracking-[-0.015em]"
          }`}>
            {title}
          </h3>
          {excerpt && (
            <p className={`mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] leading-6 text-ss-tinta ${
              featured ? "max-w-[64ch] md:mt-4 md:text-[16px]" : "max-w-[54ch]"
            }`}>
              {excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

export function MonitorEditorial({ items, language, limit = 3, isLoading = false, isError = false }: Props) {
  const selected = selectHomeMonitorItems(items, limit);
  const copy = COPY[language];

  if (isLoading && !isError) {
    return (
      <div role="status" aria-live="polite" aria-label={copy.loading} className="mt-12 grid gap-8 md:mt-14 md:grid-cols-[1.55fr_0.85fr] md:gap-10">
        <div aria-hidden="true">
          <div className="aspect-[16/9] rounded-[10px] bg-ss-paper" />
          <div className="mt-6 h-3 w-32 bg-ss-paper" />
          <div className="mt-5 h-10 max-w-xl bg-ss-paper" />
          <div className="mt-3 h-4 max-w-sm bg-ss-paper" />
        </div>
        <div aria-hidden="true" className="space-y-8">
          {[0, 1].map((slot) => (
            <div key={slot} className="border-t border-ss-rule pt-6">
              <div className="aspect-[16/9] bg-ss-paper" />
              <div className="mt-5 h-3 w-28 bg-ss-paper" />
              <div className="mt-4 h-7 max-w-sm bg-ss-paper" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <p role="status" className="mt-12 border-t border-ss-rule py-8 text-[15px] text-ss-medio">{copy.error}</p>;
  }

  if (selected.length === 0) {
    return <p role="status" className="mt-12 border-t border-ss-rule py-8 text-[15px] text-ss-medio">{copy.empty}</p>;
  }

  const [lead, ...secondary] = selected;
  return (
    <div
      data-testid="home-monitor-stories"
      className={`mt-12 grid grid-cols-1 items-start gap-10 md:mt-14 md:gap-10 lg:gap-14 ${secondary.length > 0 ? "md:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.85fr)]" : ""}`}
    >
      <ArticleCard item={lead} language={language} featured />
      {secondary.length > 0 && (
        <div className="grid grid-cols-1 gap-8 md:gap-7">
          {secondary.map((item) => <ArticleCard key={item.id} item={item} language={language} featured={false} />)}
        </div>
      )}
    </div>
  );
}

export default MonitorEditorial;
