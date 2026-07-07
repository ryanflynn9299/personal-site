/** Planet palette for vitae work-experience timeline bullets */
export const vitaeBulletColors = [
  { ring: "ring-sky-500", bg: "bg-sky-500" },
  { ring: "ring-rose-500", bg: "bg-rose-500" },
  { ring: "ring-amber-400", bg: "bg-amber-400" },
  { ring: "ring-teal-400", bg: "bg-teal-400" },
  { ring: "ring-indigo-400", bg: "bg-indigo-400" },
  { ring: "ring-lime-400", bg: "bg-lime-400" },
  { ring: "ring-fuchsia-500", bg: "bg-fuchsia-500" },
  { ring: "ring-emerald-500", bg: "bg-emerald-500" },
] as const;

export type VitaeExperienceEntry = {
  role: string;
  period: string;
  company: string;
  description: string[];
};

export function getVitaeBulletColor(jobIndex: number, itemIndex: number) {
  return vitaeBulletColors[
    (8 - jobIndex + itemIndex + 1) % vitaeBulletColors.length
  ];
}
