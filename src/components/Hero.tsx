import { motion, useReducedMotion } from "motion/react";
import { EASE_RISE } from "../lib/motion";
import { LiveTicket } from "./LiveTicket";
import { Reveal } from "./Reveal";
import { StoreButton } from "./StoreButton";

const HEADLINE = ["La ciudad", "está pasando.", "Conectá."];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="border-b-2 border-ink">
      <div className="grid items-center gap-14 px-5 py-14 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="flex min-w-0 flex-col gap-8">
          <h1 className="font-display text-[clamp(3.25rem,6.6vw,7.4rem)] leading-[0.86] font-black font-condensed uppercase tracking-[-0.045em]">
            {HEADLINE.map((line, i) => (
              // Extra top padding keeps the accents (Á) inside the clipping mask.
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

          <Reveal delay={0.4}>
            <p className="max-w-[52ch] text-sm leading-relaxed">
              El lado B de Buenos Aires en tiempo real. Cero algoritmos comerciales, cero filas VIP.
            </p>
          </Reveal>

          <Reveal delay={0.5} className="flex flex-col gap-4">
            <span className="text-[10px] uppercase tracking-widest">Próximamente</span>
            <div className="flex flex-col gap-4 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center">
              <StoreButton store="ios" />
              <StoreButton store="android" />
            </div>
          </Reveal>
        </div>

        <div className="flex min-w-0 justify-center lg:justify-end">
          <Reveal delay={0.35} className="w-full min-w-0 max-w-[460px]">
            <LiveTicket />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
