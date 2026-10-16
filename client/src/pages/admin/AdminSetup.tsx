import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, UserPlus } from "lucide-react";

// Alta de una cuenta del panel (super_admin) por /api/admin/init. El servidor solo la acepta
// mientras el secreto ALLOW_ADMIN_INIT vale "true" en Replit; se enciende para dar de alta a
// alguien y se apaga después. Así cada persona escribe su propia contraseña aquí, sin pasarla
// por correo ni por chat.

const MIN_PASSWORD = 12;

const translations = {
  es: {
    title: "Alta en el panel",
    description: "Cree su propia cuenta del panel del despacho. La contraseña no se comparte con nadie.",
    email: "Correo electrónico",
    password: "Contraseña",
    confirm: "Repita la contraseña",
    passwordHint: `Al menos ${MIN_PASSWORD} caracteres.`,
    submit: "Crear cuenta",
    submitting: "Creando cuenta…",
    invalidEmail: "Escriba un correo electrónico válido.",
    tooShort: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`,
    mismatch: "Las contraseñas no coinciden.",
    disabled: "El alta de cuentas está apagada. Pida que la enciendan y vuelva a intentarlo.",
    exists: "Ya existe una cuenta con ese correo. Entre con ella desde el inicio de sesión.",
    failed: "No se pudo crear la cuenta. Inténtelo de nuevo.",
    done: "Cuenta creada. Ya puede entrar al panel.",
    goLogin: "Ir al inicio de sesión",
  },
  en: {
    title: "Panel sign-up",
    description: "Create your own account for the firm's panel. Your password is not shared with anyone.",
    email: "Email",
    password: "Password",
    confirm: "Repeat the password",
    passwordHint: `At least ${MIN_PASSWORD} characters.`,
    submit: "Create account",
    submitting: "Creating account…",
    invalidEmail: "Enter a valid email address.",
    tooShort: `The password must have at least ${MIN_PASSWORD} characters.`,
    mismatch: "The passwords do not match.",
    disabled: "Account sign-up is turned off. Ask for it to be turned on and try again.",
    exists: "An account with that email already exists. Sign in with it instead.",
    failed: "The account could not be created. Please try again.",
    done: "Account created. You can now sign in to the panel.",
    goLogin: "Go to sign in",
  },
};

export default function AdminSetup() {
  const { language } = useLanguage();
  const t = language === "es" ? translations.es : translations.en;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return setError(t.invalidEmail);
    if (password.length < MIN_PASSWORD) return setError(t.tooShort);
    if (password !== confirm) return setError(t.mismatch);

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: address, password }),
      });
      if (res.ok) {
        setDone(true);
        setPassword("");
        setConfirm("");
      } else if (res.status === 404) {
        setError(t.disabled);
      } else if (res.status === 403) {
        setError(t.exists);
      } else {
        setError(t.failed);
      }
    } catch {
      setError(t.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-4" role="status" data-testid="text-setup-done">
              <p className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" aria-hidden="true" />
                {t.done}
              </p>
              <Link href="/admin/login" className="underline text-sm" data-testid="link-setup-login">
                {t.goLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="setup-email">{t.email}</Label>
                <Input
                  id="setup-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-setup-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setup-password">{t.password}</Label>
                <Input
                  id="setup-password"
                  type="password"
                  autoComplete="new-password"
                  aria-describedby="setup-password-hint"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-setup-password"
                />
                <p id="setup-password-hint" className="text-xs text-muted-foreground">
                  {t.passwordHint}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setup-confirm">{t.confirm}</Label>
                <Input
                  id="setup-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  data-testid="input-setup-confirm"
                />
              </div>
              {error && (
                <p className="flex items-start gap-2 text-sm text-red-700" role="alert" data-testid="text-setup-error">
                  <AlertCircle className="h-4 w-4 mt-0.5" aria-hidden="true" />
                  {error}
                </p>
              )}
              <Button type="submit" disabled={submitting} className="w-full rounded-none" data-testid="button-setup-submit">
                {submitting ? t.submitting : t.submit}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
