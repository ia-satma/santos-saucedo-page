import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import defaults from "@shared/cms-defaults.json";
import { Button } from "@/components/ui/button";
export default function NewsletterUnsubscribe() {
  const { language } = useLanguage();
  const copy = useCmsContent("forms", defaults.forms).unsubscribe;
  const t = copy[language as "es" | "en"] || copy.en;
  const [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError(false);
    try {
      const r = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: new URLSearchParams(window.location.search).get("token"),
        }),
      });
      if (!r.ok) throw new Error();
      setDone(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="ss-container py-24 max-w-3xl space-y-6"
      >
        <h1>{t.title}</h1>
        {done ? (
          <p role="status">{t.success}</p>
        ) : (
          <>
            <p>{t.body}</p>
            <Button disabled={busy} onClick={() => void submit()}>
              {t.submit}
            </Button>
          </>
        )}
        {error && <p role="alert">{t.error}</p>}
      </main>
      <Footer />
    </>
  );
}
