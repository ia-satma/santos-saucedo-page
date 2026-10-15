import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";
import type { OfficeImage } from "@shared/schema";

// "Clásica": titulares en romana 400, Azul Marino, caja de oración y al inicio; texto en Gris Tinta.
const h2Class = "font-heading font-normal text-ss-marino text-[clamp(28px,2.6vw,38px)] leading-[1.12] tracking-[-0.012em] [text-wrap:balance]";
// Lista de datos de la oficina: filas con filete superior; etiqueta (dt) en la sans
// versal espaciada, Gris Medio; dato (dd) en la sans de 17 px, Gris Tinta.
const rowClass = "grid grid-cols-1 gap-y-1 border-t border-ss-rule py-4 sm:grid-cols-[11rem,1fr] sm:gap-x-6";
const dtClass = "ss-label text-ss-medio sm:pt-1";
const ddClass = "text-[17px] leading-[1.55] text-ss-tinta";
const ddLinkClass = "hover:text-ss-marino hover:underline underline-offset-4 transition-colors";
// La página solo da los datos que la firma publica (dirección, teléfono, correo, horario y mapa).
// Sin amenidades, salas, estacionamiento, transporte ni "puntos de referencia": nadie los
// confirmó y venían de la plantilla anterior.

interface OfficeContent {
  heroTitle: string;
  heroSubtitle: string;
  mainOfficeTitle: string;
  buildingName: string;
  floor: string;
  address: string;
  colony: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  addressLabel: string;
  phoneLabel: string;
  emailLabel: string;
  mapTitle: string;
  officeHoursTitle: string;
  officeHours: string;
  saturdayHours: string;
  getDirections: string;
  galleryTitle: string;
  contactCtaSubtitle: string;
  contactButton: string;
  teamLink: string;
  headquarters: string;
  viewOnMap: string;
}

