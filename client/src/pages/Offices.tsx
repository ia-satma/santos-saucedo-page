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
const h3Class = "font-heading font-normal text-ss-marino text-[22px] leading-[1.25] tracking-[-0.01em]";
const h4Class = "font-heading font-normal text-ss-marino text-[20px] leading-[1.25] tracking-[-0.01em]";
// Lista de datos de la oficina: filas con filete superior; etiqueta (dt) en la sans
// versal espaciada, Gris Medio; dato (dd) en la sans de 17 px, Gris Tinta.
const rowClass = "grid grid-cols-1 gap-y-1 border-t border-ss-rule py-4 sm:grid-cols-[11rem,1fr] sm:gap-x-6";
const dtClass = "ss-label text-ss-medio sm:pt-1";
const ddClass = "text-[17px] leading-[1.55] text-ss-tinta";
const ddLinkClass = "hover:text-ss-marino hover:underline underline-offset-4 transition-colors";
// Filas abiertas (instalaciones, transporte): filete superior, titular en romana, texto en la sans
const openRowClass = "h-full border-t border-ss-rule pt-6";
const leadClass = "font-serif font-normal text-ss-tinta text-[clamp(19px,0.6vw_+_14px,22px)] leading-[1.55] tracking-[-0.003em] [text-wrap:pretty]";

