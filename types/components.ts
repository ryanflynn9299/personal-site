// Component prop types and interfaces

import { VariantProps } from "class-variance-authority";
import { ReactNode, CSSProperties, RefObject } from "react";
import { Variants } from "framer-motion";
import { ForwardRefExoticComponent } from "react";
import { LucideProps } from "lucide-react";

// Button component types
// ButtonProps is defined in the component file due to dependency on buttonVariants
// Import ButtonProps directly from @/components/primitives/Button when needed

// Toast component types
export interface ToastProps {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: number) => void;
}

// AnimatedText component types
export type AnimationType = "decode" | "stagger-words" | "cascade-letters";

export interface AnimatedTextProps {
  text: string;
  animationType?: AnimationType;
  className?: string;
}

// ContactPageClient types
export interface ContactPageClientProps {
  /**
   * Whether the email service is configured and available
   */
  emailServiceAvailable: boolean;
}

// MagicBento component types
export interface CardData {
  color: string;
  title: string;
  description: string;
  label: string;
}

export interface ParticleCardProps {
  children: ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

export interface GlobalSpotlightProps {
  gridRef: RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

export interface BentoCardGridProps {
  children: ReactNode;
  gridRef: RefObject<HTMLDivElement | null>;
}

export interface MagicBentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

export interface BentoCardProps {
  name: string;
  category: string;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>;
  description: string;
  className?: string;
  onClick: () => void;
}

// MagicBento3 types
export type Skill = { name: string; description: string };

export type SelectedCard = {
  category: string;
  skills: Skill[];
};

