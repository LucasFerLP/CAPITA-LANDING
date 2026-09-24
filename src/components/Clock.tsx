import { buenosAiresTime, useNow } from "../lib/time";

export function NavClock() {
  const now = useNow(1000);
  return <>{buenosAiresTime(now).short}</>;
}

// Isolated so the ~11fps millisecond tick only re-renders this text node.
export function FeedClock() {
  const now = useNow(87);
  return <span className="tabular-nums">{buenosAiresTime(now).precise}</span>;
}
