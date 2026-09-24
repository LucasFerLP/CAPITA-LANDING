import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "../lib/motion";

const FEATURES = [
  {
    title: "Filtros orgánicos",
    body: "Nada de algoritmos genéricos. Filtrá por vibra, no por categoría: after office, listening bar, arte callejero, jazz clandestino.",
    cell: "bg-paper text-ink",
    titleSize: "text-[clamp(2.5rem,4.4vw,4.5rem)]",
  },
  {
    title: "Match cultural",
    body: "Conectá con personas que van al mismo lugar que vos. Sin swipes forzados: solo intereses compartidos, en tiempo real.",
    cell: "bg-signal text-ink",
    titleSize: "text-[clamp(2.25rem,3.2vw,3.25rem)]",
  },
  {
    title: "Feed en vivo",
    body: "Lo que está pasando ahora cerca tuyo, actualizado en tiempo real con eventos verificados por la comunidad.",
    cell: "bg-ink text-paper",
    titleSize: "text-[clamp(2.25rem,3.2vw,3.25rem)]",
  },
];

export function Features() {
  const reduce = useReducedMotion();

  return (
    <section id="circuitos" className="grid border-b-2 border-ink lg:grid-cols-[2fr_1fr_1fr]">
      {FEATURES.map((feature, i) => (
        <div
          key={feature.title}
          className={`border-b-2 border-ink px-5 py-12 last:border-b-0 sm:px-10 lg:border-r-2 lg:border-b-0 lg:py-14 lg:last:border-r-0 ${feature.cell}`}
        >
          <motion.div
            className="flex flex-col gap-5"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }}
          >
            <h3 className={`font-display leading-[0.88] font-black font-condensed uppercase tracking-[-0.04em] ${feature.titleSize}`}>
              {feature.title}
            </h3>
            <p className="max-w-[44ch] text-[13px] leading-relaxed">{feature.body}</p>
          </motion.div>
        </div>
      ))}
    </section>
  );
}
