"use client";

import React, {
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
  FC,
  CSSProperties,
  useState,
} from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { techCategories } from "@/data/skills";
import type {
  SelectedCard,
  GlobalSpotlightProps,
  BentoCardGridProps,
} from "@/types/components";

type Tween = gsap.core.Tween;

// Constants tailored for the Slate/Sky theme
const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "56, 189, 248"; // Sky-400 equivalent RGB
const MOBILE_BREAKPOINT = 599;

// --- HELPER FUNCTIONS ---
const createParticleElement = (
  x: number,
  y: number,
  color: string = DEFAULT_GLOW_COLOR
): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
        position: absolute; width: 4px; height: 4px; border-radius: 50%;
        background: rgba(${color}, 1); box-shadow: 0 0 6px rgba(${color}, 0.6);
        pointer-events: none; z-index: 100; left: ${x}px; top: ${y}px;
    `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

// --- COMPONENTS ---

interface ParticleCardProps {
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  onClick?: () => void;
}

const ParticleCard: FC<ParticleCardProps> = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) {
      return;
    }
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        glowColor
      )
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();
    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) {
      return;
    }
    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) {
          return;
        }
        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) {
      return;
    }
    const element = cardRef.current;

    const xTo = gsap.quickTo(element, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(element, "y", { duration: 0.4, ease: "power3" });
    const rxTo = gsap.quickTo(element, "rotateX", {
      duration: 0.4,
      ease: "power3",
    });
    const ryTo = gsap.quickTo(element, "rotateY", {
      duration: 0.4,
      ease: "power3",
    });

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt) {
        gsap.set(element, { transformPerspective: 1000 });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (enableTilt) {
        rxTo(0);
        ryTo(0);
      }
      if (enableMagnetism) {
        xTo(0);
        yTo(0);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) {
        return;
      }
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left,
        y = e.clientY - rect.top;
      const centerX = rect.width / 2,
        centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10,
          rotateY = ((x - centerX) / centerX) * 10;
        rxTo(rotateX);
        ryTo(rotateY);
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05,
          magnetY = (y - centerY) * 0.05;
        xTo(magnetX);
        yTo(magnetY);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (onClick) {
        onClick();
      }
      if (!clickEffect) {
        return;
      }
      const rect = element.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement("div");
      ripple.style.cssText = `
                position: absolute; width: ${maxDistance * 2}px; height: ${maxDistance * 2}px; border-radius: 50%;
                background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                left: ${x - maxDistance}px; top: ${y - maxDistance}px; pointer-events: none; z-index: 1000;
            `;
      element.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
    onClick,
  ]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight: FC<GlobalSpotlightProps> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) {
      return;
    }
    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
            position: fixed; width: 800px; height: 800px; border-radius: 50%; pointer-events: none;
            background: radial-gradient(circle, rgba(${glowColor}, 0.15) 0%, rgba(${glowColor}, 0.08) 15%, rgba(${glowColor}, 0.04) 25%, rgba(${glowColor}, 0.02) 40%, rgba(${glowColor}, 0.01) 65%, transparent 70%);
            z-index: 200; opacity: 0; transform: translate(-50%, -50%); mix-blend-mode: screen;
        `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const xTo = gsap.quickTo(spotlightRef.current, "left", {
      duration: 0.15,
      ease: "power3",
    });
    const yTo = gsap.quickTo(spotlightRef.current, "top", {
      duration: 0.15,
      ease: "power3",
    });
    const opacityTo = gsap.quickTo(spotlightRef.current, "opacity", {
      duration: 0.3,
      ease: "power3",
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) {
        return;
      }
      const section = gridRef.current.closest(".bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const cards: NodeListOf<HTMLElement> =
        gridRef.current.querySelectorAll(".card");
      if (!mouseInside) {
        opacityTo(0);
        cards.forEach((card) =>
          card.style.setProperty("--glow-intensity", "0")
        );
        return;
      }

      const { proximity, fadeDistance } =
        calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2,
          centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);
        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }
        updateCardGlowProperties(
          card,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius
        );
      });

      xTo(e.clientX);
      yTo(e.clientY);

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      opacityTo(targetOpacity);
    };

    const handleMouseLeave = () => {
      gridRef.current
        ?.querySelectorAll(".card")
        .forEach((card) =>
          (card as HTMLElement).style.setProperty("--glow-intensity", "0")
        );
      opacityTo(0);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const BentoCardGrid: FC<BentoCardGridProps> = ({ children, gridRef }) => (
  // Incorporating TechStack3's proportional classes natively
  <div
    className="bento-section grid grid-cols-1 md:grid-cols-4 auto-rows-[12rem] gap-4 w-full max-w-5xl select-none relative z-10"
    ref={gridRef}
  >
    {children}
  </div>
);

const useMobileDetection = (): boolean => {
  return useSyncExternalStore(
    (subscribe) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      window.addEventListener("resize", subscribe);
      return () => window.removeEventListener("resize", subscribe);
    },
    () =>
      typeof window !== "undefined"
        ? window.innerWidth <= MOBILE_BREAKPOINT
        : false,
    () => false
  );
};

