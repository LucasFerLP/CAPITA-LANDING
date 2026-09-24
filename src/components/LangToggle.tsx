export type Lang = "es" | "en";

const LANGS: Lang[] = ["es", "en"];

type Props = {
  value: Lang;
  onChange: (lang: Lang) => void;
};

export function LangToggle({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Idioma" className="flex border-2 border-ink">
      {LANGS.map((code) => {
        const active = value === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(code)}
            className={`cursor-pointer px-2.5 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${
              active ? "bg-signal font-bold" : "bg-paper hover:bg-ink hover:text-paper"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
