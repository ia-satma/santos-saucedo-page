import { useState } from "react";
import { MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { Eyebrow } from "@/components/editorial";
import { TextLink } from "@/components/home26/primitives";
import { isNativeLanguage } from "@/lib/translationUtils";
import type { Event } from "@shared/schema";
import { eventTypes } from "@shared/schema";

const getEventTypeLabel = (eventType: string, language: string): string => {
  const type = eventTypes.find(t => t.value === eventType);
  if (!type) return eventType;
  const langKey = language as keyof typeof type;
  return (type[langKey] as string) || type.en;
};

interface EventCardProps {
  event: Event;
  language: string;
  isUpcoming: boolean;
  formatDate: (date: string | Date | null) => string;
  t: {
    past: string;
    learnMore: string;
  };
}

function EventCard({ event, language, isUpcoming, formatDate, t }: EventCardProps) {
  const { translatedFields, isTranslating } = useTranslatedContent({
    contentType: 'event',
    entityId: String(event.id),
    fields: {
      title: event.title,
      titleEs: event.titleEs,
      description: event.description,
      descriptionEs: event.descriptionEs,
      location: event.location,
      locationEs: event.locationEs,
    },
    enabled: !isNativeLanguage(language),
  });

  const displayTitle = translatedFields.title || event.title;
  const displayDescription = translatedFields.description || event.description;
  const displayLocation = translatedFields.location || event.location;

  return (
    <Card
      className={`group h-full overflow-hidden transition-all duration-300 cursor-pointer ${
        isUpcoming ? '' : 'opacity-80'
      }`}
      data-testid={`card-event-${event.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <Badge 
            variant="outline"
            data-testid={`badge-event-type-${event.id}`}
          >
            {getEventTypeLabel(event.eventType || 'conference', language)}
          </Badge>
          {!isUpcoming && (
            <Badge 
              variant="outline"
              className="text-ss-medio"
              data-testid={`badge-event-past-${event.id}`}
            >
              {t.past}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span data-testid={`text-event-date-${event.id}`}>
            {formatDate(event.date)}
          </span>
        </div>
        
        <h3 
          className={`font-heading font-normal text[25px] leading-[1.25] tracking-[-0.01em] text-ss-marino mb-3 group-hover:underline decoration-1 underline-offset-4 line-clamp-2 ${isTranslating ? 'opacity-70' : ''}`}
          data-testid={`text-event-title-${event.id}`}
        >
          {displayTitle}
        </h3>
        
        {displayLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span data-testid={`text-event-location-${event.id}`}>
              {displayLocation}
            </span>
          </div>
        )}
        
        <p 
          className={`text-ss-tinta text-base leading-relaxed line-clamp-3 mb-4 ${isTranslating ? 'opacity-70' : ''}`}
          data-testid={`text-event-description-${event.id}`}
        >
          {displayDescription}
        </p>
        
        {event.externalUrl && (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-ss-marino font-semibold text[17px] underline decoration-ss-rule underline-offset-4 hover:decoration-ss-marino"
            data-testid={`link-event-learn-more-${event.id}`}
          >
            {t.learnMore}
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export default function EventsPage() {
  const { language } = useLanguage();
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const content: Record<string, {
    title: string;
    subtitle: string;
    errorMessage: string;
    noResults: string;
    learnMore: string;
    all: string;
    upcoming: string;
    past: string;
    register: string;
    /** Frase completa, con su punto ("。" en chino y japonés) */
    noEvents: string;
    /** Enlace a la publicación: la etiqueta del menú en cada idioma (sin "insights") */
    monitorLink: string;
  }> = {
    en: {
      title: "Events",
      subtitle: "Upcoming and past events of the firm",
      errorMessage: "Failed to load events",
      noResults: "No events match your filter",
      learnMore: "Learn more",
      all: "All",
      upcoming: "Upcoming",
      past: "Past",
      register: "Register",
      noEvents: "No events scheduled.",
      monitorLink: "Labor Monitor",
    },
    es: {
      title: "Eventos",
      subtitle: "Próximos eventos y eventos anteriores de la firma",
      errorMessage: "Error al cargar los eventos",
      noResults: "No hay eventos que coincidan con su filtro",
      learnMore: "Más información",
      all: "Todos",
      upcoming: "Próximos",
      past: "Pasados",
      register: "Registrarse",
      noEvents: "No hay eventos programados.",
      monitorLink: "Monitor Laboral",
    },
    de: {
      title: "Veranstaltungen",
      subtitle: "Kommende und vergangene Veranstaltungen",
      errorMessage: "Fehler beim Laden der Veranstaltungen",
      noResults: "Keine Veranstaltungen entsprechen Ihrem Filter",
      learnMore: "Mehr erfahren",
      all: "Alle",
      upcoming: "Kommende Veranstaltungen",
      past: "Vergangene Veranstaltungen",
      register: "Anmelden",
      noEvents: "Keine Veranstaltungen geplant.",
      monitorLink: "Nachrichten",
    },
    zh: {
      title: "活动",
      subtitle: "即将举行和过去的活动",
      errorMessage: "加载活动失败",
      noResults: "没有符合筛选条件的活动",
      learnMore: "了解更多",
      all: "全部",
      upcoming: "即将举行的活动",
      past: "过往活动",
      register: "注册",
      noEvents: "暂无活动。",
      monitorLink: "新闻",
    },
    ko: {
      title: "이벤트",
      subtitle: "예정된 행사 및 지난 행사",
      errorMessage: "이벤트 로드 실패",
      noResults: "필터와 일치하는 이벤트가 없습니다",
      learnMore: "자세히 보기",
      all: "전체",
      upcoming: "예정된 이벤트",
      past: "지난 이벤트",
      register: "등록",
      noEvents: "예정된 이벤트가 없습니다.",
      monitorLink: "뉴스",
    },
    ja: {
      title: "イベント",
      subtitle: "今後のイベントと過去のイベント",
      errorMessage: "イベントの読み込みに失敗しました",
      noResults: "フィルターに一致するイベントがありません",
      learnMore: "詳細を見る",
      all: "すべて",
      upcoming: "今後のイベント",
      past: "過去のイベント",
      register: "登録",
      noEvents: "予定されているイベントはありません。",
      monitorLink: "ニュース",
    },
    ar: {
      title: "الفعاليات",
      subtitle: "الفعاليات القادمة والسابقة",
      errorMessage: "فشل في تحميل الفعاليات",
      noResults: "لا توجد فعاليات تطابق الفلتر",
      learnMore: "اعرف المزيد",
      all: "الكل",
      upcoming: "الفعاليات القادمة",
      past: "الفعاليات السابقة",
      register: "سجّل",
      noEvents: "لا توجد فعاليات مجدولة.",
      monitorLink: "الأخبار",
    },
    ru: {
      title: "Мероприятия",
      subtitle: "Предстоящие и прошедшие мероприятия",
      errorMessage: "Не удалось загрузить мероприятия",
      noResults: "Нет мероприятий, соответствующих фильтру",
      learnMore: "Подробнее",
      all: "Все",
      upcoming: "Предстоящие",
      past: "Прошедшие",
      register: "Зарегистрироваться",
      noEvents: "Нет мероприятий.",
      monitorLink: "Новости",
    },
    fr: {
      title: "Événements",
      subtitle: "Événements à venir et passés",
      errorMessage: "Échec du chargement des événements",
      noResults: "Aucun événement ne correspond à votre filtre",
      learnMore: "En savoir plus",
      all: "Tous",
      upcoming: "À venir",
      past: "Passés",
      register: "S’inscrire",
      noEvents: "Aucun événement prévu.",
      monitorLink: "Actualités",
    },
    it: {
      title: "Eventi",
      subtitle: "Eventi in programma e passati",
      errorMessage: "Impossibile caricare gli eventi",
      noResults: "Nessun evento corrisponde al filtro",
      learnMore: "Scopri di più",
      all: "Tutti",
      upcoming: "Prossimi eventi",
      past: "Eventi passati",
      register: "Registrati",
      noEvents: "Nessun evento.",
      monitorLink: "Notizie",
    },
  };

  const t = content[language] || content.en;

  const typeFilters = [
    { value: "all", en: "All", es: "Todos" },
    ...eventTypes,
  ];

  const filteredEvents = events?.filter(event => {
    if (selectedType === "all") return true;
    return event.eventType === selectedType;
  }).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-MX',
      de: 'de-DE',
      zh: 'zh-CN',
      ko: 'ko-KR',
      ja: 'ja-JP',
      ar: 'ar-SA',
      ru: 'ru-RU',
      fr: 'fr-FR',
      it: 'it-IT',
    };
    return d.toLocaleDateString(localeMap[language] || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (date: string | Date | null): boolean => {
    if (!date) return false;
    return new Date(date) > new Date();
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-events">
      <SEOHead page="events" language={language} />
      <Header />
      
      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-events-hero">
        <div className="ss-container">
          <div className="max-w-3xl">
            <Eyebrow num="04" tone="navy" className="mb-6" />
            <h1 
              className="mb-5"
              data-testid="text-events-title"
            >
              {t.title}
            </h1>
            <p data-testid="text-events-subtitle">
              {t.subtitle}
            </p>
          </div>
        </div>
      </section>

      <div className="py-16 lg:py-20">
        <div className="ss-container">
          {/* Filtros solo si hay eventos: seis botones sobre una lista vacía parecen una plantilla sin llenar */}
          {events && events.length > 0 && (
          <div className="mb-10">
            {/* Filtros: botones de contorno de 44 px (el Azul Marino lleno queda para enviar
                formularios); el activo, con filete Azul Marino y aria-pressed. Etiquetas en el
                idioma de la página. */}
            <div className="flex flex-wrap items-center gap-2" data-testid="container-type-filters">
              {typeFilters.map((type) => (
                <Button
                  key={type.value}
                  variant="outline"
                  aria-pressed={selectedType === type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`min-h-[44px] px-4 transition-colors ${
                    selectedType === type.value 
                      ? "border-ss-marino text-ss-marino" 
                      : "border-ss-rule text-ss-tinta hover:border-ss-marino"
                  }`}
                  data-testid={`button-filter-${type.value}`}
                >
                  {type.value === "all" ? t.all : getEventTypeLabel(type.value, language)}
                </Button>
              ))}
            </div>
          </div>
          )}

          {error ? (
            <div className="border-t border-ss-rule pt-6" data-testid="container-events-error">
              <p className="text-base text-ss-tinta" data-testid="text-events-error">
                {t.errorMessage}
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={i}
                  className="overflow-hidden"
                  data-testid={`skeleton-event-${i}`}
                >
                  <CardContent className="p-6">
                    <Skeleton className="h-5 w-24 mb-4" />
                    <Skeleton className="h-4 w-32 mb-3" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents && filteredEvents.length === 0 ? (
            /* Vacío: una línea en la sans, al inicio, sin icono. Sin eventos en absoluto, "No hay
               eventos programados" y el enlace al Monitor; si solo el filtro no da resultados, noResults. */
            <div className="border-t border-ss-rule pt-6" data-testid="container-events-empty">
              <p className="text-base text-ss-tinta mb-4" data-testid="text-events-empty">
                {events && events.length > 0 ? t.noResults : t.noEvents}
              </p>
              {(!events || events.length === 0) && (
                <TextLink href="/news">{t.monitorLink}</TextLink>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents?.map((event) => (
                <div key={event.id}>
                  <EventCard
                    event={event}
                    language={language}
                    isUpcoming={isUpcoming(event.date)}
                    formatDate={formatDate}
                    t={{ past: t.past, learnMore: t.learnMore }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
