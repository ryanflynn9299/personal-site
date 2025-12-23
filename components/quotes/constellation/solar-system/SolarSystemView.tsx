"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import { QuoteModalTitle } from "@/components/quotes/QuoteModalTitle";
import { useQuoteViewStore } from "@/components/quotes/store/useQuoteViewStore";
import type { Entity, SolarSystemViewProps } from "./types";
import { buildEntities } from "./buildEntities";
import { useComets } from "./useComets";
import { getEntityPosition, getEntityClickPosition } from "./utils";
import { Sun } from "./components/Sun";
import { Entity as EntityComponent } from "./components/Entity";
import { OrbitLine } from "./components/OrbitLine";
import { Comet } from "./components/Comet";
import { CommandConsole } from "./components/CommandConsole";

export function SolarSystemView({ quotes }: SolarSystemViewProps) {
  const { entities, sunEntity } = useMemo(() => buildEntities(quotes), [quotes]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [panState, setPanState] = useState({ x: 0, y: 0, scale: 1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const { setCometTriggerCallback } = useQuoteViewStore();
  const { comets } = useComets(quotes, containerRef, isZoomed, setCometTriggerCallback);

  // Update orbital positions
  useEffect(() => {
    if (isZoomed) return; // Pause when zoomed

    const animate = () => {
      // Update entity orbits
      entities.forEach((entity) => {
        entity.angle += entity.orbitSpeed * 0.01;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [entities, isZoomed]);

  // Handle entity click - Zoom & Dock
  const handleEntityClick = (entity: Entity) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate entity position in original coordinate system (elliptical with eccentricity)
    const { x: entityX, y: entityY } = getEntityClickPosition(entity, containerRef);

    // Target position: top-center of screen
    const targetX = centerX;
    const targetY = 100; // Top of viewport
    const targetScale = 2.5;

    // Calculate pan values to move entity to target
    const panX = targetX - centerX - (entityX - centerX) * targetScale;
    const panY = targetY - centerY - (entityY - centerY) * targetScale;

    // Set selected entity
    setSelectedEntity(entity);
    setIsZoomed(true);

    // Animate pan and zoom
    setPanState({
      x: panX,
      y: panY,
      scale: targetScale,
    });

    // Open console after animation
    setTimeout(() => {
      setIsConsoleOpen(true);
    }, 600);
  };

  // Handle close
  const handleClose = () => {
    setIsConsoleOpen(false);
    setTimeout(() => {
      setSelectedEntity(null);
      setIsZoomed(false);
      setPanState({ x: 0, y: 0, scale: 1 });
    }, 300);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-slate-950"
    >
      {/* Starry Background */}
      <div className="absolute inset-0">
        <div className="stars-constellation stars-constellation-1"></div>
        <div className="stars-constellation stars-constellation-2"></div>
        <div className="stars-constellation stars-constellation-3"></div>
      </div>

      {/* Modal Title */}
      <QuoteModalTitle
        title="My Quotes"
        description={
          <>
            <p>Click on any celestial body to view its quotes.</p>
            <p>Orbits are tilted for a 3D perspective view.</p>
          </>
        }
      />

      {/* Orrery Canvas */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: panState.x,
          y: panState.y,
          scale: panState.scale,
          transformOrigin: "center center",
          translateY: "-60px",
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        {/* Orbit Lines */}
        {entities.map((entity) => (
          <OrbitLine key={`orbit-${entity.id}`} entity={entity} />
        ))}

        {/* Central Star (Sun) - rendered after orbit lines to ensure it's clickable */}
        {sunEntity && (
          <Sun sunEntity={sunEntity} onClick={handleEntityClick} />
        )}

        {/* Entities */}
        {entities.map((entity) => {
          const position = getEntityPosition(entity, containerRef);
          const isSelected = selectedEntity?.id === entity.id;

          return (
            <EntityComponent
              key={entity.id}
              entity={entity}
              position={position}
              isSelected={isSelected}
              onClick={handleEntityClick}
            />
          );
        })}
      </motion.div>

      {/* Comets */}
      {comets.map((comet) => (
        <Comet key={comet.id} comet={comet} />
      ))}

      {/* Command Console Drawer */}
      <CommandConsole
        isOpen={isConsoleOpen}
        selectedEntity={selectedEntity}
        onClose={handleClose}
      />
    </div>
  );
}
