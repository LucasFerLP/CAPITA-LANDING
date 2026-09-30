import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import { AuthError, signIn } from "../lib/auth";
import { EASE_RISE } from "../lib/motion";

type FieldErrors = { email?: string; password?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEADLINE = ["Entrá al", "circuito."];

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = "Ingresá tu email.";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Revisá el formato del email.";
  if (!password) errors.password = "Ingresá tu contraseña.";
  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-center gap-2 text-xs">
      <span aria-hidden="true" className="size-2 shrink-0 bg-signal" />
      {message}
    </p>
  );
}

export default function Login() {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const previousTitle = document.title;
    document.title = "Acceso | CAPITAL";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setFormError(null);

    if (nextErrors.email) return emailRef.current?.focus();
    if (nextErrors.password) return passwordRef.current?.focus();

    setStatus("loading");
    try {
      await signIn(email.trim(), password);
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      setFormError(error instanceof AuthError ? error.message : "Algo salió mal. Probá de nuevo.");
    }
  }

  const loading = status === "loading";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 grid h-16 grid-cols-[minmax(0,1fr)_auto] border-b-2 border-ink bg-paper">
        <Link
          to="/"
          className="flex items-center border-r-2 border-ink px-5 font-display text-3xl leading-none font-black font-condensed uppercase tracking-[-0.04em] sm:px-6"
        >
          Capital
        </Link>
        <Link
          to="/"
          className="flex items-center px-5 text-[10px] uppercase tracking-widest transition-colors hover:bg-ink hover:text-paper sm:px-6"
        >
          Volver al inicio
        </Link>
      </header>

      <main className="grid flex-1 items-center gap-12 border-b-2 border-ink px-5 py-14 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="flex min-w-0 flex-col gap-8">
          <h1 className="font-display text-[clamp(3.25rem,6.6vw,7.4rem)] leading-[0.86] font-black font-condensed uppercase tracking-[-0.045em]">
            {HEADLINE.map((line, i) => (
              <span key={line} className="-mt-[0.14em] block overflow-hidden pt-[0.14em]">
                <motion.span
                  className={`inline-block ${i === HEADLINE.length - 1 ? "bg-signal px-[0.08em] pt-[0.04em]" : ""}`}
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: 0.05 + i * 0.1, ease: EASE_RISE }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <Reveal delay={0.3}>
            <p className="max-w-[46ch] text-sm leading-relaxed">
              Ingresá con tu cuenta de CAPITAL para ver qué está pasando hoy en Buenos Aires.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="w-full min-w-0 max-w-[460px] lg:justify-self-end">
          <div className="border-2 border-ink bg-white shadow-hard-xl">
            <div className="border-b-2 border-ink px-4 py-3 text-[10px] uppercase tracking-widest">Iniciar sesión</div>

            {status === "success" ? (
              <div role="status" className="flex flex-col gap-3 px-5 py-8 sm:px-6">
                <p className="font-display text-3xl leading-none font-black font-condensed uppercase">Sesión iniciada.</p>
                <Link to="/" className="text-xs uppercase tracking-widest underline underline-offset-4">
                  Volver al inicio
                </Link>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-6 sm:px-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="vos@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="w-full border-2 border-ink bg-white px-3 py-3 text-sm placeholder:text-neutral-500"
                  />
                  <FieldError id="email-error" message={errors.email} />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest">
                    Contraseña
                  </label>
                  <div className="flex border-2 border-ink bg-white">
                    <input
                      ref={passwordRef}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className="min-w-0 flex-1 bg-white px-3 py-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-pressed={showPassword}
                      aria-controls="password"
                      className="cursor-pointer border-l-2 border-ink px-3 text-[10px] uppercase tracking-widest transition-colors hover:bg-ink hover:text-paper"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  <FieldError id="password-error" message={errors.password} />
                </div>

                {formError && (
                  <p role="alert" className="border-2 border-ink bg-signal px-3 py-2.5 text-xs leading-relaxed">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="press mt-1 w-full cursor-pointer border-2 border-ink bg-signal px-4 py-3.5 text-xs font-bold uppercase tracking-widest disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
