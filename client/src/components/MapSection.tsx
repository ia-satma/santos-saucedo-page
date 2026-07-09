import { motion } from "framer-motion";
import { MapPin, Phone, Mail, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { SiteContent } from "@shared/schema";

type SupportedLanguage = "en" | "es" | "de" | "zh" | "ko" | "ja" | "ar" | "ru" | "fr" | "it";

interface MapSectionProps {
  language: string;
}

export default function MapSection({ language }: MapSectionProps) {
  const { data: siteContent, isLoading, error } = useQuery<SiteContent>({
    queryKey: ["/api/site-content"],
  });

  const content: Record<SupportedLanguage, {
    eyebrow: string;
    title: string;
    subtitle: string;
    building: string;
    street: string;
    access: string;
    city: string;
    addressLabel: string;
    phoneLabel: string;
    phone: string;
    emailLabel: string;
    email: string;
    directions: string;
    viewMap: string;
    officeHours: string;
    errorMessage: string;
    mapTitle: string;
  }> = {
    en: {
      eyebrow: "LOCATION",
      title: siteContent?.locationTitle || "Our Location",
      subtitle: "Visit Us",
      building: "Río Tamazunchale 205 Norte",
      street: "San Pedro Garza García, N.L.",
      access: "Access via Arquímedes No. 10",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "Address",
      phoneLabel: "Phone",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "Email",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "Get Directions",
      viewMap: "View on Map",
      officeHours: "Office Hours",
      errorMessage: "Failed to load location information",
      mapTitle: "Santos & Saucedo Location",
    },
    es: {
      eyebrow: "UBICACIÓN",
      title: "Nuestra Ubicación",
      subtitle: "Visítenos",
      building: "Río Tamazunchale 205 Norte",
      street: "San Pedro Garza García, N.L.",
      access: "Acceso por Arquímedes N.° 10",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "Dirección",
      phoneLabel: "Teléfono",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "Correo electrónico",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "Obtener Direcciones",
      viewMap: "Ver en el mapa",
      officeHours: "Horario de atención",
      errorMessage: "Error al cargar información de ubicación",
      mapTitle: "Ubicación de Santos & Saucedo",
    },
    de: {
      eyebrow: "STANDORT",
      title: "Unser Standort",
      subtitle: "Besuchen Sie uns",
      building: "Río Tamazunchale 205 Norte",
      street: "San Pedro Garza García, N.L.",
      access: "Zugang über Arquímedes Nr. 10",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "Adresse",
      phoneLabel: "Telefon",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "E-Mail",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "Wegbeschreibung",
      viewMap: "Auf Karte anzeigen",
      officeHours: "Öffnungszeiten",
      errorMessage: "Standortinformationen konnten nicht geladen werden",
      mapTitle: "Standort von Santos & Saucedo",
    },
    zh: {
      eyebrow: "位置",
      title: "我们的位置",
      subtitle: "欢迎拜访",
      building: "Río Tamazunchale 205 Norte 18楼",
      street: "San Pedro Garza García, N.L.",
      access: "通过Arquímedes No. 10进入",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "地址",
      phoneLabel: "电话",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "电子邮件",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "获取路线",
      viewMap: "在地图上查看",
      officeHours: "办公时间",
      errorMessage: "无法加载位置信息",
      mapTitle: "Santos & Saucedo 位置",
    },
    ko: {
      eyebrow: "위치",
      title: "위치",
      subtitle: "방문해 주세요",
      building: "Río Tamazunchale 205 Norte 18층",
      street: "San Pedro Garza García, N.L.",
      access: "Arquímedes No. 10을 통해 출입",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "주소",
      phoneLabel: "전화",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "이메일",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "길찾기",
      viewMap: "지도에서 보기",
      officeHours: "업무 시간",
      errorMessage: "위치 정보를 불러오지 못했습니다",
      mapTitle: "Santos & Saucedo 위치",
    },
    ja: {
      eyebrow: "所在地",
      title: "所在地",
      subtitle: "お越しください",
      building: "Río Tamazunchale 205 Norte 18階",
      street: "San Pedro Garza García, N.L.",
      access: "Arquímedes No. 10からアクセス",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "住所",
      phoneLabel: "電話",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "メール",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "道順を見る",
      viewMap: "地図で見る",
      officeHours: "営業時間",
      errorMessage: "位置情報の読み込みに失敗しました",
      mapTitle: "Santos & Saucedo の所在地",
    },
    ar: {
      eyebrow: "الموقع",
      title: "موقعنا",
      subtitle: "قم بزيارتنا",
      building: "Río Tamazunchale 205 Norte",
      street: "San Pedro Garza García, N.L.",
      access: "الدخول عبر Arquímedes رقم 10",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "العنوان",
      phoneLabel: "الهاتف",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "البريد الإلكتروني",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "الحصول على الاتجاهات",
      viewMap: "عرض على الخريطة",
      officeHours: "ساعات العمل",
      errorMessage: "فشل في تحميل معلومات الموقع",
      mapTitle: "موقع Santos & Saucedo",
    },
    ru: {
      eyebrow: "МЕСТОПОЛОЖЕНИЕ",
      title: "Наше местоположение",
      subtitle: "Посетите нас",
      building: "Río Tamazunchale 205 Norte",
      street: "San Pedro Garza García, N.L.",
      access: "Вход через Arquímedes № 10",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "Адрес",
      phoneLabel: "Телефон",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "Эл. почта",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "Проложить маршрут",
      viewMap: "Показать на карте",
      officeHours: "Часы работы",
      errorMessage: "Не удалось загрузить информацию о местоположении",
      mapTitle: "Местоположение Santos & Saucedo",
    },
    fr: {
      eyebrow: "LOCALISATION",
      title: "Notre emplacement",
      subtitle: "Rendez-nous visite",
      building: "Río Tamazunchale 205 Norte, 18e étage",
      street: "San Pedro Garza García, N.L.",
      access: "Accès par Arquímedes n° 10",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "Adresse",
      phoneLabel: "Téléphone",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "E-mail",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "Itinéraire",
      viewMap: "Voir sur la carte",
      officeHours: "Heures d'ouverture",
      errorMessage: "Impossible de charger les informations de localisation",
      mapTitle: "Emplacement de Santos & Saucedo",
    },
    it: {
      eyebrow: "SEDE",
      title: "La nostra sede",
      subtitle: "Vieni a trovarci",
      building: "Río Tamazunchale 205 Norte",
      street: "San Pedro Garza García, N.L.",
      access: "Accesso da Arquímedes n. 10",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      addressLabel: "Indirizzo",
      phoneLabel: "Telefono",
      phone: siteContent?.phone || "+52 81 8335 2086",
      emailLabel: "E-mail",
      email: siteContent?.email || "info@santossaucedo.com",
      directions: "Indicazioni stradali",
      viewMap: "Visualizza sulla mappa",
      officeHours: "Orari di apertura",
      errorMessage: "Impossibile caricare le informazioni sulla posizione",
      mapTitle: "Sede di Santos & Saucedo",
    },
  };

  const currentLang = (language in content ? language : "en") as SupportedLanguage;
  const t = {
    ...content[currentLang],
    building: "Río Tamazunchale 205 Norte",
    street: "Colonia Del Valle",
    access: "San Pedro Garza García, N.L.",
    city: "C.P. 66220, México",
  };

  const googleMapsUrl = "https://www.google.com/maps/dir//R%C3%ADo+Tamazunchale+205+Norte,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+M%C3%A9xico";
  const embedUrl = "https://www.google.com/maps?q=R%C3%ADo+Tamazunchale+205+Norte,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+M%C3%A9xico&output=embed";

  if (error) {
    return (
      <section id="location" className="py-20 lg:py-28 bg-muted" data-testid="section-location">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground" data-testid="text-location-error">{t.errorMessage}</p>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section id="location" className="py-20 lg:py-28 bg-muted" data-testid="section-location">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <Skeleton className="h-10 w-64 mx-auto mb-12" data-testid="skeleton-location-title" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            <Skeleton className="lg:col-span-3 aspect-[16/10] lg:min-h-[400px]" />
            <div className="lg:col-span-2">
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="location"
      className="py-20 lg:py-28 bg-muted"
      data-testid="section-location"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-px bg-primary mb-6 mx-auto" />
          <p
            className="text-primary text-[11px] tracking-[0.25em] uppercase mb-4"
            data-testid="text-location-eyebrow"
          >
            {t.eyebrow}
          </p>
          <h2
            className="font-heading font-light text-2xl md:text-3xl lg:text-4xl text-foreground uppercase tracking-[0.12em] leading-tight"
            data-testid="text-location-title"
          >
            {t.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 aspect-[16/10] lg:aspect-auto lg:min-h-[400px] rounded-none overflow-hidden shadow-lg"
          >
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t.mapTitle}
              data-testid="iframe-map"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col justify-center"
          >
            <div className="bg-background p-8 lg:p-10 shadow-sm" data-testid="card-contact-info">
              <div className="flex items-start gap-4 mb-8">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" data-testid="icon-location" />
                <div data-testid="text-address">
                  <p className="text-sm text-foreground font-medium mb-2">{t.addressLabel}</p>
                  <p className="text-sm text-muted-foreground">{t.building}</p>
                  <p className="text-sm text-muted-foreground">{t.street}</p>
                  <p className="text-sm text-muted-foreground">{t.access}</p>
                  <p className="text-sm text-muted-foreground">{t.city}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" data-testid="icon-phone" />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">{t.phoneLabel}</p>
                  <a
                    href={`tel:${t.phone.replace(/\s/g, "")}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid="link-phone"
                  >
                    {t.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-10">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" data-testid="icon-email" />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">{t.emailLabel}</p>
                  <a
                    href={`mailto:${t.email}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid="link-email"
                  >
                    {t.email}
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  variant="default"
                  className="w-full rounded-none"
                  data-testid="button-directions"
                >
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="w-4 h-4 mr-2" />
                    {t.directions}
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-none"
                  data-testid="button-view-map"
                >
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t.viewMap}
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
