import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LanguageCode, type SupportedLanguage } from "@shared/constants";
import { isStaticSite } from "@/lib/queryClient";
import { navigate as browserNavigate } from "wouter/use-browser-location";
import { getLanguageFromPath, localizeHref, localizedPath, stripLanguagePrefix } from "@/lib/localeRouting";

type DisplayLanguage = LanguageCode;

interface LanguageContextType {
  language: LanguageCode;
  displayLanguage: DisplayLanguage;
  setLanguage: (lang: LanguageCode) => void;
  getLanguageInfo: () => SupportedLanguage;
  isDetecting: boolean;
}

const STORAGE_KEY = "ss_language";
const DETECTION_KEY = "ss_language_detected";
// Español por defecto (también lo que responde /api/detect-language si Accept-Language
// no trae ninguno de los 10 idiomas del sitio)
const DEFAULT_LANGUAGE: LanguageCode = "es";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const validLanguageCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);

function isValidLanguageCode(code: string): code is LanguageCode {
  return validLanguageCodes.includes(code as LanguageCode);
}

function getStoredLanguage(): LanguageCode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidLanguageCode(stored)) {
      return stored;
    }
  } catch {
  }
  return null;
}

interface LanguageProviderProps {
  children: ReactNode;
}

function getDisplayLanguage(lang: LanguageCode): DisplayLanguage {
  return lang;
}

