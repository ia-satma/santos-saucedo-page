import { useState, useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { FOCUSABLE, useDialog26 } from '@/components/home26/useDialog26';

interface CookieBannerProps {
  language: "en" | "es" | "de" | "zh" | "ko" | "ja" | "ar" | "ru" | "fr" | "it";
}

// Aviso de cookies verdadero (inventario de almacenamiento, ronda 3): el sitio público no
// usa cookies propias ni de terceros, ni analítica ni publicidad. Solo guarda en
// localStorage el idioma (ss_language, ss_language_detected) y esta elección
// (ss_cookie_preferences). Un solo botón, "Entendido"; sin categorías. El enlace
// "Preferencias de cookies" del pie vuelve a abrir el mismo aviso como diálogo modal.
const STORAGE_KEY = 'ss_cookie_preferences';

function readAcknowledged(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function saveAcknowledged() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ acknowledged: true }));
  } catch {}
}

const content: Record<CookieBannerProps['language'], {
  /** Mismo sentido en los 10 idiomas que el texto del inventario en español */
  message: string;
  /** Enlace al Aviso de privacidad (el nombre del pie en cada idioma) */
  privacy: string;
  /** Cierre tras el enlace: punto latino; en chino y japonés, nada (el enlace es un título) */
  end: string;
  accept: string;
  /** Título del diálogo y nombre del banner */
  title: string;
  close: string;
}> = {
  es: {
    message: "Este sitio guarda en su navegador el idioma elegido y esta preferencia. No usa cookies ni servicios de analítica o publicidad.",
    privacy: "Aviso de privacidad",
    end: ".",
    accept: "Entendido",
    title: "Aviso de cookies",
    close: "Cerrar",
  },
  en: {
    message: "This site stores the chosen language and this preference in your browser. It does not use cookies or analytics or advertising services.",
    privacy: "Privacy notice",
    end: ".",
    accept: "Understood",
    title: "Cookie notice",
    close: "Close",
  },
  de: {
    message: "Diese Website speichert in Ihrem Browser die gewählte Sprache und diese Einstellung. Sie verwendet keine Cookies und keine Analyse- oder Werbedienste.",
    privacy: "Datenschutzhinweis",
    end: ".",
    accept: "Verstanden",
    title: "Cookie-Hinweis",
    close: "Schließen",
  },
  zh: {
    message: "本网站在您的浏览器中保存所选语言和此项设置。本网站不使用 Cookie，也不使用分析或广告服务。",
    privacy: "隐私声明",
    end: "",
    accept: "知道了",
    title: "Cookie 声明",
    close: "关闭",
  },
  ko: {
    message: "이 사이트는 선택한 언어와 이 설정을 브라우저에 저장합니다. 쿠키나 분석 또는 광고 서비스는 사용하지 않습니다.",
    privacy: "개인정보 처리방침",
    end: ".",
    accept: "확인",
    title: "쿠키 안내",
    close: "닫기",
  },
  ja: {
    message: "このサイトは、選択された言語とこの設定をお使いのブラウザに保存します。Cookie、アクセス解析サービス、広告サービスは使用していません。",
    privacy: "プライバシーポリシー",
    end: "",
    accept: "了解しました",
    title: "Cookieについて",
    close: "閉じる",
  },
  ar: {
    message: "يحفظ هذا الموقع في متصفحك اللغة المختارة وهذا التفضيل. ولا يستخدم ملفات تعريف الارتباط ولا خدمات التحليل أو الإعلان.",
    privacy: "إشعار الخصوصية",
    end: ".",
    accept: "حسنًا",
    title: "إشعار ملفات تعريف الارتباط",
    close: "إغلاق",
  },
  ru: {
    message: "Этот сайт сохраняет в вашем браузере выбранный язык и эту настройку. Он не использует файлы cookie и сервисы аналитики или рекламы.",
    privacy: "Политика конфиденциальности",
    end: ".",
    accept: "Понятно",
    title: "Уведомление о файлах cookie",
    close: "Закрыть",
  },
  fr: {
    message: "Ce site enregistre dans votre navigateur la langue choisie et cette préférence. Il n’utilise ni cookies ni services d’analyse ou de publicité.",
    privacy: "Politique de confidentialité",
    end: ".",
    accept: "Compris",
    title: "Avis sur les cookies",
    close: "Fermer",
  },
  it: {
    message: "Questo sito memorizza nel browser la lingua scelta e questa preferenza. Non utilizza cookie né servizi di analisi o pubblicità.",
    privacy: "Informativa sulla privacy",
    end: ".",
    accept: "Ho capito",
    title: "Informativa sui cookie",
    close: "Chiudi",
  },
};

// Quién abrió el diálogo (p. ej. "Preferencias de cookies" del pie): ahí vuelve el foco
type Opener = HTMLElement | null;

const buttonCls =
  "min-h-[44px] px-5 py-2 font-sans text-[15px] font-semibold leading-none tracking-[0.01em] transition-colors touch-manipulation border border-white bg-white text-ss-navy hover:bg-white/90";