interface AmenityItem {
  text: string;
}

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
  amenitiesTitle: string;
  amenities: AmenityItem[];
  directionsTitle: string;
  directionsText: string;
  landmarksTitle: string;
  landmarks: string[];
  galleryTitle: string;
  gallerySubtitle: string;
  facilitiesTitle: string;
  facilitiesSubtitle: string;
  meetingRoomsTitle: string;
  meetingRoomsDesc: string;
  videoConferencingTitle: string;
  videoConferencingDesc: string;
  clientHospitalityTitle: string;
  clientHospitalityDesc: string;
  accessibilityTitle: string;
  accessibilityDesc: string;
  transportTitle: string;
  transportSubtitle: string;
  metroTitle: string;
  metroDesc: string;
  parkingTitle: string;
  parkingDesc: string;
  taxiTitle: string;
  taxiDesc: string;
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
      amenitiesTitle: "Building Amenities",
      amenities: [
        { text: "Premium Class A office building" },
        { text: "High-speed fiber optic connectivity" },
        { text: "Executive cafeteria and lounge areas" },
        { text: "Underground parking with 24/7 security" },
      ],
      directionsTitle: "How to Get There",
      directionsText: "The office is located in Colonia del Valle, San Pedro Garza García, Nuevo León. Use the map link for the most direct route from your location.",
      landmarksTitle: "Nearby Landmarks",
      landmarks: [
        "Chapultepec Castle (2 min drive)",
        "Museo Nacional de Antropología (5 min drive)",
        "Paseo de la Reforma (1 min walk)",
        "Nuevo León shopping district (5 min walk)",
      ],
      galleryTitle: "Office Gallery",
      gallerySubtitle: "Explore our modern, collaborative workspace designed for excellence",
      facilitiesTitle: "Our Facilities",
      facilitiesSubtitle: "State-of-the-art amenities for our clients and team",
      meetingRoomsTitle: "Meeting Rooms",
      meetingRoomsDesc: "16 fully equipped meeting rooms ranging from intimate client consultation spaces to large conference halls, all featuring advanced presentation technology and comfortable furnishings.",
      videoConferencingTitle: "Video Conferencing",
      videoConferencingDesc: "Cutting-edge video conferencing facilities enabling seamless communication with clients and partners worldwide, with dedicated technical support staff.",
      clientHospitalityTitle: "Client Hospitality",
      clientHospitalityDesc: "Executive reception areas with premium catering services, private client lounges, and VIP parking for our distinguished guests.",
      accessibilityTitle: "Accessibility",
      accessibilityDesc: "Full wheelchair accessibility throughout our offices, including accessible restrooms, elevators, and reserved parking spaces.",
      transportTitle: "Transportation",
      transportSubtitle: "Multiple convenient options to reach our offices",
      metroTitle: "Metro",
      metroDesc: "Please use the map link for the most direct route by car or ride-share to San Pedro Garza García.",
      parkingTitle: "Parking",
      parkingDesc: "Parking information is available upon scheduling your visit. Please contact our team before arrival.",
      taxiTitle: "Taxi / Uber",
      taxiDesc: "Request your ride to 'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'. Please confirm arrival details with our team before your visit.",
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
      amenitiesTitle: "Amenidades del edificio",
      amenities: [
        { text: "Edificio de oficinas Clase A Premium" },
        { text: "Conectividad de fibra óptica de alta velocidad" },
        { text: "Cafetería ejecutiva y áreas de descanso" },
        { text: "Estacionamiento subterráneo con seguridad 24/7" },
      ],
      directionsTitle: "Cómo llegar",
      directionsText: "La oficina se ubica en la Colonia del Valle, San Pedro Garza García, Nuevo León. Use el enlace del mapa para obtener la ruta más directa desde su ubicación.",
      landmarksTitle: "Puntos de referencia cercanos",
      landmarks: [
        "Castillo de Chapultepec (2 min en auto)",
        "Museo Nacional de Antropología (5 min en auto)",
        "Paseo de la Reforma (1 min caminando)",
        "Zona comercial de Nuevo León (5 min caminando)",
      ],
      galleryTitle: "Galería de oficinas",
      gallerySubtitle: "Explore nuestro moderno espacio de trabajo colaborativo diseñado para la excelencia",
      facilitiesTitle: "Nuestras instalaciones",
      facilitiesSubtitle: "Amenidades de última generación para nuestros clientes y equipo",
      meetingRoomsTitle: "Salas de juntas",
      meetingRoomsDesc: "16 salas de juntas completamente equipadas que van desde espacios íntimos de consulta con clientes hasta grandes salas de conferencias, todas con tecnología avanzada de presentación y mobiliario confortable.",
      videoConferencingTitle: "Videoconferencias",
      videoConferencingDesc: "Instalaciones de videoconferencia de última generación que permiten una comunicación fluida con clientes y socios en todo el mundo, con personal de soporte técnico dedicado.",
      clientHospitalityTitle: "Hospitalidad para clientes",
      clientHospitalityDesc: "Áreas de recepción ejecutivas con servicios de catering premium, salones privados para clientes y estacionamiento VIP para nuestros distinguidos visitantes.",
      accessibilityTitle: "Accesibilidad",
      accessibilityDesc: "Accesibilidad completa para sillas de ruedas en todas nuestras oficinas, incluyendo baños accesibles, elevadores y espacios de estacionamiento reservados.",
      transportTitle: "Transporte",
      transportSubtitle: "Múltiples opciones convenientes para llegar a nuestras oficinas",
      metroTitle: "Metro",
      metroDesc: "Use el enlace del mapa para obtener la ruta más directa en auto o transporte privado hacia San Pedro Garza García.",
      parkingTitle: "Estacionamiento",
      parkingDesc: "La información de estacionamiento está disponible al programar su visita. Por favor contacte a nuestro equipo antes de llegar.",
      taxiTitle: "Taxi / Uber",
      taxiDesc: "Solicite su viaje a 'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'. Por favor confirme los detalles de llegada con nuestro equipo antes de su visita.",
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
      amenitiesTitle: "Gebäudeausstattung",
      amenities: [
        { text: "Premium Klasse A Bürogebäude" },
        { text: "Hochgeschwindigkeits-Glasfaserverbindung" },
        { text: "Executive-Cafeteria und Loungebereiche" },
        { text: "Tiefgarage mit 24/7-Sicherheit" },
      ],
      directionsTitle: "Anfahrt",
      directionsText: "Das Büro befindet sich in der Colonia del Valle, San Pedro Garza García, Nuevo León. Über den Kartenlink erhalten Sie die direkte Route von Ihrem Standort.",
      landmarksTitle: "Sehenswürdigkeiten in der Nähe",
      landmarks: [
        "Schloss Chapultepec (2 Min. Fahrt)",
        "Nationales Museum für Anthropologie (5 Min. Fahrt)",
        "Paseo de la Reforma (1 Min. zu Fuß)",
        "Einkaufsviertel Nuevo León (5 Min. zu Fuß)",
      ],
      galleryTitle: "Bürogalerie",
      gallerySubtitle: "Erkunden Sie unseren modernen, kollaborativen Arbeitsraum, der für Exzellenz konzipiert ist",
      facilitiesTitle: "Unsere Einrichtungen",
      facilitiesSubtitle: "Modernste Ausstattung für unsere Mandanten und unser Team",
      meetingRoomsTitle: "Konferenzräume",
      meetingRoomsDesc: "16 voll ausgestattete Konferenzräume, von intimen Beratungsräumen bis hin zu großen Konferenzsälen, alle mit fortschrittlicher Präsentationstechnologie und komfortabler Einrichtung.",
      videoConferencingTitle: "Videokonferenzen",
      videoConferencingDesc: "Modernste Videokonferenzeinrichtungen für nahtlose Kommunikation mit Mandanten und Partnern weltweit, mit dediziertem technischen Support.",
      clientHospitalityTitle: "Mandantenbetreuung",
      clientHospitalityDesc: "Executive-Empfangsbereiche mit Premium-Catering-Service, private Mandanten-Lounges und VIP-Parkplätze für unsere geschätzten Gäste.",
      accessibilityTitle: "Barrierefreiheit",
      accessibilityDesc: "Vollständige Rollstuhlzugänglichkeit in unseren gesamten Büros, einschließlich barrierefreier Toiletten, Aufzüge und reservierter Parkplätze.",
      transportTitle: "Anreise",
      transportSubtitle: "Mehrere bequeme Optionen, um unsere Büros zu erreichen",
      metroTitle: "Metro",
      metroDesc: "Die nächste Metrostation ist Auditorio (Linie 7), etwa 10 Gehminuten entfernt. Alternativ ist auch die Station Nuevo León (Linie 7) erreichbar.",
      parkingTitle: "Parken",
      parkingDesc: "Parkinformationen erhalten Sie bei der Terminvereinbarung. Bitte kontaktieren Sie unser Team vor Ihrer Ankunft.",
      taxiTitle: "Taxi / Uber",
      taxiDesc: "Bestellen Sie Ihre Fahrt zu 'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'. Bitte bestätigen Sie die Ankunftsdetails vor Ihrem Besuch mit unserem Team.",
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
      amenitiesTitle: "大楼设施",
      amenities: [
        { text: "高端A级办公楼" },
        { text: "高速光纤连接" },
        { text: "行政餐厅和休息区" },
        { text: "24/7安保地下停车场" },
      ],
      directionsTitle: "如何到达",
      directionsText: "办公室位于新莱昂州圣佩德罗加尔萨加西亚的 Colonia del Valle。请使用地图链接查看从您所在位置出发的最佳路线。",
      landmarksTitle: "附近地标",
      landmarks: [
        "查普尔特佩克城堡（车程2分钟）",
        "国家人类学博物馆（车程5分钟）",
        "改革大道（步行1分钟）",
        "Nuevo León购物区（步行5分钟）",
      ],
      galleryTitle: "办公室图库",
      gallerySubtitle: "探索我们为卓越而设计的现代化协作工作空间",
      facilitiesTitle: "我们的设施",
      facilitiesSubtitle: "为我们的客户和团队提供最先进的设施",
      meetingRoomsTitle: "会议室",
      meetingRoomsDesc: "16间设备齐全的会议室，从私密的客户咨询空间到大型会议厅，均配备先进的演示技术和舒适的家具。",
      videoConferencingTitle: "视频会议",
      videoConferencingDesc: "最先进的视频会议设施，可与全球客户和合作伙伴进行无缝沟通，并配有专业的技术支持人员。",
      clientHospitalityTitle: "客户接待",
      clientHospitalityDesc: "行政接待区提供高级餐饮服务、私人客户休息室以及为尊贵客人提供的贵宾停车位。",
      accessibilityTitle: "无障碍设施",
      accessibilityDesc: "办公室全区域轮椅无障碍通行，包括无障碍洗手间、电梯和预留停车位。",
      transportTitle: "交通",
      transportSubtitle: "多种便捷方式到达我们的办公室",
      metroTitle: "地铁",
      metroDesc: "最近的地铁站是Auditorio（7号线），步行约10分钟。或者，Nuevo León站（7号线）也可到达。",
      parkingTitle: "停车",
      parkingDesc: "请在预约访问时确认停车信息。到达前请联系我们的团队。",
      taxiTitle: "出租车 / Uber",
      taxiDesc: "请将目的地设为'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'。到访前请与我们的团队确认抵达细节。",
      contactCtaSubtitle: "各合伙人的联系方式见其个人页面。",
      contactButton: "联系我们",
      teamLink: "我们的团队",
      headquarters: "总部",
      viewOnMap: "在地图上查看",
    },
    ko: {
      heroTitle: "사무실",
      heroSubtitle: "사무소는 누에보레온주 산페드로가르사가르시아(San Pedro Garza García)에 있습니다.",
      mainOfficeTitle: "산페드로가르사가르시아 본사",
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
      amenitiesTitle: "건물 편의시설",
      amenities: [
        { text: "프리미엄 A급 오피스 빌딩" },
        { text: "초고속 광섬유 연결" },
        { text: "임원 카페테리아 및 라운지" },
        { text: "24시간 보안 지하 주차장" },
      ],
      directionsTitle: "오시는 길",
      directionsText: "사무소는 누에보레온주 산페드로가르사가르시아의 Colonia del Valle에 있습니다. 지도 링크에서 현재 위치로부터의 가장 빠른 경로를 확인하실 수 있습니다.",
      landmarksTitle: "인근 랜드마크",
      landmarks: [
        "차풀테펙 성 (차로 2분)",
        "국립 인류학 박물관 (차로 5분)",
        "레포르마 대로 (도보 1분)",
        "폴랑코 쇼핑 지구 (도보 5분)",
      ],
      galleryTitle: "사무실 갤러리",
      gallerySubtitle: "탁월함을 위해 설계된 현대적이고 협업적인 작업 공간을 탐색하세요",
      facilitiesTitle: "시설",
      facilitiesSubtitle: "고객과 팀을 위한 최첨단 편의시설",
      meetingRoomsTitle: "회의실",
      meetingRoomsDesc: "친밀한 고객 상담 공간부터 대형 컨퍼런스홀까지 첨단 프레젠테이션 기술과 편안한 가구를 갖춘 16개의 완비된 회의실.",
      videoConferencingTitle: "화상 회의",
      videoConferencingDesc: "전 세계 고객 및 파트너와 원활한 소통을 가능하게 하는 최첨단 화상 회의 시설과 전담 기술 지원 직원.",
      clientHospitalityTitle: "고객 환대",
      clientHospitalityDesc: "프리미엄 케이터링 서비스가 제공되는 임원 리셉션 구역, 프라이빗 고객 라운지, 귀빈을 위한 VIP 주차장.",
      accessibilityTitle: "접근성",
      accessibilityDesc: "접근 가능한 화장실, 엘리베이터, 예약 주차 공간을 포함한 사무실 전체의 완전한 휠체어 접근성.",
      transportTitle: "교통",
      transportSubtitle: "사무실에 도착하는 다양한 편리한 옵션",
      metroTitle: "지하철",
      metroDesc: "가장 가까운 지하철역은 Auditorio (7호선)으로 도보 약 10분 거리입니다. Nuevo León역 (7호선)도 이용 가능합니다.",
      parkingTitle: "주차",
      parkingDesc: "방문 일정을 잡을 때 주차 정보를 확인해 주세요. 도착 전 저희 팀에 문의해 주세요.",
      taxiTitle: "택시 / Uber",
      taxiDesc: "'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'로 차량을 요청하세요. 방문 전 도착 세부 사항을 저희 팀과 확인해 주세요.",
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
      amenitiesTitle: "ビル設備",
      amenities: [
        { text: "プレミアムクラスAオフィスビル" },
        { text: "高速光ファイバー接続" },
        { text: "エグゼクティブカフェテリアとラウンジエリア" },
        { text: "24時間セキュリティ付き地下駐車場" },
      ],
      directionsTitle: "アクセス",
      directionsText: "事務所はヌエボ・レオン州サン・ペドロ・ガルサ・ガルシアの Colonia del Valle にあります。現在地からの経路は地図のリンクでご確認いただけます。",
      landmarksTitle: "近くのランドマーク",
      landmarks: [
        "チャプルテペック城（車で2分）",
        "国立人類学博物館（車で5分）",
        "レフォルマ通り（徒歩1分）",
        "ポランコショッピング地区（徒歩5分）",
      ],
      galleryTitle: "オフィスギャラリー",
      gallerySubtitle: "卓越性のために設計されたモダンで協調的なワークスペースをご覧ください",
      facilitiesTitle: "施設",
      facilitiesSubtitle: "お客様とチームのための最先端の設備",
      meetingRoomsTitle: "会議室",
      meetingRoomsDesc: "プライベートなクライアント相談スペースから大規模な会議ホールまで、高度なプレゼンテーション技術と快適な家具を備えた16の完備された会議室。",
      videoConferencingTitle: "ビデオ会議",
      videoConferencingDesc: "世界中のクライアントやパートナーとのシームレスなコミュニケーションを可能にする最先端のビデオ会議設備と専任の技術サポートスタッフ。",
      clientHospitalityTitle: "クライアントホスピタリティ",
      clientHospitalityDesc: "プレミアムケータリングサービス付きのエグゼクティブレセプションエリア、プライベートクライアントラウンジ、VIP駐車場。",
      accessibilityTitle: "アクセシビリティ",
      accessibilityDesc: "バリアフリートイレ、エレベーター、予約駐車スペースを含む、オフィス全体での完全な車椅子アクセス。",
      transportTitle: "交通",
      transportSubtitle: "オフィスへの便利なアクセス方法",
      metroTitle: "地下鉄",
      metroDesc: "最寄りの地下鉄駅はAuditorio（7号線）で、徒歩約10分です。または、Nuevo León駅（7号線）も利用可能です。",
      parkingTitle: "駐車場",
      parkingDesc: "駐車場情報は訪問予約時にご確認ください。到着前に当チームまでお問い合わせください。",
      taxiTitle: "タクシー / Uber",
      taxiDesc: "'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'へ配車を依頼してください。訪問前に到着の詳細を当チームにご確認ください。",
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
      amenitiesTitle: "مرافق المبنى",
      amenities: [
        { text: "مبنى مكاتب من الدرجة الأولى" },
        { text: "اتصال ألياف ضوئية عالي السرعة" },
        { text: "كافيتريا تنفيذية ومناطق صالة" },
        { text: "موقف سيارات تحت الأرض مع أمن على مدار الساعة" },
      ],
      directionsTitle: "كيفية الوصول",
      directionsText: "يقع المكتب في Colonia del Valle بمدينة San Pedro Garza García في ولاية نويفو ليون. استخدم رابط الخريطة للحصول على أقصر طريق من موقعك.",
      landmarksTitle: "المعالم القريبة",
      landmarks: [
        "قلعة تشابولتيبيك (دقيقتان بالسيارة)",
        "المتحف الوطني للأنثروبولوجيا (5 دقائق بالسيارة)",
        "باسيو دي لا ريفورما (دقيقة واحدة سيراً)",
        "منطقة تسوق San Pedro Garza García (5 دقائق سيراً)",
      ],
      galleryTitle: "معرض المكتب",
      gallerySubtitle: "استكشف مساحة العمل الحديثة والتعاونية المصممة للتميز",
      facilitiesTitle: "مرافقنا",
      facilitiesSubtitle: "مرافق متطورة لعملائنا وفريقنا",
      meetingRoomsTitle: "غرف الاجتماعات",
      meetingRoomsDesc: "16 غرفة اجتماعات مجهزة بالكامل تتراوح من مساحات استشارات العملاء الخاصة إلى قاعات المؤتمرات الكبيرة، جميعها مزودة بتقنية عرض متقدمة وأثاث مريح.",
      videoConferencingTitle: "مؤتمرات الفيديو",
      videoConferencingDesc: "مرافق مؤتمرات فيديو متطورة تتيح التواصل السلس مع العملاء والشركاء في جميع أنحاء العالم، مع طاقم دعم تقني مخصص.",
      clientHospitalityTitle: "ضيافة العملاء",
      clientHospitalityDesc: "مناطق استقبال تنفيذية مع خدمات تموين متميزة، وصالات خاصة للعملاء، ومواقف سيارات VIP لضيوفنا المميزين.",
      accessibilityTitle: "إمكانية الوصول",
      accessibilityDesc: "إمكانية وصول كاملة للكراسي المتحركة في جميع أنحاء مكاتبنا، بما في ذلك الحمامات والمصاعد ومواقف السيارات المحجوزة.",
      transportTitle: "المواصلات",
      transportSubtitle: "خيارات متعددة مريحة للوصول إلى مكاتبنا",
      metroTitle: "المترو",
      metroDesc: "أقرب محطة مترو هي Auditorio (الخط 7)، على بعد حوالي 10 دقائق سيراً على الأقدام. بدلاً من ذلك، يمكن الوصول إلى محطة Nuevo León (الخط 7) أيضاً.",
      parkingTitle: "مواقف السيارات",
      parkingDesc: "تتوفر معلومات مواقف السيارات عند جدولة زيارتك. يرجى التواصل مع فريقنا قبل الوصول.",
      taxiTitle: "تاكسي / أوبر",
      taxiDesc: "اطلب رحلتك إلى 'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'. يرجى تأكيد تفاصيل الوصول مع فريقنا قبل زيارتك.",
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
      amenitiesTitle: "Удобства здания",
      amenities: [
        { text: "Офисное здание премиум-класса А" },
        { text: "Высокоскоростное оптоволоконное соединение" },
        { text: "Кафетерий и лаунж-зоны для руководителей" },
        { text: "Подземная парковка с охраной 24/7" },
      ],
      directionsTitle: "Как добраться",
      directionsText: "Офис находится в районе Колония-дель-Валье, Сан-Педро-Гарса-Гарсия, штат Нуэво-Леон. Кратчайший маршрут от вашего местоположения можно построить по ссылке на карту.",
      landmarksTitle: "Ближайшие достопримечательности",
      landmarks: [
        "Замок Чапультепек (2 мин на машине)",
        "Национальный музей антропологии (5 мин на машине)",
        "Paseo de la Reforma (1 мин пешком)",
        "Торговый район San Pedro Garza García (5 мин пешком)",
      ],
      galleryTitle: "Галерея офиса",
      gallerySubtitle: "Изучите наше современное рабочее пространство для совместной работы, созданное для достижения превосходства",
      facilitiesTitle: "Наши помещения",
      facilitiesSubtitle: "Современное оборудование для наших клиентов и команды",
      meetingRoomsTitle: "Переговорные комнаты",
      meetingRoomsDesc: "16 полностью оборудованных переговорных комнат от небольших помещений для консультаций до больших конференц-залов с передовыми презентационными технологиями и комфортной мебелью.",
      videoConferencingTitle: "Видеоконференции",
      videoConferencingDesc: "Современные средства видеоконференцсвязи для бесперебойного общения с клиентами и партнерами по всему миру с выделенным техническим персоналом.",
      clientHospitalityTitle: "Гостеприимство для клиентов",
      clientHospitalityDesc: "Представительские приемные с услугами премиум-кейтеринга, приватные клиентские лаунжи и VIP-парковка для наших уважаемых гостей.",
      accessibilityTitle: "Доступность",
      accessibilityDesc: "Полная доступность для инвалидных колясок во всех офисах, включая доступные туалеты, лифты и зарезервированные парковочные места.",
      transportTitle: "Транспорт",
      transportSubtitle: "Несколько удобных способов добраться до наших офисов",
      metroTitle: "Метро",
      metroDesc: "Ближайшая станция метро — Auditorio (Линия 7), примерно в 10 минутах ходьбы. Также доступна станция Nuevo León (Линия 7).",
      parkingTitle: "Парковка",
      parkingDesc: "Подземная парковка в Río Tamazunchale с валидацией для клиентов. Дополнительная публичная парковка рядом в Antara Fashion Hall и Palacio de Hierro Nuevo León.",
      taxiTitle: "Такси / Uber",
      taxiDesc: "Укажите адрес 'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'. Пожалуйста, подтвердите детали прибытия с нашей командой до визита.",
      contactCtaSubtitle: "Контактные данные каждого партнёра указаны в его профиле.",
      contactButton: "Контакты",
      teamLink: "Наша команда",
      headquarters: "Штаб-квартира",
      viewOnMap: "На карте",
    },
    fr: {
      heroTitle: "Nos Bureaux",
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
      amenitiesTitle: "Équipements du bâtiment",
      amenities: [
        { text: "Immeuble de bureaux Premium Classe A" },
        { text: "Connectivité fibre optique haut débit" },
        { text: "Cafétéria exécutive et espaces lounge" },
        { text: "Parking souterrain avec sécurité 24h/24" },
      ],
      directionsTitle: "Comment s'y rendre",
      directionsText: "Le bureau se trouve dans la Colonia del Valle, à San Pedro Garza García (Nuevo León). Le lien vers la carte indique l'itinéraire le plus direct depuis votre position.",
      landmarksTitle: "Points de repère à proximité",
      landmarks: [
        "Château de Chapultepec (2 min en voiture)",
        "Musée national d'anthropologie (5 min en voiture)",
        "Paseo de la Reforma (1 min à pied)",
        "Quartier commerçant de Nuevo León (5 min à pied)",
      ],
      galleryTitle: "Galerie du bureau",
      gallerySubtitle: "Explorez notre espace de travail moderne et collaboratif conçu pour l'excellence",
      facilitiesTitle: "Nos installations",
      facilitiesSubtitle: "Équipements de pointe pour nos clients et notre équipe",
      meetingRoomsTitle: "Salles de réunion",
      meetingRoomsDesc: "16 salles de réunion entièrement équipées allant des espaces de consultation intime aux grandes salles de conférence, toutes dotées de technologie de présentation avancée et de mobilier confortable.",
      videoConferencingTitle: "Vidéoconférence",
      videoConferencingDesc: "Installations de vidéoconférence de pointe permettant une communication fluide avec les clients et partenaires du monde entier, avec une équipe de support technique dédiée.",
      clientHospitalityTitle: "Hospitalité client",
      clientHospitalityDesc: "Espaces de réception exécutifs avec services de restauration premium, salons clients privés et parking VIP pour nos invités distingués.",
      accessibilityTitle: "Accessibilité",
      accessibilityDesc: "Accessibilité complète en fauteuil roulant dans tous nos bureaux, y compris les toilettes accessibles, les ascenseurs et les places de parking réservées.",
      transportTitle: "Transport",
      transportSubtitle: "Plusieurs options pratiques pour rejoindre nos bureaux",
      metroTitle: "Métro",
      metroDesc: "La station de métro la plus proche est Auditorio (Ligne 7), à environ 10 minutes à pied. La station Nuevo León (Ligne 7) est également accessible.",
      parkingTitle: "Stationnement",
      parkingDesc: "Les informations de stationnement sont disponibles lors de la planification de votre visite. Veuillez contacter notre équipe avant votre arrivée.",
      taxiTitle: "Taxi / Uber",
      taxiDesc: "Demandez votre course vers 'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'. Veuillez confirmer les détails d.arrivée avec notre équipe avant votre visite.",
      contactCtaSubtitle: "Les coordonnées de chaque associé figurent sur sa fiche.",
      contactButton: "Contact",
      teamLink: "Notre équipe",
      headquarters: "Siège social",
      viewOnMap: "Voir sur la carte",
    },
    it: {
      heroTitle: "I Nostri Uffici",
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
      amenitiesTitle: "Servizi dell'edificio",
      amenities: [
        { text: "Edificio per uffici Premium Classe A" },
        { text: "Connettività in fibra ottica ad alta velocità" },
        { text: "Caffetteria executive e aree lounge" },
        { text: "Parcheggio sotterraneo con sicurezza 24/7" },
      ],
      directionsTitle: "Come arrivare",
      directionsText: "L'ufficio si trova nella Colonia del Valle, a San Pedro Garza García (Nuevo León). Il link alla mappa indica il percorso più diretto dalla vostra posizione.",
      landmarksTitle: "Punti di riferimento nelle vicinanze",
      landmarks: [
        "Castello di Chapultepec (2 min in auto)",
        "Museo Nazionale di Antropologia (5 min in auto)",
        "Paseo de la Reforma (1 min a piedi)",
        "Quartiere commerciale di Nuevo León (5 min a piedi)",
      ],
      galleryTitle: "Galleria dell'ufficio",
      gallerySubtitle: "Esplora il nostro spazio di lavoro moderno e collaborativo progettato per l'eccellenza",
      facilitiesTitle: "Le nostre strutture",
      facilitiesSubtitle: "Servizi all'avanguardia per i nostri clienti e il team",
      meetingRoomsTitle: "Sale riunioni",
      meetingRoomsDesc: "16 sale riunioni completamente attrezzate che vanno da spazi di consultazione intimi a grandi sale conferenze, tutte dotate di tecnologia di presentazione avanzata e arredi confortevoli.",
      videoConferencingTitle: "Videoconferenza",
      videoConferencingDesc: "Strutture di videoconferenza all'avanguardia che consentono una comunicazione fluida con clienti e partner in tutto il mondo, con personale di supporto tecnico dedicato.",
      clientHospitalityTitle: "Ospitalità clienti",
      clientHospitalityDesc: "Aree reception executive con servizi di catering premium, lounge private per i clienti e parcheggio VIP per i nostri ospiti distinti.",
      accessibilityTitle: "Accessibilità",
      accessibilityDesc: "Piena accessibilità per sedie a rotelle in tutti i nostri uffici, inclusi bagni accessibili, ascensori e posti auto riservati.",
      transportTitle: "Trasporti",
      transportSubtitle: "Molteplici opzioni comode per raggiungere i nostri uffici",
      metroTitle: "Metro",
      metroDesc: "La stazione della metropolitana più vicina è Auditorio (Linea 7), a circa 10 minuti a piedi. In alternativa, è accessibile anche la stazione Nuevo León (Linea 7).",
      parkingTitle: "Parcheggio",
      parkingDesc: "Le informazioni sul parcheggio sono disponibili al momento della pianificazione della visita. Contatta il nostro team prima dell.arrivo.",
      taxiTitle: "Taxi / Uber",
      taxiDesc: "Richiedi la tua corsa a 'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'. Conferma i dettagli di arrivo con il nostro team prima della visita.",
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
    landmarks: language === "es"
      ? ["Colonia Del Valle", "San Pedro Garza García", "Zona corporativa de Nuevo León", "Río Tamazunchale"]
      : ["Colonia Del Valle", "San Pedro Garza García", "Nuevo León business district", "Río Tamazunchale"],
    metroDesc: language === "es"
      ? "Use el enlace del mapa para obtener la ruta más directa en auto o transporte privado hacia San Pedro Garza García."
      : "Use the map link for the most direct route by car or ride-share to San Pedro Garza García.",
    parkingDesc: language === "es"
      ? "La información de estacionamiento está disponible al programar su visita. Por favor contacte a nuestro equipo antes de llegar."
      : "Parking information is available when scheduling your visit. Please contact our team before arrival.",
    taxiDesc: language === "es"
      ? "Solicite su viaje a 'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'."
      : "Request your ride to 'Río Tamazunchale 205 Norte, Colonia Del Valle, San Pedro Garza García, N.L., C.P. 66220'.",
  };

  const googleMapsEmbedUrl = "https://www.google.com/maps?q=R%C3%ADo+Tamazunchale+205+Norte,+Colonia+Del+Valle,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+C.P.+66220&output=embed";
  const googleMapsDirectionsUrl = "https://www.google.com/maps/dir//R%C3%ADo+Tamazunchale+205+Norte,+Colonia+Del+Valle,+San+Pedro+Garza+Garc%C3%ADa,+N.L.,+C.P.+66220";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

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
                  (repetía el teléfono) ni el nombre de la calle repetido como título. */}
              <div className="order-2 lg:order-1" data-testid="card-office-info">
                <dl className="border-b border-ss-rule">
                  <div className={rowClass}>
                    <dt className={dtClass}>{t.addressLabel}</dt>
                    <dd className={ddClass} data-testid="text-full-address">
                      <span className="block" data-testid="text-building-name">{t.address}</span>
                      <span className="block">{t.colony}</span>
                      <span className="block">{t.postalCode}</span>
                      <span className="block">{t.city}</span>
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
                        <span dir="ltr">{t.phone}</span>
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
                      <span className="block" data-testid="text-office-hours">{t.officeHours}</span>
                      <span className="block text-ss-medio">{t.saturdayHours}</span>
                    </dd>
                  </div>
                </dl>

                <div className="pt-8">
                  <h3 className={`${h4Class} mb-4`}>{t.amenitiesTitle}</h3>
                  {/* Raya de 10 px alineada con la primera línea (items-start + mt-[0.75em]) */}
                  <ul className="space-y-3">
                    {t.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-start gap-3" data-testid={`amenity-${index}`}>
                        <span className="mt-[0.75em] h-px w-2.5 flex-shrink-0 bg-ss-medio" aria-hidden="true" />
                        <span className="text-ss-tinta">{amenity.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

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

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-20 bg-ss-paper p-8 lg:p-12"
            data-testid="section-directions"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className={`${h3Class} mb-4`}>
                  {t.directionsTitle}
                </h3>
                <p className="text-ss-tinta leading-relaxed">
                  {t.directionsText}
                </p>
              </div>
              <div>
                <h4 className={`${h4Class} mb-4`}>
                  {t.landmarksTitle}
                </h4>
                {/* Raya de 10 px alineada con la primera línea (items-start + mt-[0.75em]) */}
                <ul className="space-y-2">
                  {t.landmarks.map((landmark, index) => (
                    <li key={index} className="flex items-start gap-3 text-ss-tinta" data-testid={`landmark-${index}`}>
                      <span className="mt-[0.75em] h-px w-2.5 flex-shrink-0 bg-ss-medio" aria-hidden="true" />
                      {landmark}
                    </li>
                  ))}
                </ul>
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
              <h2 className={`${h2Class} mb-4`}>
                {t.galleryTitle}
              </h2>
              <p className={`${leadClass} max-w-2xl`}>
                {t.gallerySubtitle}
              </p>
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

          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
            data-testid="section-facilities"
          >
            <div className="mb-10">
              <h2 className={`${h2Class} mb-4`}>
                {t.facilitiesTitle}
              </h2>
              <p className={`${leadClass} max-w-2xl`}>
                {t.facilitiesSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {([
                ["card-meeting-rooms", t.meetingRoomsTitle, t.meetingRoomsDesc],
                ["card-video-conferencing", t.videoConferencingTitle, t.videoConferencingDesc],
                ["card-client-hospitality", t.clientHospitalityTitle, t.clientHospitalityDesc],
                ["card-accessibility", t.accessibilityTitle, t.accessibilityDesc],
              ] as const).map(([testId, title, desc]) => (
                <motion.div key={testId} variants={itemVariants}>
                  <div className={openRowClass} data-testid={testId}>
                    <h3 className={`${h3Class} mb-3`}>
                      {title}
                    </h3>
                    <p className="text-base text-ss-tinta leading-[1.55]">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-20"
            data-testid="section-transport"
          >
            <div className="mb-10">
              <h2 className={`${h2Class} mb-4`}>
                {t.transportTitle}
              </h2>
              <p className={`${leadClass} max-w-2xl`}>
                {t.transportSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
              {([
                ["card-metro", t.metroTitle, t.metroDesc],
                ["card-parking", t.parkingTitle, t.parkingDesc],
                ["card-taxi", t.taxiTitle, t.taxiDesc],
              ] as const).map(([testId, title, desc]) => (
                <div key={testId} className={openRowClass} data-testid={testId}>
                  <h3 className={`${h3Class} mb-3`}>
                    {title}
                  </h3>
                  <p className="text-base text-ss-tinta leading-[1.55]">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

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
