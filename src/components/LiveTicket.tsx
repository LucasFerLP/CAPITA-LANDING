import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LIVE_EVENTS } from "../data/events";
import { FeedClock } from "./Clock";

const CYCLE_MS = 3000;

export function LiveTicket() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % LIVE_EVENTS.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const event = LIVE_EVENTS[index];
  const isConfirmed = !!confirmed[event.id];

  return (
    <article
      aria-label="Evento en vivo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="border-2 border-ink bg-white shadow-hard-xl"
    >
      <div className="truncate border-b-2 border-ink px-4 py-3 text-[10px] uppercase tracking-widest">
        FEED_BUENOS_AIRES [ <FeedClock /> ]{" "}
        <span aria-hidden="true" className="animate-blink">
          █
        </span>
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={event.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <div className="min-h-44 px-5 pt-7 pb-6">
              <span className="inline-block border-2 border-ink bg-signal px-2 py-1 text-[11px] font-bold uppercase tracking-widest">
                [ {event.category} ]
              </span>
              <h2 className="mt-[18px] font-display text-[clamp(2.25rem,3.6vw,3.375rem)] leading-[0.9] font-black font-condensed uppercase tracking-[-0.03em]">
                {event.title}
              </h2>
            </div>
            <div className="grid grid-cols-2 border-t-2 border-ink text-[11px] uppercase tracking-wide">
              <div className="border-r-2 border-ink px-4 py-3">{event.when}</div>
              <div className="px-4 py-3">{event.people}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t-2 border-ink px-4 pt-4 pb-5">
        <button
          type="button"
          aria-pressed={isConfirmed}
          onClick={() => setConfirmed((c) => ({ ...c, [event.id]: !c[event.id] }))}
          className={`press w-full cursor-pointer border-2 border-ink px-4 py-3.5 text-xs font-bold uppercase tracking-widest ${
            isConfirmed ? "bg-ink text-paper" : "bg-white"
          }`}
        >
          {isConfirmed ? "[ Asistencia confirmada ]" : "[ Confirmar asistencia ]"}
        </button>
      </div>
    </article>
  );
}
