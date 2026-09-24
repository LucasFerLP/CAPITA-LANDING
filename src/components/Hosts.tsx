export function Hosts() {
  return (
    <section id="hosts" className="grid border-b-2 border-ink md:grid-cols-2">
      <div className="border-b-2 border-ink px-5 py-14 sm:px-10 md:border-r-2 md:border-b-0">
        <h2 className="mb-5 font-display text-[clamp(2.75rem,5vw,5rem)] leading-[0.88] font-black font-condensed uppercase tracking-[-0.04em]">
          Acceso hosts
        </h2>
        <p className="max-w-[46ch] text-[13px] leading-relaxed">
          ¿Organizás eventos? Publicalos en el circuito y llegá a la gente que los está buscando.
        </p>
      </div>
      <div className="flex items-center px-5 py-14 sm:px-10">
        <a
          href="#hosts"
          className="press inline-block whitespace-nowrap border-2 border-ink bg-white px-[22px] py-4 text-xs font-bold uppercase tracking-widest"
        >
          [ Publicar evento ]
        </a>
      </div>
    </section>
  );
}
