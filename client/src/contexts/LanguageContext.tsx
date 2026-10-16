import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LanguageCode, type SupportedLanguage } from "@shared/schema";
import { isStaticSite } from "@/lib/queryClient";

type DisplayLanguage = "en" | "es";

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
  if (lang === "es") return "es";
  return "en";
}

const HTML_LANG_CODES: Record<LanguageCode, string> = {
  en: "en",
  es: "es-MX",
  de: "de",
  zh: "zh-CN",
  ko: "ko",
  ja: "ja",
  ar: "ar",
  ru: "ru",
  fr: "fr",
  it: "it",
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n: i18nInstance, ready } = useTranslation();
  const initializedRef = useRef(false);
  const detectionRef = useRef(false);
  
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const stored = getStoredLanguage();
    return stored || DEFAULT_LANGUAGE;
  });
  
  const [isDetecting, setIsDetecting] = useState(false);

  const displayLanguage = getDisplayLanguage(language);

  const setLanguage = useCallback((lang: LanguageCode) => {
    if (lang === language) return;
    
    setLanguageState(lang);
    
    if (i18nInstance.language !== lang) {
      i18nInstance.changeLanguage(lang);
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
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
    let alreadyDetected: string | null = null;
    try {
      alreadyDetected = localStorage.getItem(DETECTION_KEY);
    } catch {
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
    
    if (stored) {
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
    }
  }, [ready, i18nInstance, language]);

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
