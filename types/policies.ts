// Policy-related types

export type PolicyColorTheme = {
  // Tailwind color classes (must be full class names, not dynamic)
  text: string; // text-{color}-400
  textHover: string; // text-{color}-300
  bg: string; // bg-{color}-600/20
  border: string; // border-{color}-500/50
  shadow: string; // shadow-{color}-500/20
  focusRing: string; // focus:ring-{color}-500 for focus states
  icon: string; // text-{color}-400
  link: string; // text-{color}-400
  linkHover: string; // text-{color}-300 (for hover: prefix)
  codeBorder: string; // border-{color}-500/30
  blockquoteBorder: string; // border-{color}-500/50
  constellation: string; // text-{color}-400/50
  // CSS variable values for dynamic hover states
  linkColor: string; // CSS color value for links
  linkHoverColor: string; // CSS color value for link hover
};

export interface PolicyMetadata {
  title: string;
  lastUpdated: string;
}

export interface PolicyDocument {
  metadata: PolicyMetadata;
  content: string;
}

