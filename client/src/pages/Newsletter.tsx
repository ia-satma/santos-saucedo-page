import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, isStaticSite } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow } from "@/components/editorial";

// "Clásica": titulares en romana 400, Azul Marino, caja de oración y al inicio; texto en Gris Tinta.
const h2Class = "font-heading font-normal text-ss-marino text-[clamp(24px,2vw,30px)] leading-[1.18] tracking-[-0.012em] [text-wrap:balance]";
const h3Class = "font-heading font-normal text-ss-marino text-[22px] leading-[1.25] tracking-[-0.01em]";

interface NewsletterFormData {
  email: string;
  firstName?: string;
  lastName?: string;
}

const getNewsletterFormSchema = (language: "es" | "en") => {
  const messages = {
    en: {
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
    },
    es: {
      emailRequired: "El correo electrónico es requerido",
      emailInvalid: "Por favor ingrese una dirección de correo válida",
    },
  };

  const t = messages[language];

  return z.object({
    email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  });
};

export default function Newsletter() {
  const { language } = useLanguage();
  const { toast } = useToast();

  const formLanguage = language === "es" ? "es" : "en";
  const formSchema = getNewsletterFormSchema(formLanguage);

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
  });

  const newsletterMutation = useMutation({
    mutationFn: async (data: NewsletterFormData) => {
      const response = await apiRequest("POST", "/api/newsletter", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === "es" ? "¡Suscripción exitosa!" : "Successfully subscribed!",
        description: language === "es" 
          ? "Gracias por suscribirse a nuestro boletín." 
          : "Thank you for subscribing to our newsletter.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: language === "es" ? "Error" : "Error",
        description: language === "es" 
          ? "No se pudo completar la suscripción. Por favor intente de nuevo." 
          : "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewsletterFormData) => {
    if (isStaticSite) {
      toast({
        title: language === "es" ? "Suscripción no disponible" : "Subscription unavailable",
        description: language === "es"
          ? "GitHub Pages no tiene backend para guardar suscripciones."
          : "GitHub Pages has no backend to save newsletter subscriptions.",
        variant: "destructive",
      });
      return;
    }

    newsletterMutation.mutate(data);
  };

  const content = {
    en: {
      title: "Newsletter",
      subtitle: "The Labor Monitor's analysis, by email",
      archivesTitle: "Past Newsletters",
      archivesSubtitle: "Access our previous editions and stay updated on our legal coverage.",
      viewArchive: "View Newsletter",
      formTitle: "Subscribe to Our Newsletter",
      formSubtitle: "Receive the Labor Monitor's analysis of labor and social security law, and the firm's news, by email.",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email address",
      firstNameLabel: "First Name (optional)",
      firstNamePlaceholder: "Enter your first name",
      lastNameLabel: "Last Name (optional)",
      lastNamePlaceholder: "Enter your last name",
      submit: "Subscribe",
      submitting: "Subscribing...",
      whatYouReceive: "What You'll Receive",
      benefit1Title: "Legal Updates",
      benefit1Description: "Stay current with important changes in Mexican law and regulations that may affect your business.",
      benefit2Title: "Sector Analysis",
      benefit2Description: "In-depth analysis and commentary on legal developments across key sectors.",
      benefit3Title: "Event Invitations",
      benefit3Description: "Exclusive invitations to webinars, seminars, and networking events hosted by our firm.",
      benefit4Title: "Firm News",
      benefit4Description: "Learn about our latest achievements, new team members, and community involvement.",
      privacyNote: "We respect your privacy. Your information will never be shared with third parties. You can unsubscribe at any time.",
      frequency: "Newsletter Frequency",
      frequencyDescription: "Our newsletter is sent monthly, with occasional special editions for urgent legal developments.",
    },
    es: {
      title: "Boletines",
      subtitle: "Los análisis del Monitor Laboral, por correo electrónico",
      archivesTitle: "Boletines anteriores",
      archivesSubtitle: "Acceda a nuestras ediciones anteriores y manténgase informado sobre nuestra cobertura legal.",
      viewArchive: "Ver boletín",
      formTitle: "Suscríbase a nuestro boletín",
      formSubtitle: "Reciba por correo electrónico los análisis del Monitor Laboral sobre derecho laboral y seguridad social, y las noticias de la firma.",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "Ingrese su correo electrónico",
      firstNameLabel: "Nombre (opcional)",
      firstNamePlaceholder: "Ingrese su nombre",
      lastNameLabel: "Apellido (opcional)",
      lastNamePlaceholder: "Ingrese su apellido",
      submit: "Suscribirse",
      submitting: "Suscribiendo...",
      whatYouReceive: "Lo que recibirá",
      benefit1Title: "Actualizaciones legales",
      benefit1Description: "Manténgase al día con cambios importantes en la ley y regulaciones mexicanas que pueden afectar su negocio.",
      benefit2Title: "Análisis por sector",
      benefit2Description: "Análisis profundo y comentarios sobre desarrollos legales en sectores clave.",
      benefit3Title: "Invitaciones a eventos",
      benefit3Description: "Invitaciones exclusivas a webinars, seminarios y eventos de networking organizados por nuestra firma.",
      benefit4Title: "Noticias de la firma",
      benefit4Description: "Conozca nuestros últimos logros, nuevos miembros del equipo e involucramiento comunitario.",
      privacyNote: "Respetamos su privacidad. Su información nunca será compartida con terceros. Puede darse de baja en cualquier momento.",
      frequency: "Frecuencia del boletín",
      frequencyDescription: "Nuestro boletín se envía mensualmente, con ediciones especiales ocasionales para desarrollos legales urgentes.",
    },
    de: {
      title: "Newsletter",
      subtitle: "Bleiben Sie über juristische Entwicklungen informiert",
      archivesTitle: "Frühere Newsletter",
      archivesSubtitle: "Zugriff auf unsere früheren Ausgaben und bleiben Sie über unsere rechtliche Berichterstattung auf dem Laufenden.",
      viewArchive: "Newsletter ansehen",
      formTitle: "Abonnieren Sie unseren Newsletter",
      formSubtitle: "Treten Sie unserer Mailingliste bei, um exklusive rechtliche Updates, Brancheneinblicke und Firmennachrichten direkt in Ihren Posteingang zu erhalten.",
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein",
      firstNameLabel: "Vorname (optional)",
      firstNamePlaceholder: "Geben Sie Ihren Vornamen ein",
      lastNameLabel: "Nachname (optional)",
      lastNamePlaceholder: "Geben Sie Ihren Nachnamen ein",
      submit: "Abonnieren",
      submitting: "Wird abonniert...",
      whatYouReceive: "Was Sie erhalten werden",
      benefit1Title: "Rechtliche Updates",
      benefit1Description: "Bleiben Sie über wichtige Änderungen im mexikanischen Recht und Vorschriften auf dem Laufenden, die Ihr Geschäft betreffen könnten.",
      benefit2Title: "Brancheneinblicke",
      benefit2Description: "Tiefgehende Analysen und Kommentare zu rechtlichen Entwicklungen in Schlüsselbranchen.",
      benefit3Title: "Veranstaltungseinladungen",
      benefit3Description: "Exklusive Einladungen zu Webinaren, Seminaren und Networking-Veranstaltungen unserer Kanzlei.",
      benefit4Title: "Firmennachrichten",
      benefit4Description: "Erfahren Sie von unseren neuesten Erfolgen, neuen Teammitgliedern und unserem gesellschaftlichen Engagement.",
      privacyNote: "Wir respektieren Ihre Privatsphäre. Ihre Daten werden niemals an Dritte weitergegeben. Sie können sich jederzeit abmelden.",
      frequency: "Newsletter-Häufigkeit",
      frequencyDescription: "Unser Newsletter wird monatlich versendet, mit gelegentlichen Sonderausgaben für dringende rechtliche Entwicklungen.",
    },
    zh: {
      title: "电子通讯",
      subtitle: "获取法律动态资讯",
      archivesTitle: "往期通讯",
      archivesSubtitle: "访问我们的往期版本，了解我们的法律报道。",
      viewArchive: "查看通讯",
      formTitle: "订阅我们的通讯",
      formSubtitle: "加入我们的邮件列表，直接在收件箱中接收独家法律更新、行业见解和公司新闻。",
      emailLabel: "电子邮件地址",
      emailPlaceholder: "输入您的电子邮件地址",
      firstNameLabel: "名字（可选）",
      firstNamePlaceholder: "输入您的名字",
      lastNameLabel: "姓氏（可选）",
      lastNamePlaceholder: "输入您的姓氏",
      submit: "订阅",
      submitting: "订阅中...",
      whatYouReceive: "您将收到的内容",
      benefit1Title: "法律动态",
      benefit1Description: "了解可能影响您业务的墨西哥法律和法规的重要变化。",
      benefit2Title: "行业见解",
      benefit2Description: "对关键行业法律发展的深入分析和评论。",
      benefit3Title: "活动邀请",
      benefit3Description: "我们律所主办的网络研讨会、研讨会和社交活动的独家邀请。",
      benefit4Title: "公司新闻",
      benefit4Description: "了解我们的最新成就、新团队成员和社区参与。",
      privacyNote: "我们尊重您的隐私。您的信息绝不会与第三方共享。您可以随时取消订阅。",
      frequency: "通讯频率",
      frequencyDescription: "我们的通讯每月发送一次，偶尔会为紧急法律发展推出特别版。",
    },
    ko: {
      title: "뉴스레터",
      subtitle: "최신 법률 동향과 회사 소식을 받아보세요",
      archivesTitle: "이전 뉴스레터",
      archivesSubtitle: "이전 호에 접근하여 법률 보도를 확인하세요.",
      viewArchive: "뉴스레터 보기",
      formTitle: "뉴스레터 구독",
      formSubtitle: "메일링 리스트에 가입하여 독점 법률 업데이트, 업계 통찰력 및 회사 소식을 받아보세요.",
      emailLabel: "이메일 주소",
      emailPlaceholder: "이메일 주소를 입력하세요",
      firstNameLabel: "이름 (선택사항)",
      firstNamePlaceholder: "이름을 입력하세요",
      lastNameLabel: "성 (선택사항)",
      lastNamePlaceholder: "성을 입력하세요",
      submit: "구독",
      submitting: "구독 중...",
      whatYouReceive: "받으실 내용",
      benefit1Title: "법률 업데이트",
      benefit1Description: "비즈니스에 영향을 미칠 수 있는 멕시코 법률 및 규정의 중요한 변경 사항을 파악하세요.",
      benefit2Title: "업계 통찰력",
      benefit2Description: "주요 분야의 법률 발전에 대한 심층 분석과 논평.",
      benefit3Title: "이벤트 초대",
      benefit3Description: "당사가 주최하는 웨비나, 세미나 및 네트워킹 이벤트에 대한 독점 초대.",
      benefit4Title: "회사 소식",
      benefit4Description: "최신 성과, 새 팀원 및 커뮤니티 참여에 대해 알아보세요.",
      privacyNote: "귀하의 개인정보를 존중합니다. 귀하의 정보는 제3자와 절대 공유되지 않습니다. 언제든지 구독을 취소할 수 있습니다.",
      frequency: "뉴스레터 빈도",
      frequencyDescription: "뉴스레터는 매월 발송되며, 긴급한 법률 발전에 대한 특별판이 가끔 발행됩니다.",
    },
    ja: {
      title: "ニュースレター",
      subtitle: "最新の法律動向とファーム情報をお届けします",
      archivesTitle: "過去のニュースレター",
      archivesSubtitle: "過去の号にアクセスして、法律関連の報道をご覧ください。",
      viewArchive: "ニュースレターを見る",
      formTitle: "ニュースレターを購読する",
      formSubtitle: "メーリングリストに登録して、法律の最新情報、業界インサイト、ファームニュースを直接受信箱にお届けします。",
      emailLabel: "メールアドレス",
      emailPlaceholder: "メールアドレスを入力",
      firstNameLabel: "名（任意）",
      firstNamePlaceholder: "名前を入力",
      lastNameLabel: "姓（任意）",
      lastNamePlaceholder: "姓を入力",
      submit: "購読",
      submitting: "購読中...",
      whatYouReceive: "お届けする内容",
      benefit1Title: "法律アップデート",
      benefit1Description: "ビジネスに影響を与える可能性のあるメキシコの法律・規制の重要な変更について最新情報をお届けします。",
      benefit2Title: "業界インサイト",
      benefit2Description: "主要セクターの法律動向に関する詳細な分析と解説。",
      benefit3Title: "イベント招待",
      benefit3Description: "当ファームが主催するウェビナー、セミナー、ネットワーキングイベントへの独占招待。",
      benefit4Title: "ファームニュース",
      benefit4Description: "最新の実績、新しいチームメンバー、コミュニティへの参加についてご紹介します。",
      privacyNote: "プライバシーを尊重します。お客様の情報は第三者と共有されることはありません。いつでも購読解除できます。",
      frequency: "ニュースレターの頻度",
      frequencyDescription: "ニュースレターは毎月配信され、緊急の法律動向については臨時特別号を発行することがあります。",
    },
    ar: {
      title: "النشرة الإخبارية",
      subtitle: "ابق على اطلاع بأحدث الرؤى القانونية وتحديثات المكتب",
      archivesTitle: "النشرات الإخبارية السابقة",
      archivesSubtitle: "الوصول إلى إصداراتنا السابقة ومتابعة تغطيتنا القانونية.",
      viewArchive: "عرض النشرة الإخبارية",
      formTitle: "اشترك في نشرتنا الإخبارية",
      formSubtitle: "انضم إلى قائمتنا البريدية لتلقي التحديثات القانونية الحصرية ورؤى الصناعة وأخبار المكتب مباشرة في بريدك الإلكتروني.",
      emailLabel: "عنوان البريد الإلكتروني",
      emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
      firstNameLabel: "الاسم الأول (اختياري)",
      firstNamePlaceholder: "أدخل اسمك الأول",
      lastNameLabel: "اسم العائلة (اختياري)",
      lastNamePlaceholder: "أدخل اسم عائلتك",
      submit: "اشترك",
      submitting: "جارٍ الاشتراك...",
      whatYouReceive: "ما ستتلقاه",
      benefit1Title: "التحديثات القانونية",
      benefit1Description: "ابق على اطلاع بالتغييرات المهمة في القانون واللوائح المكسيكية التي قد تؤثر على عملك.",
      benefit2Title: "رؤى الصناعة",
      benefit2Description: "تحليل معمق وتعليقات حول التطورات القانونية في القطاعات الرئيسية.",
      benefit3Title: "دعوات الفعاليات",
      benefit3Description: "دعوات حصرية للندوات عبر الإنترنت والمؤتمرات وفعاليات التواصل التي يستضيفها مكتبنا.",
      benefit4Title: "أخبار المكتب",
      benefit4Description: "تعرف على أحدث إنجازاتنا وأعضاء الفريق الجدد ومشاركتنا المجتمعية.",
      privacyNote: "نحترم خصوصيتك. لن تتم مشاركة معلوماتك مع أطراف ثالثة أبداً. يمكنك إلغاء الاشتراك في أي وقت.",
      frequency: "تكرار النشرة الإخبارية",
      frequencyDescription: "يتم إرسال نشرتنا الإخبارية شهرياً، مع إصدارات خاصة عرضية للتطورات القانونية العاجلة.",
    },
    ru: {
      title: "Рассылка",
      subtitle: "Будьте в курсе последних юридических новостей и обновлений фирмы",
      archivesTitle: "Предыдущие рассылки",
      archivesSubtitle: "Доступ к нашим предыдущим выпускам и актуальная информация о правовом освещении.",
      viewArchive: "Просмотреть рассылку",
      formTitle: "Подпишитесь на нашу рассылку",
      formSubtitle: "Присоединяйтесь к нашему списку рассылки для получения эксклюзивных правовых обновлений, отраслевых аналитических материалов и новостей фирмы.",
      emailLabel: "Адрес электронной почты",
      emailPlaceholder: "Введите ваш адрес электронной почты",
      firstNameLabel: "Имя (необязательно)",
      firstNamePlaceholder: "Введите ваше имя",
      lastNameLabel: "Фамилия (необязательно)",
      lastNamePlaceholder: "Введите вашу фамилию",
      submit: "Подписаться",
      submitting: "Подписка...",
      whatYouReceive: "Что вы получите",
      benefit1Title: "Правовые обновления",
      benefit1Description: "Будьте в курсе важных изменений в мексиканском законодательстве и регулировании, которые могут повлиять на ваш бизнес.",
      benefit2Title: "Отраслевая аналитика",
      benefit2Description: "Углублённый анализ и комментарии по правовым изменениям в ключевых секторах.",
      benefit3Title: "Приглашения на мероприятия",
      benefit3Description: "Эксклюзивные приглашения на вебинары, семинары и сетевые мероприятия нашей фирмы.",
      benefit4Title: "Новости фирмы",
      benefit4Description: "Узнайте о наших последних достижениях, новых членах команды и участии в общественной деятельности.",
      privacyNote: "Мы уважаем вашу конфиденциальность. Ваша информация никогда не будет передана третьим лицам. Вы можете отписаться в любое время.",
      frequency: "Частота рассылки",
      frequencyDescription: "Наша рассылка отправляется ежемесячно, со случайными специальными выпусками для срочных правовых изменений.",
    },
    fr: {
      title: "Newsletter",
      subtitle: "Restez informé des dernières actualités juridiques et mises à jour du cabinet",
      archivesTitle: "Newsletters précédentes",
      archivesSubtitle: "Accédez à nos éditions précédentes et restez informé de notre couverture juridique.",
      viewArchive: "Voir la newsletter",
      formTitle: "Abonnez-vous à notre newsletter",
      formSubtitle: "Rejoignez notre liste de diffusion pour recevoir des mises à jour juridiques exclusives, des analyses sectorielles et des nouvelles du cabinet.",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "Entrez votre adresse e-mail",
      firstNameLabel: "Prénom (optionnel)",
      firstNamePlaceholder: "Entrez votre prénom",
      lastNameLabel: "Nom (optionnel)",
      lastNamePlaceholder: "Entrez votre nom",
      submit: "S'abonner",
      submitting: "Abonnement en cours...",
      whatYouReceive: "Ce que vous recevrez",
      benefit1Title: "Mises à jour juridiques",
      benefit1Description: "Restez informé des changements importants dans la loi et la réglementation mexicaines qui peuvent affecter votre entreprise.",
      benefit2Title: "Analyses sectorielles",
      benefit2Description: "Analyses approfondies et commentaires sur les développements juridiques dans les secteurs clés.",
      benefit3Title: "Invitations aux événements",
      benefit3Description: "Invitations exclusives aux webinaires, séminaires et événements de networking organisés par notre cabinet.",
      benefit4Title: "Actualités du cabinet",
      benefit4Description: "Découvrez nos dernières réalisations, les nouveaux membres de l'équipe et notre engagement communautaire.",
      privacyNote: "Nous respectons votre vie privée. Vos informations ne seront jamais partagées avec des tiers. Vous pouvez vous désabonner à tout moment.",
      frequency: "Fréquence de la newsletter",
      frequencyDescription: "Notre newsletter est envoyée mensuellement, avec des éditions spéciales occasionnelles pour les développements juridiques urgents.",
    },
    it: {
      title: "Newsletter",
      subtitle: "Rimani informato sugli ultimi aggiornamenti legali e novità dello studio",
      archivesTitle: "Newsletter precedenti",
      archivesSubtitle: "Accedi alle nostre edizioni precedenti e rimani aggiornato sulla nostra copertura legale.",
      viewArchive: "Visualizza newsletter",
      formTitle: "Iscriviti alla nostra newsletter",
      formSubtitle: "Unisciti alla nostra mailing list per ricevere aggiornamenti legali esclusivi, approfondimenti del settore e notizie dello studio.",
      emailLabel: "Indirizzo e-mail",
      emailPlaceholder: "Inserisci il tuo indirizzo e-mail",
      firstNameLabel: "Nome (opzionale)",
      firstNamePlaceholder: "Inserisci il tuo nome",
      lastNameLabel: "Cognome (opzionale)",
      lastNamePlaceholder: "Inserisci il tuo cognome",
      submit: "Iscriviti",
      submitting: "Iscrizione in corso...",
      whatYouReceive: "Cosa riceverai",
      benefit1Title: "Aggiornamenti legali",
      benefit1Description: "Rimani aggiornato sui cambiamenti importanti nella legge e nelle normative messicane che potrebbero influenzare la tua attività.",
      benefit2Title: "Approfondimenti di settore",
      benefit2Description: "Analisi approfondite e commenti sugli sviluppi legali nei settori chiave.",
      benefit3Title: "Inviti agli eventi",
      benefit3Description: "Inviti esclusivi a webinar, seminari ed eventi di networking organizzati dal nostro studio.",
      benefit4Title: "Notizie dello studio",
      benefit4Description: "Scopri i nostri ultimi successi, i nuovi membri del team e il coinvolgimento nella comunità.",
      privacyNote: "Rispettiamo la tua privacy. Le tue informazioni non saranno mai condivise con terzi. Puoi annullare l'iscrizione in qualsiasi momento.",
      frequency: "Frequenza della newsletter",
      frequencyDescription: "La nostra newsletter viene inviata mensilmente, con edizioni speciali occasionali per sviluppi legali urgenti.",
    },
  };

  const t = content[language] || content.en;

  // Ediciones vigentes del boletín para "Boletines anteriores" (fecha, título, descripción).
  // Vacía: la sección no se muestra hasta que haya ediciones recientes que enlazar.
  const archiveIssues: { title: string; date: string; description: string }[] = [];

  const benefits = [
    {
      title: t.benefit1Title,
      description: t.benefit1Description,
    },
    {
      title: t.benefit2Title,
      description: t.benefit2Description,
    },
    {
      title: t.benefit3Title,
      description: t.benefit3Description,
    },
    {
      title: t.benefit4Title,
      description: t.benefit4Description,
    },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="page-newsletter">
      <SEOHead page="newsletter" language={language} />
      <Header />
      
      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-newsletter-hero">
        <div className="ss-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <Eyebrow num="04" tone="navy" className="mb-6" />
            <h1 
              className="mb-5"
              data-testid="text-newsletter-title"
            >
              {t.title}
            </h1>
            <p data-testid="text-newsletter-subtitle">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="py-16 lg:py-20">
        <div className="ss-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              data-testid="section-newsletter-form"
            >
              <div>
                  <div className="mb-8">
                    <h2 
                      className={`${h2Class} mb-4`}
                      data-testid="text-form-title"
                    >
                      {t.formTitle}
                    </h2>
                    <p 
                      className="text-base text-ss-tinta leading-relaxed"
                      data-testid="text-form-subtitle"
                    >
                      {t.formSubtitle}
                    </p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-newsletter">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel data-testid="label-firstname">{t.firstNameLabel}</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={t.firstNamePlaceholder} 
                                  {...field} 
                                  data-testid="input-firstname"
                                />
                              </FormControl>
                              <FormMessage data-testid="error-firstname" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel data-testid="label-lastname">{t.lastNameLabel}</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={t.lastNamePlaceholder} 
                                  {...field} 
                                  data-testid="input-lastname"
                                />
                              </FormControl>
                              <FormMessage data-testid="error-lastname" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-email">{t.emailLabel}</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder={t.emailPlaceholder} 
                                {...field} 
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-email" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={newsletterMutation.isPending}
                        data-testid="button-subscribe"
                      >
                        {newsletterMutation.isPending ? t.submitting : t.submit}
                      </Button>

                      <p 
                        className="text-sm text-ss-medio"
                        data-testid="text-privacy-note"
                      >
                        {t.privacyNote}
                      </p>
                    </form>
                  </Form>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8"
              >
                {/* Fila abierta con filete superior, sin caja */}
                <div className="border-t border-ss-rule pt-6" data-testid="card-frequency">
                  <h3 
                    className={`${h3Class} mb-2`}
                    data-testid="text-frequency-title"
                  >
                    {t.frequency}
                  </h3>
                  <p 
                    className="text-base text-ss-tinta leading-[1.55]"
                    data-testid="text-frequency-description"
                  >
                    {t.frequencyDescription}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 
                className={`${h2Class} mb-6`}
                data-testid="text-benefits-title"
              >
                {t.whatYouReceive}
              </h2>

              {/* Filas abiertas: filete superior en Línea, titular en romana y texto en la sans */}
              <div className="border-b border-ss-rule">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    <div
                      className="border-t border-ss-rule py-6"
                      data-testid={`card-benefit-${index}`}
                    >
                      <h3 
                        className={`${h3Class} mb-1`}
                        data-testid={`text-benefit-title-${index}`}
                      >
                        {benefit.title}
                      </h3>
                      <p 
                        className="text-base text-ss-tinta leading-[1.55]"
                        data-testid={`text-benefit-description-${index}`}
                      >
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Boletines anteriores: solo si hay ediciones vigentes. Las únicas publicadas eran de
              2024 (energía y fiscal) con un "archivo completo próximamente": se retiraron. */}
          {archiveIssues.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
            data-testid="section-newsletter-archives"
          >
            <div className="mb-10">
              <h2 
                className={`${h2Class} mb-4`}
                data-testid="text-archives-title"
              >
                {t.archivesTitle}
              </h2>
              <p 
                className="text-base text-ss-tinta leading-relaxed max-w-2xl"
                data-testid="text-archives-subtitle"
              >
                {t.archivesSubtitle}
              </p>
            </div>

            {/* Filas abiertas: fecha en etiqueta, titular en romana */}
            <div className="border-b border-ss-rule">
              {archiveIssues.map((archive, index) => (
                <article
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[12rem,1fr] gap-x-8 gap-y-2 border-t border-ss-rule py-6"
                  data-testid={`card-archive-${index}`}
                >
                  <p 
                    className="ss-label text-ss-medio md:pt-1.5"
                    data-testid={`text-archive-date-${index}`}
                  >
                    {archive.date}
                  </p>
                  <div>
                    <h3 
                      className={`${h3Class} mb-2`}
                      data-testid={`text-archive-title-${index}`}
                    >
                      {archive.title}
                    </h3>
                    <p 
                      className="text-base text-ss-tinta leading-[1.55] mb-4"
                      data-testid={`text-archive-description-${index}`}
                    >
                      {archive.description}
                    </p>
                    <a 
                      href={`mailto:info@santossaucedo.com?subject=${encodeURIComponent(language === 'es' ? `Solicitud de boletín: ${archive.title}` : `Newsletter Request: ${archive.title}`)}`}
                      className="inline-flex items-center text-[15px] font-semibold text-ss-marino underline decoration-ss-rule underline-offset-4 hover:decoration-ss-marino"
                      data-testid={`button-archive-view-${index}`}
                    >
                      {t.viewArchive}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </motion.section>
          )}
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
