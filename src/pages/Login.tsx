import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import { AuthError, signIn, signUp } from "../lib/auth";
import { EASE_RISE } from "../lib/motion";

type Mode = "login" | "signup";
type Field = "alias" | "email" | "password";
type FieldErrors = Partial<Record<Field, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALIAS_PATTERN = /^[a-zA-Z0-9_.]{3,20}$/;
const MIN_PASSWORD = 6;
const HEADLINE = ["Entrá al", "circuito."];

const COPY = {
  login: {
    header: "Iniciar sesión",
    submit: "Ingresar",
    loading: "Ingresando...",
    success: "Sesión iniciada.",
    switchPrompt: "¿No estás registrado?",
    switchAction: "Solicitar acceso",
  },
  signup: {
    header: "Crear cuenta",
    submit: "Registrate",
    loading: "Registrando...",
    success: "Cuenta creada.",
    switchPrompt: "¿Ya tenés cuenta?",
    switchAction: "Iniciar sesión",
  },
} as const;

function validate(mode: Mode, alias: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (mode === "signup") {
    if (!alias.trim()) errors.alias = "Elegí un alias.";
    else if (!ALIAS_PATTERN.test(alias.trim())) errors.alias = "Entre 3 y 20 caracteres: letras, números, punto o guion bajo.";
  }
  if (!email.trim()) errors.email = "Ingresá tu email.";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Revisá el formato del email.";
  if (!password) errors.password = "Ingresá tu contraseña.";
  else if (mode === "signup" && password.length < MIN_PASSWORD) errors.password = `Usá al menos ${MIN_PASSWORD} caracteres.`;
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

type TextFieldProps = {
  id: Field;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  type?: string;
  inputMode?: "email" | "text";
  autoComplete: string;
  placeholder?: string;
  trailing?: ReactNode;
};

function TextField({ id, label, value, onChange, error, inputRef, type = "text", inputMode, autoComplete, placeholder, trailing }: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest">
        {label}
      </label>
      <div className="flex border-2 border-ink bg-white">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 bg-white px-3 py-3 text-sm placeholder:text-neutral-500"
        />
        {trailing}
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export default function Login() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("login");
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [userName, setUserName] = useState("");
  const refs = {
    alias: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };
  const switchedMode = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const previousTitle = document.title;
    document.title = "Acceso | CAPITAL";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  // Move focus into the new view after the card swaps, but not on first load.
  useEffect(() => {
    if (!switchedMode.current) return;
    const first = mode === "signup" ? refs.alias : refs.email;
    const id = setTimeout(() => first.current?.focus(), reduce ? 0 : 200);
    return () => clearTimeout(id);
  }, [mode]);

  function switchMode() {
    switchedMode.current = true;
    setMode((m) => (m === "login" ? "signup" : "login"));
    setErrors({});
    setFormError(null);
    setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(mode, alias, email, password);
    setErrors(nextErrors);
    setFormError(null);

    const firstInvalid = (["alias", "email", "password"] as const).find((f) => nextErrors[f]);
    if (firstInvalid) return refs[firstInvalid].current?.focus();

    setStatus("loading");
    try {
      const user = mode === "signup" ? await signUp(alias.trim(), email.trim(), password) : await signIn(email.trim(), password);
      setUserName(user.name);
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      setFormError(error instanceof AuthError ? error.message : "Algo salió mal. Probá de nuevo.");
    }
  }

  const copy = COPY[mode];
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
          <div className="overflow-hidden border-2 border-ink bg-white shadow-hard-xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <h2 className="border-b-2 border-ink px-4 py-3 text-[10px] font-normal uppercase tracking-widest">{copy.header}</h2>

                {status === "success" ? (
                  <div role="status" className="flex flex-col gap-3 px-5 py-8 sm:px-6">
                    <p className="font-display text-3xl leading-none font-black font-condensed uppercase">{copy.success}</p>
                    {userName && <p className="text-sm">Hola, {userName}.</p>}
                    <Link to="/" className="text-xs uppercase tracking-widest underline underline-offset-4">
                      Volver al inicio
                    </Link>
                  </div>
                ) : (
                  <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-6 sm:px-6">
                    {mode === "signup" && (
                      <TextField
                        id="alias"
                        label="Alias"
                        value={alias}
                        onChange={setAlias}
                        error={errors.alias}
                        inputRef={refs.alias}
                        autoComplete="username"
                        placeholder="tu_alias"
                      />
                    )}

                    <TextField
                      id="email"
                      label="Email"
                      value={email}
                      onChange={setEmail}
                      error={errors.email}
                      inputRef={refs.email}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="vos@mail.com"
                    />

                    <TextField
                      id="password"
                      label="Contraseña"
                      value={password}
                      onChange={setPassword}
                      error={errors.password}
                      inputRef={refs.password}
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder={mode === "signup" ? `Mínimo ${MIN_PASSWORD} caracteres` : undefined}
                      trailing={
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-pressed={showPassword}
                          aria-controls="password"
                          className="cursor-pointer border-l-2 border-ink px-3 text-[10px] uppercase tracking-widest transition-colors hover:bg-ink hover:text-paper"
                        >
                          {showPassword ? "Ocultar" : "Mostrar"}
                        </button>
                      }
                    />

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
                      {loading ? copy.loading : copy.submit}
                    </button>

                    <p className="text-[11px] uppercase tracking-widest text-neutral-600">
                      <span aria-hidden="true">&gt; </span>
                      {copy.switchPrompt}{" "}
                      <button
                        type="button"
                        onClick={switchMode}
                        className="cursor-pointer font-bold text-ink uppercase tracking-widest underline-offset-4 hover:underline"
                      >
                        {copy.switchAction}
                      </button>
                    </p>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
