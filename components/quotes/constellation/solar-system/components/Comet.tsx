"use client";

import { motion } from "framer-motion";
import { RocketIcon, AsteroidIcon } from "@/components/common/SpaceMarkdownIcons";
import type { Comet } from "../types";
import { CometTooltip } from "./CometTooltip";

interface CometProps {
  comet: Comet;
}

// 'Comet' refers to tailed entities that move across the screen: rockets and asteroids
export function Comet({ comet }: CometProps) {
  const IconComponent = comet.iconType === "rocket" ? RocketIcon : AsteroidIcon;
  
  // Color mapping for rockets
  const colorClasses = {
    red: "text-red-400",
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
  };
  
  const iconColorClass = comet.iconType === "rocket" && comet.color
    ? colorClasses[comet.color as keyof typeof colorClasses]
    : "text-sky-400";

  // Size-based dimensions
  const iconSize = comet.size === "small" ? "w-4 h-4" : comet.size === "medium" ? "w-5 h-5" : "w-6 h-6";
  const tailWidth = comet.size === "small" ? "16px" : comet.size === "medium" ? "18px" : "20px";
  const tailHeight = comet.iconType === "asteroid" 
    ? (comet.size === "small" ? "56px" : comet.size === "medium" ? "63px" : "70px")
    : (comet.size === "small" ? "40px" : comet.size === "medium" ? "45px" : "50px");

  // Tail gradient based on comet type and color
  const tailGradient = comet.iconType === "rocket" && comet.color === "red"
    ? "radial-gradient(ellipse at top, rgba(239, 68, 68, 0.7), rgba(239, 68, 68, 0.3) 40%, transparent 70%)"
    : comet.iconType === "rocket" && comet.color === "blue"
    ? "radial-gradient(ellipse at top, rgba(59, 130, 246, 0.7), rgba(59, 130, 246, 0.3) 40%, transparent 70%)"
    : comet.iconType === "rocket" && comet.color === "green"
    ? "radial-gradient(ellipse at top, rgba(34, 197, 94, 0.7), rgba(34, 197, 94, 0.3) 40%, transparent 70%)"
    : comet.iconType === "rocket" && comet.color === "purple"
    ? "radial-gradient(ellipse at top, rgba(168, 85, 247, 0.7), rgba(168, 85, 247, 0.3) 40%, transparent 70%)"
    : "radial-gradient(ellipse at top, rgba(148, 163, 184, 0.6), rgba(148, 163, 184, 0.2) 40%, transparent 70%)";

  return (
    <motion.div
      key={comet.id}
      className="absolute cursor-pointer group"
      style={{
        left: `${comet.x}px`,
        top: `${comet.y}px`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Quote tooltip on hover - positioned outside rotation */}
      <CometTooltip quote={comet.quote} />
      
      {/* Rotated icon container - rotation is fixed, only scale animates */}
      <div
        style={{
          transform: `rotate(${comet.rotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        <motion.div
          style={{
            transformOrigin: "center center",
          }}
          whileHover={{ scale: 1.3 }}
          className="relative"
        >
          {/* Gassy tail - extends behind the icon (opposite direction of travel) */}
          <div
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              width: tailWidth,
              height: tailHeight,
              background: tailGradient,
              transform: "translate(-80%, 6px) rotate(45deg) translateY(8px)",
              transformOrigin: "center top",
              filter: "blur(3px)",
              zIndex: -1,
            }}
          />
          <IconComponent className={`${iconSize} ${iconColorClass} drop-shadow-lg relative z-10`} />
        </motion.div>
      </div>
    </motion.div>
  );
}

