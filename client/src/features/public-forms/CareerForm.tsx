import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import defaults from "@shared/cms-defaults.json";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export function CareerForm({ source = "careers" }: { source?: string }) {
  const { language } = useLanguage();
  const settings = useCmsContent("forms", defaults.forms).careers;
  const t = settings.labels[language as "es" | "en"] || settings.labels.en;
  const [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false),
    [error, setError] = useState("");
  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const body = new FormData(form);
    const file = body.get("cv");
    if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024) {
      setError(t.error);
      return;
    }
    body.set("preferredLanguage", language);
    body.set("consent", body.get("consent") === "true" ? "true" : "false");
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/careers/apply", { method: "POST", body });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || t.error);
      setSuccess(true);
      form.reset();
    } catch (e) {
      setError(
        `${t.error} ${(e as Error).message === t.error ? "" : (e as Error).message}`,
      );
    } finally {
      setBusy(false);
    }
  };
  if (!settings.enabled)
    return (
      <p role="status" className="mt-8">
        {settings.disabledMessage[language as "es" | "en"] ||
          settings.disabledMessage.en}
      </p>
    );
  return (
    <section
      className="mt-12 border-t border-ss-rule pt-10"
      data-testid="career-application-form"
    >
      <h3 className="ss-h3 mb-6">{t.title}</h3>
      {success ? (
        <p role="status" className="py-5">
          {t.success}
        </p>
      ) : (
        <form onSubmit={send} className="space-y-6 max-w-2xl">
          <div className="grid gap-5 sm:grid-cols-2">
            {(["fullName", "email", "phone", "interest"] as const).map(
              (key) => (
                <label key={key} className="space-y-2">
                  <span>{key === "fullName" ? t.name : t[key]}</span>
                  <Input
                    name={key}
                    type={
                      key === "email"
                        ? "email"
                        : key === "phone"
                          ? "tel"
                          : "text"
                    }
                    required={key === "fullName" || key === "email"}
                    minLength={key === "fullName" ? 2 : undefined}
                    maxLength={
                      key === "fullName"
                        ? 200
                        : key === "email"
                          ? 254
                          : key === "phone"
                            ? 60
                            : 180
                    }
                    autoComplete={
                      key === "fullName"
                        ? "name"
                        : key === "email"
                          ? "email"
                          : key === "phone"
                            ? "tel"
                            : "off"
                    }
                  />
                </label>
              ),
            )}
          </div>
          <label className="block space-y-2">
            <span>{t.message}</span>
            <Textarea name="message" maxLength={12000} />
          </label>
          <label className="block space-y-2">
            <span>{t.cv}</span>
            <Input
              name="cv"
              type="file"
              accept="application/pdf,.pdf"
              required
            />
          </label>
          <div className="hidden" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="flex items-start gap-3">
            <input
              name="consent"
              type="checkbox"
              value="true"
              required
              className="mt-1 h-5 w-5"
            />
            <Link href="/privacy-policy" target="_blank" className="underline">
              {t.consent}
            </Link>
          </label>
          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={busy}
            data-testid={`submit-application-${source}`}
          >
            {busy ? t.sending : t.submit}
          </Button>
        </form>
      )}
    </section>
  );
}
