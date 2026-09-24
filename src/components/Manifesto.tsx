import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "../lib/motion";

const PAIN_POINTS = [
  "Terminás cayendo al mismo bar de Palermo por inercia.",
  "Te enteraste de esa muestra de arte en un sótano un día tarde por Instagram.",
  "Las apps tradicionales te muestran primero al boliche que pagó más pauta publicitaria.",
];

export function Manifesto() {
  const reduce = useReducedMotion();

  return (
    <section
      id="manifiesto"
      className="grid items-center gap-10 border-b-2 border-ink px-5 py-16 sm:px-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:py-20"
    >
      <h2 className="font-display text-[clamp(2.75rem,5.4vw,6rem)] leading-[0.88] font-black font-condensed uppercase tracking-[-0.045em]">
        <span className="block">Las mismas caras.</span>
        <span className="block">Los mismos lugares de siempre.</span>
      </h2>

      <div className="border-2 border-ink bg-ink px-6 py-7 text-paper sm:px-8 sm:py-9">
        <ul className="flex flex-col gap-5">
          {PAIN_POINTS.map((point, i) => (
            <motion.li
              key={point}
              className="flex gap-3 text-sm leading-relaxed"
              initial={reduce ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, delay: i * 0.18, ease: EASE_OUT }}
            >
              <span aria-hidden="true" className="shrink-0 font-bold text-signal">
                &gt;
              </span>
              <span>{point}</span>
            </motion.li>
          ))}
        </ul>
        <span aria-hidden="true" className="mt-5 block animate-blink text-sm text-signal">
          █
        </span>
      </div>
    </section>
  );
}