const HTML_LANG_CODES: Record<LanguageCode, string> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map(({ code, locale }) => [code, locale]),
) as Record<LanguageCode, string>;

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n: i18nInstance, ready } = useTranslation();
  const initializedRef = useRef(false);
  const detectionRef = useRef(false);
  
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const pathLanguage = typeof window !== "undefined" ? getLanguageFromPath(window.location.pathname) : null;
    const stored = getStoredLanguage();
    return pathLanguage || stored || DEFAULT_LANGUAGE;
  });
  
  const [isDetecting, setIsDetecting] = useState(false);

  const displayLanguage = getDisplayLanguage(language);

  const setLanguage = useCallback((lang: LanguageCode) => {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
    const isAdmin = /^\/(?:[^/]+\/)?admin(?:\/|$)/.test(pathname);
    const currentRouteLanguage = typeof window !== "undefined" ? getLanguageFromPath(pathname) : null;
    const shouldNavigate = !isAdmin && (currentRouteLanguage !== lang || lang !== language);
    if (lang === language && !shouldNavigate) return;
    
    setLanguageState(lang);
    
    if (i18nInstance.language !== lang) {
      i18nInstance.changeLanguage(lang);
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
    }
    if (shouldNavigate && typeof window !== "undefined") {
      const route = stripLanguagePrefix(pathname);
      browserNavigate(localizedPath(lang, route) + window.location.search + window.location.hash);
    }
  }, [language, i18nInstance]);

  const getLanguageInfo = useCallback((): SupportedLanguage => {
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === language);
    return langInfo || SUPPORTED_LANGUAGES[0];
  }, [language]);

  // Detección en la primera visita: el servidor solo mira la cabecera Accept-Language
  // del navegador (sin geolocalización ni terceros)
  useEffect(() => {
    if (!ready || detectionRef.current) return;
    detectionRef.current = true;
    
    const stored = getStoredLanguage();
    const pathLanguage = typeof window !== "undefined" ? getLanguageFromPath(window.location.pathname) : null;
    let alreadyDetected: string | null = null;
    try {
      alreadyDetected = localStorage.getItem(DETECTION_KEY);
    } catch {
    }
    
    // A locale in the URL is authoritative. It also gives crawlers a stable language
    // without depending on localStorage or Accept-Language.
    if (pathLanguage) {
      if (pathLanguage !== language) {
        setLanguageState(pathLanguage);
        i18nInstance.changeLanguage(pathLanguage);
      }
      try { localStorage.setItem(STORAGE_KEY, pathLanguage); } catch {}
      return;
    }
    // Only detect if no stored preference AND we haven't detected before
    if (stored || alreadyDetected || isStaticSite) return;
    
    const detectLanguage = async () => {
      setIsDetecting(true);
      try {
        const response = await fetch("/api/detect-language");
        if (response.ok) {
          const data = await response.json();
          const detectedLang = data.language as string;
          
          if (isValidLanguageCode(detectedLang) && detectedLang !== DEFAULT_LANGUAGE) {
            setLanguageState(detectedLang);
            i18nInstance.changeLanguage(detectedLang);
            try {
              localStorage.setItem(STORAGE_KEY, detectedLang);
            } catch {
            }
          }
        }
      } catch {
        // Silently fail - user can manually select language
      } finally {
        try {
          localStorage.setItem(DETECTION_KEY, "true");
        } catch {
        }
        setIsDetecting(false);
      }
    };
    
    detectLanguage();
  }, [ready, i18nInstance]);
  
  // Standard initialization from stored preference
  useEffect(() => {
    if (!ready || initializedRef.current) return;
    initializedRef.current = true;
    
    const stored = getStoredLanguage();
    const pathLanguage = typeof window !== "undefined" ? getLanguageFromPath(window.location.pathname) : null;
    
    if (pathLanguage) {
      if (pathLanguage !== language) setLanguageState(pathLanguage);
      if (i18nInstance.language !== pathLanguage) i18nInstance.changeLanguage(pathLanguage);
      try { localStorage.setItem(STORAGE_KEY, pathLanguage); } catch {}
    } else if (stored) {
      if (stored !== language) {
        setLanguageState(stored);
      }
      if (i18nInstance.language !== stored) {
        i18nInstance.changeLanguage(stored);
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, language);
      } catch {
      }
      if (i18nInstance.language !== language) {
        i18nInstance.changeLanguage(language);
      }
      if (typeof window !== "undefined" && !/^\/(?:[^/]+\/)?admin(?:\/|$)/.test(window.location.pathname)) {
        const route = stripLanguagePrefix(window.location.pathname);
        const target = localizedPath(language, route);
        if (target !== window.location.pathname) {
          browserNavigate(target + window.location.search + window.location.hash);
        }
      }
    }
  }, [ready, i18nInstance, language]);

  // Browser back/forward and direct links can change the locale segment without
  // remounting the provider. Keep the visible copy synchronized with that URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromPath = () => {
      const pathLanguage = getLanguageFromPath(window.location.pathname);
      if (pathLanguage && pathLanguage !== language) {
        setLanguageState(pathLanguage);
        if (i18nInstance.language !== pathLanguage) i18nInstance.changeLanguage(pathLanguage);
        try { localStorage.setItem(STORAGE_KEY, pathLanguage); } catch {}
      }
    };
    window.addEventListener("popstate", syncFromPath);
    return () => window.removeEventListener("popstate", syncFromPath);
  }, [i18nInstance, language]);

  // Wouter links and legacy anchors share one localization rule. Rewriting the
  // rendered hrefs keeps internal links crawlable with the active locale.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const rewrite = () => {
      document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (!href) return;
        const localized = localizeHref(href, language);
        if (localized !== href) anchor.setAttribute("href", localized);
      });
    };
    rewrite();
    const observer = new MutationObserver(rewrite);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const langCode = HTML_LANG_CODES[language] || language;
    htmlElement.setAttribute("lang", langCode);
    
    if (language === "ar") {
      htmlElement.setAttribute("dir", "rtl");
    } else {
      htmlElement.setAttribute("dir", "ltr");
    }
  }, [language]);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      if (isValidLanguageCode(lng) && lng !== language) {
        setLanguageState(lng);
        try {
          localStorage.setItem(STORAGE_KEY, lng);
        } catch {
        }
      }
    };

    i18nInstance.on('languageChanged', handleLanguageChanged);
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChanged);
    };
  }, [i18nInstance, language]);

  return (
    <LanguageContext.Provider value={{ language, displayLanguage, setLanguage, getLanguageInfo, isDetecting }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

/** Keep administrative labels in Spanish without changing the visitor language. */
export function AdminLanguageScope({children}:{children:ReactNode}) {
 const parent=useLanguage();
 return <LanguageContext.Provider value={{...parent,language:"es",displayLanguage:"es",getLanguageInfo:()=>SUPPORTED_LANGUAGES.find(l=>l.code==="es")!}}>{children}</LanguageContext.Provider>;
}
