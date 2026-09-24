import { useEffect, useState } from "react";

const BA_FORMAT = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function buenosAiresTime(timestamp: number) {
  const date = new Date(timestamp);
  const parts = Object.fromEntries(BA_FORMAT.formatToParts(date).map((p) => [p.type, p.value]));
  const millis = String(date.getMilliseconds()).padStart(3, "0");
  return {
    short: `${parts.hour}:${parts.minute}`,
    precise: `${parts.hour}:${parts.minute}:${parts.second}.${millis}`,
  };
}

export function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
