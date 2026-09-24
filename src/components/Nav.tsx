import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { NavClock } from "./Clock";
import { LangToggle, type Lang } from "./LangToggle";

const LINKS = [
  { href: "#manifiesto", label: "Manifiesto" },
  { href: "#circuitos", label: "Circuitos" },
  { href: "#hosts", label: "Acceso hosts" },
];

function PrimaryCta({ onClick }: { onClick?: () => void }) {
  return (
    <a
      href="#top"
      onClick={onClick}
      className="press inline-block whitespace-nowrap border-2 border-ink bg-signal px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest"
    >
      [ Obtener acceso ]
    </a>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("es");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => desktop.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper">
      <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:grid-cols-[200px_repeat(3,minmax(0,1fr))_auto_auto] xl:grid-cols-[220px_repeat(3,minmax(0,1fr))_minmax(0,1.3fr)_auto_auto]">
        <a
          href="#top"
          className="flex items-center border-r-2 border-ink px-5 font-display text-3xl leading-none font-black font-condensed uppercase tracking-[-0.04em] sm:px-6"
        >
          Capital
        </a>

        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hidden items-center border-r-2 border-ink px-5 text-[10px] uppercase tracking-widest transition-colors hover:bg-ink hover:text-paper lg:flex"
          >
            {link.label}
          </a>
        ))}

        <div className="hidden items-center justify-center whitespace-nowrap border-r-2 border-ink px-5 text-[10px] uppercase tracking-widest xl:flex">
          [ BUE // <NavClock /> ART ]
        </div>

        <div className="hidden items-center border-r-2 border-ink px-4 sm:flex">
          <LangToggle value={lang} onChange={setLang} />
        </div>

        <div className="flex items-center px-3.5 sm:border-r-2 sm:border-ink lg:hidden">
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((v) => !v)}
            className="group flex size-11 cursor-pointer flex-col items-center justify-center gap-[5px] border-2 border-ink bg-paper transition-colors hover:bg-ink"
          >
            <span className={`block h-0.5 w-[18px] bg-ink transition-transform group-hover:bg-paper ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-0.5 w-[18px] bg-ink transition-opacity group-hover:bg-paper ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-[18px] bg-ink transition-transform group-hover:bg-paper ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>

        <div className="hidden items-center pr-5 pl-4 sm:flex">
          <PrimaryCta />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu"
            aria-label="Menú"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute inset-x-0 top-full grid border-t-2 border-ink bg-paper lg:hidden"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                className="border-b-2 border-ink px-6 py-5 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-ink hover:text-paper"
              >
                {link.label}
              </a>
            ))}
            <div className="border-b-2 border-ink px-6 py-4 text-[10px] uppercase tracking-widest">
              [ BUE // <NavClock /> ART ]
            </div>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] border-b-2 border-ink sm:hidden">
              <div className="flex items-center border-r-2 border-ink px-5 py-4">
                <LangToggle value={lang} onChange={setLang} />
              </div>
              <div className="flex items-center px-5 py-4">
                <PrimaryCta onClick={close} />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