export default function CookieBanner({ language }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const openRef = useRef(false);
  openRef.current = dialogOpen;
  const openerRef = useRef<Opener>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const bannerShown = visible && !dialogOpen;
  const uid = useId();
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = content[language] || content.en;
  // Tras 。 (chino, japonés) no va espacio antes del enlace
  const sep = language === 'zh' || language === 'ja' ? '' : ' ';

  // Primera visita (nada guardado): el aviso aparece abajo a los 2 s
  useEffect(() => {
    if (readAcknowledged()) return;
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const openDialog = (opener: Opener) => {
    if (openRef.current) return;
    openRef.current = true;
    openerRef.current = opener;
    setDialogOpen(true);
  };

  // Abre el aviso como diálogo desde fuera (enlace "Preferencias de cookies" del pie)
  useEffect(() => {
    const open = () =>
      openDialog(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    window.addEventListener('ss:open-cookie-preferences', open);
    return () => window.removeEventListener('ss:open-cookie-preferences', open);
  }, []);

  // "Entendido": se guarda la elección y se cierran banner y diálogo
  const acknowledge = () => {
    saveAcknowledged();
    setVisible(false);
    setDialogOpen(false);
  };

  // Escape, X o clic en el velo: cierra el diálogo sin más (si el banner seguía pendiente,
  // vuelve a verse)
  const closeDialog = () => setDialogOpen(false);

  // Mientras el banner está a la vista, el foco del teclado no debe quedar debajo de él
  // (WCAG 2.4.11): <html> reserva su alto abajo en scroll-padding (el navegador sube el
  // control enfocado) y <body> en padding (para llegar a lo último de la página)
  useEffect(() => {
    const banner = bannerRef.current;
    if (!bannerShown || !banner) return;
    const root = document.documentElement;
    const reserve = () => {
      const h = `${banner.offsetHeight}px`;
      root.style.scrollPaddingBottom = h;
      document.body.style.paddingBottom = h;
    };
    reserve();
    const observer = new ResizeObserver(reserve);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      root.style.scrollPaddingBottom = '';
      document.body.style.paddingBottom = '';
    };
  }, [bannerShown]);

  // Al cerrar (o desmontar) el diálogo, el foco vuelve a quien lo abrió
  const restoreFocus = () => {
    const opener = openerRef.current;
    openerRef.current = null;
    if (opener && opener.isConnected && opener !== document.body) {
      opener.focus();
      return;
    }
    // Sin destino: el foco sale del diálogo, que se va
    if (dialogRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement).blur();
    }
  };

  // Diálogo modal: #root inerte, foco atrapado, Escape cierra, el foco vuelve al cerrar
  useDialog26(dialogOpen, dialogRef, {
    initialFocus: () => titleRef.current,
    onEscape: closeDialog,
    onClosed: restoreFocus,
  });

  // El título (tabIndex -1) no está en la trampa de useDialog26: Shift+Tab desde él
  // saldría del documento, así que salta al último control del diálogo
  const onDialogKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !e.shiftKey || e.target !== titleRef.current) return;
    const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (el) => el.getClientRects().length > 0,
    );
    const last = nodes[nodes.length - 1];
    if (!last) return;
    e.preventDefault();
    last.focus();
  };

  // Texto y enlace al Aviso de privacidad (Link de wouter: respeta la base del router,
  // /santos-saucedo-page/ en Pages). En el diálogo, seguir el enlace lo cierra.
  const notice = (testId: string, onNavigate?: () => void) => (
    <>
      {t.message}{sep}
      <Link
        href="/privacy-policy"
        onClick={onNavigate}
        className="underline underline-offset-4 decoration-white/40 text-white hover:decoration-white transition-colors"
        data-testid={testId}
      >
        {t.privacy}
      </Link>
      {t.end}
    </>
  );

  return (
    <>
      {/* Banner inferior: no modal, la página sigue usable. .ss26 le da el foco lima y la
          tipografía del sistema 2026 también en las páginas internas (va fuera de su .ss26) */}
      <AnimatePresence>
        {bannerShown && (
          <motion.div
            key="banner"
            ref={bannerRef}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="ss26 fixed bottom-0 left-0 w-full bg-ss-navy text-white py-5 z-[60] border-t border-white/15"
            role="region"
            aria-label={t.title}
            lang={language}
            dir={dir}
            data-testid="banner-cookie-consent"
          >
            {/* Mismo contenedor que cabecera, páginas y pie (.ss-container): bordes alineados con el logotipo */}
            <div className="ss-container flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <p className="text-[15px] leading-relaxed text-white/85 flex-1">
                {notice('link-privacy-policy')}
              </p>
              <button
                type="button"
                onClick={acknowledge}
                className={`${buttonCls} shrink-0`}
                data-testid="button-cookie-accept"
              >
                {t.accept}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* El mismo aviso como diálogo modal en body (lo abre el pie). .ss26 da la tipografía
          y el foco visible del sistema 2026 fuera de la página. */}
      {createPortal(
        <AnimatePresence>
          {dialogOpen && (
            <motion.div
              key="dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="ss26 fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
              data-testid="modal-cookie-preferences-overlay"
              onClick={closeDialog}
            >
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                lang={language}
                dir={dir}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-ss-navy text-white w-full max-w-xl max-h-[90vh] overflow-y-auto border border-white/15"
                data-testid="modal-cookie-preferences"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={onDialogKeyDown}
              >
                <div className="flex items-center justify-between gap-4 p-6 border-b border-white/10">
                  {/* Recibe el foco al abrir; no es un control, así que sin contorno */}
                  <h2
                    ref={titleRef}
                    id={titleId}
                    tabIndex={-1}
                    className="font-heading text-2xl font-normal leading-tight tracking-[-0.01em] text-white outline-none focus-visible:!outline-none focus-visible:!shadow-none"
                    data-testid="text-preferences-title"
                  >
                    {t.title}
                  </h2>
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center hover:bg-white/10 transition-colors touch-manipulation"
                    data-testid="button-close-preferences"
                    aria-label={t.close}
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-6">
                  <p id={descriptionId} className="text-[15px] leading-relaxed text-white/85" data-testid="text-preferences-description">
                    {notice('link-privacy-policy-dialog', closeDialog)}
                  </p>
                  <button
                    type="button"
                    onClick={acknowledge}
                    className={`${buttonCls} mt-6`}
                    data-testid="button-accept-all-preferences"
                  >
                    {t.accept}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