export default function Offices() {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<OfficeImage | null>(null);

  const { data: officeImages, isLoading: imagesLoading } = useQuery<OfficeImage[]>({
    queryKey: ["/api/office-images"],
  });

  const content: Record<string, OfficeContent> = {
    en: {
      heroTitle: "Our Offices",
      heroSubtitle: "Our office is in San Pedro Garza García, Nuevo León.",
      mainOfficeTitle: "Main Office in San Pedro Garza García",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "Map of the Santos & Saucedo office in San Pedro Garza García",
      emailLabel: "Email",
      phoneLabel: "Telephone",
      addressLabel: "Address",
      officeHoursTitle: "Office Hours",
      officeHours: "Monday to Friday, 9:00–19:00",
      saturdayHours: "Saturday and Sunday: closed",
      getDirections: "Get Directions",
      galleryTitle: "Office Gallery",
      contactCtaSubtitle: "Each partner's contact details appear on their profile.",
      contactButton: "Contact",
      teamLink: "Partners",
      headquarters: "Headquarters",
      viewOnMap: "View on Map",
    },
    es: {
      heroTitle: "Nuestras oficinas",
      heroSubtitle: "Nuestra oficina está en San Pedro Garza García, Nuevo León.",
      mainOfficeTitle: "Oficina principal en San Pedro Garza García",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, C.P. 66220, México",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "Mapa de la oficina de Santos & Saucedo en San Pedro Garza García",
      emailLabel: "Correo electrónico",
      phoneLabel: "Teléfono",
      addressLabel: "Dirección",
      officeHoursTitle: "Horario de oficina",
      officeHours: "Lunes a viernes, 9:00–19:00 h",
      saturdayHours: "Sábado y domingo: cerrado",
      getDirections: "Cómo llegar",
      galleryTitle: "Galería de oficinas",
      contactCtaSubtitle: "Los datos de contacto de cada socio aparecen en su ficha.",
      contactButton: "Contacto",
      teamLink: "Socios",
      headquarters: "Sede central",
      viewOnMap: "Ver en el mapa",
    },
    de: {
      heroTitle: "Unsere Büros",
      heroSubtitle: "Unser Büro befindet sich in San Pedro Garza García, Nuevo León.",
      mainOfficeTitle: "Hauptsitz in San Pedro Garza García",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, Mexiko",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "Karte des Büros von Santos & Saucedo in San Pedro Garza García",
      emailLabel: "E-Mail",
      phoneLabel: "Telefon",
      addressLabel: "Adresse",
      officeHoursTitle: "Öffnungszeiten",
      officeHours: "Montag bis Freitag, 9:00–19:00 Uhr",
      saturdayHours: "Samstag und Sonntag: geschlossen",
      getDirections: "Anfahrt",
      galleryTitle: "Bürogalerie",
      contactCtaSubtitle: "Die Kontaktdaten der einzelnen Partner stehen in ihrem jeweiligen Profil.",
      contactButton: "Kontakt",
      teamLink: "Unser Team",
      headquarters: "Hauptsitz",
      viewOnMap: "Auf Karte anzeigen",
    },
    zh: {
      heroTitle: "我们的办公室",
      heroSubtitle: "我们的办公室位于新莱昂州圣佩德罗加尔萨加西亚（San Pedro Garza García）。",
      mainOfficeTitle: "圣佩德罗加尔萨加西亚总部",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "18层",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, México",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "Santos & Saucedo San Pedro Garza García 办公室地图",
      emailLabel: "电子邮件",
      phoneLabel: "电话",
      addressLabel: "地址",
      officeHoursTitle: "办公时间",
      officeHours: "周一至周五 9:00–19:00",
      saturdayHours: "周六、周日休息",
      getDirections: "获取路线",
      galleryTitle: "办公室图库",
      contactCtaSubtitle: "各合伙人的联系方式见其个人页面。",
      contactButton: "联系我们",
      teamLink: "我们的团队",
      headquarters: "总部",
      viewOnMap: "在地图上查看",
    },
    ko: {
      heroTitle: "사무실",
      heroSubtitle: "사무소는 누에보레온주 산페드로 가르사 가르시아(San Pedro Garza García)에 있습니다.",
      mainOfficeTitle: "산페드로 가르사 가르시아 본사",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "18층",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, México",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "San Pedro Garza García에 있는 Santos & Saucedo 사무소 지도",
      emailLabel: "이메일",
      phoneLabel: "전화",
      addressLabel: "주소",
      officeHoursTitle: "영업 시간",
      officeHours: "월요일–금요일 9:00–19:00",
      saturdayHours: "토요일·일요일 휴무",
      getDirections: "길 찾기",
      galleryTitle: "사무실 갤러리",
      contactCtaSubtitle: "각 파트너의 연락처는 해당 프로필에 있습니다.",
      contactButton: "문의하기",
      teamLink: "우리 팀",
      headquarters: "본사",
      viewOnMap: "지도에서 보기",
    },
    ja: {
      heroTitle: "オフィス",
      heroSubtitle: "事務所はヌエボ・レオン州サン・ペドロ・ガルサ・ガルシア（San Pedro Garza García）にあります。",
      mainOfficeTitle: "サン・ペドロ・ガルサ・ガルシア本社",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "18階",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, México",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "San Pedro Garza García の Santos & Saucedo 事務所の地図",
      emailLabel: "メール",
      phoneLabel: "電話",
      addressLabel: "所在地",
      officeHoursTitle: "営業時間",
      officeHours: "月曜日〜金曜日 9:00–19:00",
      saturdayHours: "土曜日・日曜日休業",
      getDirections: "道順を見る",
      galleryTitle: "オフィスギャラリー",
      contactCtaSubtitle: "各パートナーの連絡先は、それぞれのプロフィールに掲載しています。",
      contactButton: "お問い合わせ",
      teamLink: "私たちのチーム",
      headquarters: "本社",
      viewOnMap: "地図で見る",
    },
    ar: {
      heroTitle: "مكاتبنا",
      heroSubtitle: "يقع مكتبنا في San Pedro Garza García بولاية نويفو ليون.",
      mainOfficeTitle: "المقر الرئيسي في San Pedro Garza García",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "الطابق 18",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, México",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "خريطة مكتب Santos & Saucedo في San Pedro Garza García",
      emailLabel: "البريد الإلكتروني",
      phoneLabel: "الهاتف",
      addressLabel: "العنوان",
      officeHoursTitle: "ساعات العمل",
      officeHours: "من الاثنين إلى الجمعة، 9:00–19:00",
      saturdayHours: "السبت والأحد: مغلق",
      getDirections: "احصل على الاتجاهات",
      galleryTitle: "معرض المكتب",
      contactCtaSubtitle: "تظهر بيانات الاتصال بكل شريك في صفحته الشخصية.",
      contactButton: "اتصل بنا",
      teamLink: "فريقنا",
      headquarters: "المقر الرئيسي",
      viewOnMap: "عرض على الخريطة",
    },
    ru: {
      heroTitle: "Наши офисы",
      heroSubtitle: "Наш офис находится в Сан-Педро-Гарса-Гарсия (штат Нуэво-Леон).",
      mainOfficeTitle: "Главный офис в Сан-Педро-Гарса-Гарсия",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "Этаж 18",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, México",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "Карта офиса Santos & Saucedo в Сан-Педро-Гарса-Гарсия",
      emailLabel: "Эл. почта",
      phoneLabel: "Телефон",
      addressLabel: "Адрес",
      officeHoursTitle: "Часы работы",
      officeHours: "Понедельник — пятница, 9:00–19:00",
      saturdayHours: "Суббота и воскресенье: выходной",
      getDirections: "Как добраться",
      galleryTitle: "Галерея офиса",
      contactCtaSubtitle: "Контактные данные каждого партнёра указаны в его профиле.",
      contactButton: "Контакты",
      teamLink: "Наша команда",
      headquarters: "Штаб-квартира",
      viewOnMap: "На карте",
    },
    fr: {
      heroTitle: "Nos bureaux",
      heroSubtitle: "Notre bureau se trouve à San Pedro Garza García, dans l'État de Nuevo León.",
      mainOfficeTitle: "Siège à San Pedro Garza García",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "Étage 18",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, Mexique",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "Plan d'accès au bureau de Santos & Saucedo à San Pedro Garza García",
      emailLabel: "E-mail",
      phoneLabel: "Téléphone",
      addressLabel: "Adresse",
      officeHoursTitle: "Heures d'ouverture",
      officeHours: "Du lundi au vendredi, de 9 h à 19 h",
      saturdayHours: "Samedi et dimanche : fermé",
      getDirections: "Obtenir l'itinéraire",
      galleryTitle: "Galerie du bureau",
      contactCtaSubtitle: "Les coordonnées de chaque associé figurent sur sa fiche.",
      contactButton: "Contact",
      teamLink: "Notre équipe",
      headquarters: "Siège social",
      viewOnMap: "Voir sur la carte",
    },
    it: {
      heroTitle: "I nostri uffici",
      heroSubtitle: "Il nostro ufficio si trova a San Pedro Garza García, nello stato di Nuevo León.",
      mainOfficeTitle: "Sede principale a San Pedro Garza García",
      buildingName: "Río Tamazunchale 205 Norte",
      floor: "Piano 18",
      address: "San Pedro Garza García, N.L.",
      colony: "Nuevo León",
      postalCode: "San Pedro Garza García, Nuevo León",
      city: "San Pedro Garza García, Nuevo León, Messico",
      phone: "+52 81 8335 2086",
      email: "info@santossaucedo.com",
      mapTitle: "Mappa dell'ufficio di Santos & Saucedo a San Pedro Garza García",
      emailLabel: "E-mail",
      phoneLabel: "Telefono",
      addressLabel: "Indirizzo",
      officeHoursTitle: "Orari di ufficio",
      officeHours: "Dal lunedì al venerdì, 9:00–19:00",
      saturdayHours: "Sabato e domenica: chiuso",
      getDirections: "Ottieni indicazioni",
      galleryTitle: "Galleria dell'ufficio",
      contactCtaSubtitle: "I recapiti di ciascun socio sono indicati nella sua scheda.",
      contactButton: "Contatti",
      teamLink: "Il nostro team",
      headquarters: "Sede centrale",
      viewOnMap: "Vedi sulla mappa",
    },
  };

  const baseT = content[language] || content.en;
  const t = {
    ...baseT,
    buildingName: "Río Tamazunchale 205 Norte",
    floor: "",
    address: "Río Tamazunchale 205 Norte",
    colony: "Col. del Valle",
    postalCode: "San Pedro Garza García, N.L.",
    city: "C.P. 66220, México",
  };

  const googleMapsEmbedUrl = "https://www.google.com/maps?q=R%C3%ADo+Tamazunchale+205+Norte,+Colonia+Del+Valle,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+C.P.+66220&output=embed";
  const googleMapsDirectionsUrl = "https://www.google.com/maps/dir//R%C3%ADo+Tamazunchale+205+Norte,+Colonia+Del+Valle,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+C.P.+66220";

  return (
    <div className="min-h-screen bg-background" data-testid="page-offices">
      <SEOHead page="offices" language={language} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-offices-hero">
        <div className="ss-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <Eyebrow num="06" tone="navy" className="mb-6" />
            <h1 
              className="mb-5"
              data-testid="text-offices-title"
            >
              {t.heroTitle}
            </h1>
            <p data-testid="text-offices-subtitle">
              {t.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="py-16 lg:py-20">
        <div className="ss-container">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-20"
            data-testid="section-main-office"
          >
            <h2 className={`${h2Class} mb-8`}>
              {t.mainOfficeTitle}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              {/* Datos de la oficina: lista con filetes, sin tarjeta ni iconos. Sin el fax
                  (repetía el teléfono) ni el nombre de la calle repetido como título. Las líneas
                  van en <div> y el teléfono hereda el tamaño del dd: la regla móvil de index.css
                  lleva los <span> a 16 px y la lista quedaba con dos tamaños. */}
              <div className="order-2 lg:order-1" data-testid="card-office-info">
                <dl className="border-b border-ss-rule">
                  <div className={rowClass}>
                    <dt className={dtClass}>{t.addressLabel}</dt>
                    <dd className={ddClass} data-testid="text-full-address">
                      <div data-testid="text-building-name">{t.address}</div>
                      <div>{t.colony}</div>
                      <div>{t.postalCode}</div>
                      <div>{t.city}</div>
                    </dd>
                  </div>
                  <div className={rowClass}>
                    <dt className={dtClass}>{t.phoneLabel}</dt>
                    <dd className={ddClass}>
                      <a 
                        href={`tel:${t.phone.replace(/\s/g, "")}`} 
                        className={ddLinkClass}
                        data-testid="link-phone"
                      >
                        <span dir="ltr" className="[font-size:inherit]">{t.phone}</span>
                      </a>
                    </dd>
                  </div>
                  <div className={rowClass}>
                    <dt className={dtClass}>{t.emailLabel}</dt>
                    <dd className={ddClass}>
                      <a 
                        href={`mailto:${t.email}`}
                        className={ddLinkClass}
                        data-testid="link-email"
                      >
                        {t.email}
                      </a>
                    </dd>
                  </div>
                  <div className={rowClass}>
                    <dt className={dtClass}>{t.officeHoursTitle}</dt>
                    <dd className={ddClass}>
                      <div data-testid="text-office-hours">{t.officeHours}</div>
                      <div className="text-ss-medio">{t.saturdayHours}</div>
                    </dd>
                  </div>
                </dl>

                {/* Enlace de texto de la marca (etiqueta, subrayado al pasar, flecha), sin botón con caja */}
                <a 
                  href={googleMapsDirectionsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ss-label group mt-8 inline-flex min-h-[44px] items-center gap-3 text-ss-marino"
                  data-testid="button-directions"
                >
                  <span className="ss-link">{t.getDirections}</span>
                  <span aria-hidden="true" className="ss-arrow">
                    →
                  </span>
                </a>
              </div>

              {/* Mapa en gris, sin marco ni esquinas; Hueso de fondo mientras carga */}
              <div className="order-1 lg:order-2">
                <div 
                  className="w-full h-[360px] lg:h-full min-h-[360px] lg:min-h-[480px] bg-ss-paper"
                  data-testid="container-map"
                >
                  <iframe
                    src={googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    className="block h-full w-full"
                    style={{ border: 0, filter: "grayscale(1) contrast(.95)" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t.mapTitle}
                    data-testid="iframe-google-maps"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Galería: solo mientras carga o si hay imágenes (/api/office-images devuelve [] hoy);
              sin ellas el titular invitaba a explorar una banda vacía */}
          {(imagesLoading || (officeImages?.length ?? 0) > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
            data-testid="section-gallery"
          >
            <div className="mb-10">
              <h2 className={h2Class}>
                {t.galleryTitle}
              </h2>
            </div>

            {imagesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="skeleton-gallery">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-[4/3]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="grid-gallery">
                {officeImages?.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="aspect-[4/3] overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedImage(image)}
                    data-testid={`gallery-image-${image.id}`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={language === "es" ? image.altEs : image.alt}
                      className="ss-photo w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
          )}

          {/* Cierre: el dato (las fichas de los socios) y dos enlaces de texto, uno por acción.
              Sin "¿Listo para visitarnos?" ni botones dentro de enlaces. */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="border-t border-ss-rule pt-8"
            data-testid="section-contact-cta"
          >
            <p className="text-base text-ss-tinta leading-[1.55] max-w-2xl mb-6">
              {t.contactCtaSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <Link
                href="/contact"
                className="ss-label group relative inline-flex items-center gap-3 text-ss-marino before:absolute before:inset-x-0 before:-inset-y-3"
                data-testid="button-contact"
              >
                <span className="ss-link">{t.contactButton}</span>
                <span aria-hidden="true" className="ss-arrow">
                  →
                </span>
              </Link>
              <Link
                href="/team"
                className="ss-label group relative inline-flex items-center gap-3 text-ss-marino before:absolute before:inset-x-0 before:-inset-y-3"
                data-testid="button-schedule"
              >
                <span className="ss-link">{t.teamLink}</span>
                <span aria-hidden="true" className="ss-arrow">
                  →
                </span>
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
      </main>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          data-testid="modal-image-lightbox"
        >
          <div className="relative max-w-5xl w-full">
            <img
              src={selectedImage.imageUrl}
              alt={language === "es" ? selectedImage.altEs : selectedImage.alt}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-11 h-11 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label={language === "es" ? "Cerrar" : "Close"}
              data-testid="button-close-lightbox"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
