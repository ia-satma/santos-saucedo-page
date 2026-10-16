import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest, isStaticSite, queryClient } from "@/lib/queryClient";
import { isNativeLanguage, type ContentType, type TranslatedFieldsMap } from "@/lib/translationUtils";
import type { LanguageCode } from "@shared/schema";

interface TranslationResponse {
  translations: Record<string, string>;
  contentType: string;
  entityId: string;
  targetLanguage: string;
}

interface TranslateEntityResponse {
  translations: Record<string, string>;
  contentType: string;
  entityId: string;
  targetLanguage: string;
  cachedCount: number;
  translatedCount: number;
}

interface UseTranslatedContentOptions {
  contentType: ContentType;
  entityId: string;
  fields: TranslatedFieldsMap;
  enabled?: boolean;
  /** Idioma en que se muestra el bloque cuando no es el de la interfaz (la portada muestra es/en) */
  language?: LanguageCode;
}

interface UseTranslatedContentReturn {
  translatedFields: TranslatedFieldsMap;
  isLoading: boolean;
  isTranslating: boolean;
  isTranslationPending: boolean;
  /** true solo si llegó de verdad una traducción (algún campo distinto del texto de origen) */
  hasTranslation: boolean;
  error: Error | null;
}

// Español e inglés son los idiomas de origen de los datos: nunca se traducen automáticamente.
function isSourceLanguage(lang: string): boolean {
  return isNativeLanguage(lang) || lang === 'en';
}

export function useTranslatedContent({
  contentType,
  entityId,
  fields,
  enabled = true,
  language: languageOverride,
}: UseTranslatedContentOptions): UseTranslatedContentReturn {
  const { language: interfaceLanguage } = useLanguage();
  const language = languageOverride ?? interfaceLanguage;

  const isSource = isSourceLanguage(language);
  const canTranslate = enabled && !isStaticSite && !isSource && !!entityId;

  const { data: cachedTranslations, isLoading } = useQuery<TranslationResponse>({
    queryKey: ['/api/translations', contentType, entityId, language],
    enabled: canTranslate,
  });

  const translateMutation = useMutation({
    mutationFn: async (data: {
      contentType: string;
      entityId: string;
      fields: Record<string, string>;
      sourceLanguage: string;
      targetLanguage: string;
    }) => {
      const response = await apiRequest('POST', '/api/translate-entity', data);
      // Sin servicio de traducción el servidor puede responder sin cuerpo: se queda el origen
      if (response.status === 204) return null;
      return response.json() as Promise<TranslateEntityResponse>;
    },
    onSuccess: (data) => {
      if (!data?.translations) return;
      queryClient.setQueryData(
        ['/api/translations', contentType, entityId, language],
        { 
          translations: data.translations, 
          contentType: data.contentType, 
          entityId: data.entityId, 
          targetLanguage: data.targetLanguage 
        }
      );
    },
  });

  const lastTranslationKeyRef = useRef<string>('');
  const previousLanguageRef = useRef<string>(language);

  useEffect(() => {
    if (previousLanguageRef.current !== language) {
      lastTranslationKeyRef.current = '';
      previousLanguageRef.current = language;
    }
  }, [language]);

  const fieldsToTranslate = useMemo(() => {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value && typeof value === 'string' && value.trim() && !key.endsWith('Es')) {
        result[key] = value;
      }
    }
    return result;
  }, [fields]);

  const hasCachedTranslations = !!cachedTranslations?.translations && 
    Object.keys(cachedTranslations.translations).length > 0;
  
  const needsTranslation = canTranslate && !isLoading &&
    !hasCachedTranslations && Object.keys(fieldsToTranslate).length > 0;

  const translationKey = `${contentType}-${entityId}-${language}`;

  useEffect(() => {
    if (needsTranslation && !translateMutation.isPending && lastTranslationKeyRef.current !== translationKey) {
      lastTranslationKeyRef.current = translationKey;
      translateMutation.mutate({
        contentType,
        entityId,
        fields: fieldsToTranslate,
        sourceLanguage: 'es',
        targetLanguage: language,
      });
    }
  }, [needsTranslation, translateMutation.isPending, contentType, entityId, fieldsToTranslate, language, translationKey]);

  // Traducciones solo para idiomas que no son de origen
  const translations = canTranslate
    ? cachedTranslations?.translations || translateMutation.data?.translations
    : undefined;

  // Hubo traducción si algún campo llegó con texto propio distinto del de origen
  const hasTranslation = !!translations && Object.entries(fieldsToTranslate).some(
    ([key, value]) => typeof translations[key] === 'string' && translations[key].trim() !== '' && translations[key] !== value,
  );

  const getTranslatedFields = (): TranslatedFieldsMap => {
    if (isNativeLanguage(language)) {
      const esFields: TranslatedFieldsMap = {};
      for (const [key, value] of Object.entries(fields)) {
        if (key.endsWith('Es')) {
          const baseKey = key.slice(0, -2);
          esFields[baseKey] = value ?? fields[baseKey];
        } else if (!fields[`${key}Es`]) {
          esFields[key] = value;
        }
      }
      return esFields;
    }

    // Inglés y demás idiomas: el texto de origen (inglés) de inmediato, sin campos vacíos
    // mientras se espera; la traducción lo sustituye solo si llega.
    const result: TranslatedFieldsMap = {};
    for (const [key, value] of Object.entries(fields)) {
      if (!key.endsWith('Es')) {
        const translated = hasTranslation ? translations?.[key] : undefined;
        result[key] = translated && translated.trim() ? translated : value;
      }
    }
    return result;
  };

  const isTranslationPending = canTranslate && (isLoading || translateMutation.isPending || needsTranslation);

  return {
    translatedFields: getTranslatedFields(),
    isLoading: canTranslate && isLoading,
    isTranslating: canTranslate && translateMutation.isPending,
    isTranslationPending,
    hasTranslation,
    error: translateMutation.error as Error | null,
  };
}

export function useSingleTranslation() {
  const { language } = useLanguage();

  const translateMutation = useMutation({
    mutationFn: async (data: {
      contentType: string;
      entityId: string;
      field: string;
      sourceText: string;
      sourceLanguage: string;
      targetLanguage: string;
    }) => {
      const response = await apiRequest('POST', '/api/translate-content', data);
      return response.json();
    },
  });

  const translate = (
    contentType: string,
    entityId: string,
    field: string,
    sourceText: string
  ) => {
    if (isNativeLanguage(language) || isStaticSite) {
      return Promise.resolve(sourceText);
    }

    return translateMutation.mutateAsync({
      contentType,
      entityId,
      field,
      sourceText,
      sourceLanguage: 'en',
      targetLanguage: language,
    }).then(res => res.translation);
  };

  return {
    translate,
    isTranslating: translateMutation.isPending,
    error: translateMutation.error as Error | null,
  };
}
