import { motion, useReducedMotion } from "motion/react";
import { EASE_RISE } from "../lib/motion";
import { LiveTicket } from "./LiveTicket";
import { Reveal } from "./Reveal";
import { StoreButton } from "./StoreButton";

const HEADLINE = ["La ciudad", "está pasando.", "Conectá."];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="grid border-b-2 border-ink lg:grid-cols-2">
      <div className="grid min-w-0 grid-rows-[1fr_auto_auto] border-ink lg:border-r-2">
        <div className="flex items-end border-b-2 border-ink px-5 pt-12 pb-10 sm:px-10 sm:pt-16">
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
        </div>

        <Reveal delay={0.4} className="border-b-2 border-ink px-5 py-7 sm:px-10">
          <p className="max-w-[52ch] text-sm leading-relaxed">
            El lado B de Buenos Aires en tiempo real. Cero algoritmos comerciales, cero filas VIP.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-[auto_minmax(0,1fr)]">
          <Reveal
            delay={0.5}
            className="flex items-center whitespace-nowrap border-b-2 border-ink px-5 py-4 text-[10px] uppercase tracking-widest sm:border-r-2 sm:border-b-0 sm:py-0 sm:pr-6 sm:pl-10"
          >
            [ Próximamente ]
          </Reveal>
          <Reveal
            delay={0.6}
            className="flex flex-col gap-4 px-5 pt-6 pb-7 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center sm:pr-10 sm:pl-7"
          >
            <StoreButton store="ios" />
            <StoreButton store="android" />
          </Reveal>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-center border-t-2 border-ink px-5 py-12 sm:px-12 lg:border-t-0 lg:py-14">
        <Reveal delay={0.35} className="w-full min-w-0 max-w-[460px]">
          <LiveTicket />
        </Reveal>
      </div>
    </section>
  );
}
