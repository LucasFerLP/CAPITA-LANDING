import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import { AuthError, requestPasswordReset, resetPassword, signIn, signUp } from "../lib/auth";
import { EASE_RISE } from "../lib/motion";

type Mode = "login" | "signup" | "forgot" | "reset";
type Field = "alias" | "email" | "password" | "code";
type FieldErrors = Partial<Record<Field, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALIAS_PATTERN = /^[a-zA-Z0-9_.]{3,20}$/;
const CODE_PATTERN = /^\d{6}$/;
const MIN_PASSWORD = 6;
const RESEND_SECONDS = 60;
const HEADLINE = ["Entrá al", "circuito."];
const FIELD_ORDER: Field[] = ["alias", "email", "code", "password"];
const FIRST_FIELD: Record<Mode, Field> = { login: "email", signup: "alias", forgot: "email", reset: "code" };

const COPY: Record<Mode, { header: string; submit: string; loading: string; intro?: string }> = {
  login: { header: "Iniciar sesión", submit: "Ingresar", loading: "Ingresando..." },
  signup: { header: "Crear cuenta", submit: "Registrate", loading: "Registrando..." },
  forgot: {
    header: "Recuperar contraseña",
    submit: "Enviar código",
    loading: "Enviando...",
    intro: "Escribí el email de tu cuenta y te mandamos un código de 6 dígitos para crear una contraseña nueva.",
  },
  reset: { header: "Nueva contraseña", submit: "Cambiar contraseña", loading: "Guardando..." },
};

function validate(mode: Mode, values: Record<Field, string>): FieldErrors {
  const errors: FieldErrors = {};
  const email = values.email.trim();
  if (mode === "signup") {
    const alias = values.alias.trim();
    if (!alias) errors.alias = "Elegí un alias.";
    else if (!ALIAS_PATTERN.test(alias)) errors.alias = "Entre 3 y 20 caracteres: letras, números, punto o guion bajo.";
  }
  if (mode !== "reset") {
    if (!email) errors.email = "Ingresá tu email.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Revisá el formato del email.";
  }
  if (mode === "reset" && !CODE_PATTERN.test(values.code)) errors.code = "Ingresá el código de 6 dígitos.";
  if (mode !== "forgot") {
    if (!values.password) errors.password = mode === "reset" ? "Ingresá tu contraseña nueva." : "Ingresá tu contraseña.";
    else if (mode !== "login" && values.password.length < MIN_PASSWORD) errors.password = `Usá al menos ${MIN_PASSWORD} caracteres.`;
  }
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
  inputMode?: "email" | "text" | "numeric";
  autoComplete: string;
  placeholder?: string;
  maxLength?: number;
  trailing?: ReactNode;
};

