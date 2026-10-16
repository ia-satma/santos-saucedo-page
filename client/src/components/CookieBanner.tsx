import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCmsContent } from "@/hooks/useCmsContent";
import defaults from "@shared/cms-defaults.json";
import type { LanguageCode } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CONSENT_KEY,
  createChoice,
  parseChoice,
  rejected,
  type Categories,
} from "@/features/privacy/consentState";
import { applyTracking } from "@/features/privacy/tracking";
export default function CookieBanner({ language }: { language: LanguageCode }) {
  const settings = useCmsContent("consent", defaults.consent),
    integrations = useCmsContent("integrations", defaults.integrations);
  const [path] = useLocation();
  const [choice, setChoice] = useState<Categories>(rejected),
    [hasChoice, setHasChoice] = useState(false),
    [open, setOpen] = useState(false),
    [draft, setDraft] = useState<Categories>(rejected);
  const t = settings.labels[language as "es" | "en"] || settings.labels.en;
  useEffect(() => {
    const refresh = () => {
      let raw = null;
      try {
        raw = localStorage.getItem(CONSENT_KEY);
      } catch {}
      const saved = parseChoice(raw, settings, integrations);
      setHasChoice(Boolean(saved));
      setChoice(saved?.categories || rejected);
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [settings, integrations]);
  useEffect(() => {
    applyTracking(integrations, settings.enabled ? choice : rejected);
  }, [choice, settings.enabled, integrations, path]);
  useEffect(() => {
    const fn = () => {
      setDraft(choice);
      setOpen(true);
    };
    window.addEventListener("ss:open-cookie-preferences", fn);
    return () => window.removeEventListener("ss:open-cookie-preferences", fn);
  }, [choice]);
  const save = (categories: Categories) => {
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify(createChoice(categories, settings, integrations)),
      );
    } catch {}
    setChoice(categories);
    setHasChoice(true);
    setOpen(false);
    applyTracking(integrations, categories, true);
    window.dispatchEvent(
      new CustomEvent("ss:consent-changed", { detail: categories }),
    );
  };
  if (path.startsWith("/admin")) return null;
  const button =
    "min-h-11 border border-white/40 px-4 py-2 text-base hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <>
      {settings.enabled && !hasChoice && !open && (
        <section
          className="ss26 fixed inset-x-0 bottom-0 z-[60] border-t border-white/20 bg-ss-navy text-white"
          aria-label={t.title}
          data-testid="banner-cookie-consent"
          lang={language}
        >
          <div className="ss-container py-6 space-y-4">
            <p className="text-base max-w-4xl">
              {t.body}{" "}
              <Link href="/privacy-policy" className="underline">
                {t.policy}
              </Link>
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className={button}
                onClick={() =>
                  save({ analytics: true, external: true, leadinfo: true })
                }
                data-testid="button-cookie-accept"
              >
                {t.acceptAll}
              </button>
              <button
                className={button}
                onClick={() => save(rejected)}
                data-testid="button-cookie-reject"
              >
                {t.rejectOptional}
              </button>
              <button
                className={button}
                onClick={() => {
                  setDraft(choice);
                  setOpen(true);
                }}
                data-testid="button-cookie-configure"
              >
                {t.configure}
              </button>
            </div>
          </div>
        </section>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          closeLabel={t.close}
          className="max-w-xl max-h-[90dvh] overflow-y-auto"
          data-testid="modal-cookie-preferences"
        >
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.body}</DialogDescription>
          <div className="border-t py-4">
            <h3 className="font-semibold">{t.essential}</h3>
            <p className="text-sm mt-2">{t.essentialDescription}</p>
          </div>
          {(["analytics", "external", "leadinfo"] as const)
            .filter((k) => k !== "leadinfo" || integrations.leadinfo.enabled)
            .map((key) => (
              <label
                key={key}
                className="flex items-start justify-between gap-5 border-t py-4"
              >
                <span>
                  <strong className="block">{t[key]}</strong>
                  <span className="block text-sm mt-2">
                    {t[`${key}Description`]}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={draft[key]}
                  className="mt-1 h-5 w-5 shrink-0"
                  data-testid={`cookie-${key}`}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.checked })
                  }
                />
              </label>
            ))}
          <div className="flex flex-wrap gap-3">
            <button
              className="min-h-11 border px-4 py-2"
              onClick={() => save(draft)}
              data-testid="button-cookie-save"
            >
              {t.save}
            </button>
            <button
              className="min-h-11 border px-4 py-2"
              onClick={() => save(rejected)}
            >
              {t.rejectOptional}
            </button>
          </div>
          <Link href="/privacy-policy" className="underline">
            {t.policy}
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}
