export type LiveEvent = {
  id: string;
  category: string;
  title: string;
  when: string;
  people: string;
};

export const LIVE_EVENTS: LiveEvent[] = [
  {
    id: "vermut-los-galgos",
    category: "Gastronomía",
    title: "Vermut Los Galgos",
    when: "Hoy 19:30hs · Centro",
    people: "12 personas yendo",
  },
  {
    id: "feria-under-niceto",
    category: "Música",
    title: "Feria Under Niceto",
    when: "Hoy 23:00hs · Palermo",
    people: "45 personas yendo",
  },
  {
    id: "muestra-big-sur",
    category: "Arte",
    title: "Muestra Galería Big Sur",
    when: "Hoy 20:00hs · Chacarita",
    people: "28 personas yendo",
  },
];