function TextField({ id, label, value, onChange, error, inputRef, type = "text", inputMode, autoComplete, placeholder, maxLength, trailing }: TextFieldProps) {
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
          maxLength={maxLength}
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

function TextAction({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer font-bold text-ink uppercase tracking-widest underline-offset-4 hover:underline disabled:cursor-default disabled:font-normal disabled:text-neutral-600 disabled:no-underline"
    >
      {children}
    </button>
  );
}

export default function Login() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("login");
  const [values, setValues] = useState<Record<Field, string>>({ alias: "", email: "", password: "", code: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [userName, setUserName] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const refs: Record<Field, RefObject<HTMLInputElement | null>> = {
    alias: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    code: useRef<HTMLInputElement>(null),
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
    const id = setTimeout(() => refs[FIRST_FIELD[mode]].current?.focus(), reduce ? 0 : 200);
    return () => clearTimeout(id);
  }, [mode]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const setField = (field: Field) => (value: string) => setValues((v) => ({ ...v, [field]: value }));

  function goTo(next: Mode, nextNotice: string | null = null) {
    switchedMode.current = true;
    setMode(next);
    setErrors({});
    setFormError(null);
    setNotice(nextNotice);
    setStatus("idle");
    setValues((v) => ({ ...v, password: "", code: "" }));
  }

  async function sendCode() {
    await requestPasswordReset(values.email.trim());
    setResendIn(RESEND_SECONDS);
  }

  async function resend() {
    setFormError(null);
    try {
      await sendCode();
      setNotice(`Te mandamos un código nuevo a ${values.email.trim()}.`);
    } catch (error) {
      setFormError(error instanceof AuthError ? error.message : "Algo salió mal. Probá de nuevo.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(mode, values);
    setErrors(nextErrors);
    setFormError(null);

    const firstInvalid = FIELD_ORDER.find((f) => nextErrors[f]);
    if (firstInvalid) return refs[firstInvalid].current?.focus();

    setStatus("loading");
    try {
      const email = values.email.trim();
      if (mode === "forgot") {
        await sendCode();
        goTo("reset", `Si ${email} tiene una cuenta, te llegó un código. Revisá también la carpeta de spam.`);
        return;
      }
      if (mode === "reset") {
        await resetPassword(email, values.code, values.password);
        goTo("login", "Listo, cambiaste tu contraseña. Ya podés ingresar con la nueva.");
        return;
      }
      const user = mode === "signup" ? await signUp(values.alias.trim(), email, values.password) : await signIn(email, values.password);
      setUserName(user.name);
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      setFormError(error instanceof AuthError ? error.message : "Algo salió mal. Probá de nuevo.");
    }
  }

  const copy = COPY[mode];
  const loading = status === "loading";
  const passwordIsNew = mode === "signup" || mode === "reset";

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
                    <p className="font-display text-3xl leading-none font-black font-condensed uppercase">
                      {mode === "signup" ? "Cuenta creada." : "Sesión iniciada."}
                    </p>
                    {userName && <p className="text-sm">Hola, {userName}.</p>}
                    <Link to="/" className="text-xs uppercase tracking-widest underline underline-offset-4">
                      Volver al inicio
                    </Link>
                  </div>
                ) : (
                  <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-6 sm:px-6">
                    {copy.intro && <p className="text-sm leading-relaxed">{copy.intro}</p>}

                    {notice && (
                      <p role="status" className="border-2 border-ink bg-paper px-3 py-2.5 text-xs leading-relaxed">
                        {notice}
                      </p>
                    )}

                    {mode === "signup" && (
                      <TextField
                        id="alias"
                        label="Alias"
                        value={values.alias}
                        onChange={setField("alias")}
                        error={errors.alias}
                        inputRef={refs.alias}
                        autoComplete="username"
                        placeholder="tu_alias"
                      />
                    )}

                    {mode !== "reset" && (
                      <TextField
                        id="email"
                        label="Email"
                        value={values.email}
                        onChange={setField("email")}
                        error={errors.email}
                        inputRef={refs.email}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="vos@mail.com"
                      />
                    )}

                    {mode === "reset" && (
                      <TextField
                        id="code"
                        label="Código"
                        value={values.code}
                        onChange={(v) => setField("code")(v.replace(/\D/g, "").slice(0, 6))}
                        error={errors.code}
                        inputRef={refs.code}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        maxLength={6}
                      />
                    )}

                    {mode !== "forgot" && (
                      <div className="flex flex-col gap-2">
                        <TextField
                          id="password"
                          label={mode === "reset" ? "Contraseña nueva" : "Contraseña"}
                          value={values.password}
                          onChange={setField("password")}
                          error={errors.password}
                          inputRef={refs.password}
                          type={showPassword ? "text" : "password"}
                          autoComplete={passwordIsNew ? "new-password" : "current-password"}
                          placeholder={passwordIsNew ? `Mínimo ${MIN_PASSWORD} caracteres` : undefined}
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
                        {mode === "login" && (
                          <p className="text-[11px] uppercase tracking-widest">
                            <TextAction onClick={() => goTo("forgot")}>¿Olvidaste tu contraseña?</TextAction>
                          </p>
                        )}
                      </div>
                    )}

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

                    <div className="flex flex-col gap-2 text-[11px] uppercase tracking-widest text-neutral-600">
                      {mode === "login" && (
                        <p>
                          <span aria-hidden="true">&gt; </span>¿No estás registrado?{" "}
                          <TextAction onClick={() => goTo("signup")}>Solicitar acceso</TextAction>
                        </p>
                      )}
                      {mode === "signup" && (
                        <p>
                          <span aria-hidden="true">&gt; </span>¿Ya tenés cuenta?{" "}
                          <TextAction onClick={() => goTo("login")}>Iniciar sesión</TextAction>
                        </p>
                      )}
                      {mode === "forgot" && (
                        <p>
                          <span aria-hidden="true">&gt; </span>¿Te acordaste?{" "}
                          <TextAction onClick={() => goTo("login")}>Iniciar sesión</TextAction>
                        </p>
                      )}
                      {mode === "reset" && (
                        <>
                          <p>
                            <span aria-hidden="true">&gt; </span>¿No te llegó?{" "}
                            <TextAction onClick={resend} disabled={resendIn > 0}>
                              {resendIn > 0 ? `Reenviar en ${resendIn} s` : "Reenviar código"}
                            </TextAction>
                          </p>
                          <p>
                            <span aria-hidden="true">&gt; </span>
                            <TextAction onClick={() => goTo("forgot")}>Usar otro email</TextAction>
                          </p>
                        </>
                      )}
                    </div>
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
