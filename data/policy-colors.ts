// Policy color themes data

import type { PolicyColorTheme } from "@/types/policies";
import { sky, purple } from "@/constants/theme";

export const colorThemes: Record<string, PolicyColorTheme> = {
  "privacy-policy": {
    text: "text-sky-400",
    textHover: "text-sky-300",
    bg: "bg-sky-600/20",
    border: "border-sky-500/50",
    shadow: "shadow-sky-500/20",
    focusRing: "focus:ring-sky-500",
    icon: "text-sky-400",
    link: "text-sky-400",
    linkHover: "hover:text-sky-300",
    codeBorder: "border-sky-500/30",
    blockquoteBorder: "border-sky-500/50",
    constellation: "text-sky-400/50",
    linkColor: sky[400], // sky-400
    linkHoverColor: sky[300], // sky-300
  },
  "terms-of-service": {
    text: "text-purple-400",
    textHover: "text-purple-300",
    bg: "bg-purple-600/20",
    border: "border-purple-500/50",
    shadow: "shadow-purple-500/20",
    focusRing: "focus:ring-purple-500",
    icon: "text-purple-400",
    link: "text-purple-400",
    linkHover: "hover:text-purple-300",
    codeBorder: "border-purple-500/30",
    blockquoteBorder: "border-purple-500/50",
    constellation: "text-purple-400/50",
    linkColor: purple[400], // purple-400
    linkHoverColor: purple[300], // purple-300
  },
  // Future policies can use these colors:
  // rose-500, amber-400, teal-400, indigo-400, lime-400, fuchsia-500, emerald-500
};