export function MagicBento4() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMobileDetection();

  // Hardcoded toggles derived from MagicBento2
  const enableSpotlight = true;
  const enableBorderGlow = true;
  const enableTilt = false;
  const enableMagnetism = false;
  const clickEffect = true;
  const shouldDisableAnimations = isMobile;

  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);

  const handleCardClick = (categoryData: SelectedCard) => {
    setSelectedCard(categoryData);
  };

  const handleClose = () => {
    setSelectedCard(null);
  };

  const cardStyle: CSSProperties & Record<string, string> = {
    "--glow-x": "50%",
    "--glow-y": "50%",
    "--glow-intensity": "0",
    "--glow-radius": "200px",
  };

  return (
    <div className="relative flex items-center justify-center my-16">
      <style>
        {`
          .bento-section {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 200px;
            --glow-color: ${DEFAULT_GLOW_COLOR};
            --border-color: #334155; /* slate-700 */
          }
          
          .card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 6px;
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(${DEFAULT_GLOW_COLOR}, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(${DEFAULT_GLOW_COLOR}, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%);
            border-radius: inherit;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: subtract;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 10;
          }
          
          .card--border-glow:hover::after {
            opacity: 1;
          }
          
          .card--border-glow:hover {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(${DEFAULT_GLOW_COLOR}, 0.2);
          }
          
          .particle::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: rgba(${DEFAULT_GLOW_COLOR}, 0.2);
            border-radius: 50%;
            z-index: -1;
          }
        `}
      </style>

      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={DEFAULT_SPOTLIGHT_RADIUS}
          glowColor={DEFAULT_GLOW_COLOR}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        {techCategories.map((categoryData) => {
          const baseClassName = `card flex flex-col justify-between relative p-6 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] ${
            enableBorderGlow ? "card--border-glow" : ""
          } ${categoryData.className}`;

          return (
            <ParticleCard
              key={categoryData.category}
              className={baseClassName}
              style={{ ...cardStyle }}
              disableAnimations={shouldDisableAnimations}
              particleCount={DEFAULT_PARTICLE_COUNT}
              glowColor={DEFAULT_GLOW_COLOR}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
              onClick={() => handleCardClick(categoryData)}
            >
              {/* Force Z-index so it stays visible above particles but beneath borders/hover effects */}
              <div className="relative z-10 flex-grow pointer-events-none">
                <categoryData.icon className="h-8 w-8 text-sky-300 mb-4" />
                <h3 className="font-heading text-xl font-semibold text-slate-50">
                  {categoryData.category}
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  {`View skills related to ${categoryData.category}.`}
                </p>
              </div>
              <p className="relative z-10 text-xs font-mono text-slate-500 mt-4 pointer-events-none">
                Category
              </p>
            </ParticleCard>
          );
        })}
      </BentoCardGrid>

      {/* Modal View matching MagicBento3 */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              layoutId={`card-${selectedCard.category}`}
              className="relative w-full max-w-lg p-8 rounded-xl bg-slate-900 border border-sky-300/50 shadow-2xl shadow-sky-900/50"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
              >
                <X />
              </motion.button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
              >
                <h2 className="font-heading text-3xl font-bold text-sky-300">
                  {selectedCard.category}
                </h2>
                <div className="mt-6 space-y-4">
                  {selectedCard.skills.map((skill) => (
                    <div key={skill.name}>
                      <h4 className="font-semibold text-slate-50">
                        {skill.name}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
