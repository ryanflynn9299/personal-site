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
import { TOOLTIP_HIDE_DELAY } from "./constants";

export function SolarSystemView({ quotes }: SolarSystemViewProps) {
  const { entities, sunEntity, usedQuoteIds, quoteBank } = useMemo(
    () => buildEntities(quotes),
    [quotes]
  );
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [panState, setPanState] = useState({ x: 0, y: 0, scale: 1 });
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);
  const [hoveredCometId, setHoveredCometId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const tooltipHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { setCometTriggerCallback } = useQuoteViewStore();
  // Use quote bank for comets (leftover quotes from entities)
  const { comets } = useComets(quoteBank, containerRef, isZoomed, setCometTriggerCallback);

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

  // Handle entity hover with delay
  const handleEntityHover = (entityId: string) => {
    // Clear any pending hide timeout
    if (tooltipHideTimeoutRef.current) {
      clearTimeout(tooltipHideTimeoutRef.current);
      tooltipHideTimeoutRef.current = null;
    }
    // Immediately show tooltip
    setHoveredEntityId(entityId);
  };

  // Handle entity hover end with delay
  const handleEntityHoverEnd = () => {
    // Clear any existing timeout
    if (tooltipHideTimeoutRef.current) {
      clearTimeout(tooltipHideTimeoutRef.current);
    }
    // Set timeout to hide tooltip after delay
    tooltipHideTimeoutRef.current = setTimeout(() => {
      setHoveredEntityId(null);
      tooltipHideTimeoutRef.current = null;
    }, TOOLTIP_HIDE_DELAY);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipHideTimeoutRef.current) {
        clearTimeout(tooltipHideTimeoutRef.current);
      }
    };
  }, []);

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

      {/* Orrery Canvas - Category 1 (Focal) Entities */}
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
        {/* Orbit Lines - z-10 background layer */}
        {entities.map((entity) => (
          <OrbitLine key={`orbit-${entity.id}`} entity={entity} />
        ))}

        {/* Category 1: Central Star (Sun) - z-20 */}
        {/* Rendered after orbit lines to ensure it's clickable */}
        {sunEntity && (
          <Sun 
            sunEntity={sunEntity} 
            onClick={handleEntityClick}
            onHover={() => handleEntityHover(sunEntity.id)}
            onHoverEnd={handleEntityHoverEnd}
          />
        )}

        {/* Category 1: Planets - z-20 */}
        {/* All on same plane, never overlap due to orbital positioning */}
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
              onHover={() => handleEntityHover(entity.id)}
              onHoverEnd={handleEntityHoverEnd}
            />
          );
        })}
      </motion.div>

      {/* Category 2: Comets - z-30 entities */}
      {/* May render above Category 1 entities, tooltips below Category 1 tooltips */}
      {comets.map((comet) => (
        <Comet 
          key={comet.id} 
          comet={comet}
          onHover={() => setHoveredCometId(comet.id)}
          onHoverEnd={() => setHoveredCometId(null)}
        />
      ))}

      {/* Category 1 Tooltips Layer - z-100, rendered after all entities */}
      {/* All Category 1 tooltips in same stacking context, above everything */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-[100]"
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
        {sunEntity && hoveredEntityId === sunEntity.id && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="absolute bottom-full left-0 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900/95 border-2 rounded-lg shadow-xl backdrop-blur-xl"
              style={{
                borderColor: sunEntity.color,
                left: '50%',
              }}
            >
              <p
                className="text-sm font-semibold text-slate-50 mb-2"
                style={{
                  color: sunEntity.color,
                }}
              >
                {sunEntity.name}
              </p>
              <p className="text-xs text-slate-400 font-mono mb-2">
                0.0 AU
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click to explore more quotes
              </p>
            </div>
          </div>
        )}
        {entities.map((entity) => {
          if (hoveredEntityId !== entity.id) return null;
          const position = getEntityPosition(entity, containerRef);
          const auDistance = (entity.orbitRadius / 15).toFixed(1);
          
          return (
            <div
              key={`tooltip-${entity.id}`}
              className="absolute"
              style={{
                left: position.x,
                top: position.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="absolute bottom-full left-0 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900/95 border-2 rounded-lg shadow-xl backdrop-blur-xl"
                style={{
                  borderColor: entity.color,
                }}
              >
                <p
                  className="text-sm font-semibold text-slate-50 mb-2"
                  style={{
                    color: entity.color,
                  }}
                >
                  {entity.name}
                </p>
                <p className="text-xs text-slate-400 font-mono mb-2">
                  {auDistance} AU
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click to explore more quotes
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Category 2 Tooltips Layer - z-90, rendered after Category 1 tooltips */}
      {/* All Category 2 tooltips in same stacking context, below Category 1 tooltips */}
      <div className="absolute inset-0 pointer-events-none z-[90]">
        {comets.map((comet) => {
          if (hoveredCometId !== comet.id) return null;
          
          // Don't show tooltip if no quote (production) or show "No quotes available" in dev
          if (!comet.quote) {
            // In dev mode, show "No quotes available", in prod show nothing
            if (process.env.NODE_ENV !== "development") return null;
            
            return (
              <div
                key={`tooltip-${comet.id}`}
                className="absolute"
                style={{
                  left: `${comet.x}px`,
                  top: `${comet.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="absolute bottom-full left-0 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl">
                  <p className="text-xs text-slate-200 leading-relaxed">
                    No quotes available
                  </p>
                </div>
              </div>
            );
          }
          
          return (
            <div
              key={`tooltip-${comet.id}`}
              className="absolute"
              style={{
                left: `${comet.x}px`,
                top: `${comet.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="absolute bottom-full left-0 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl">
                <p className="text-xs text-slate-200 leading-relaxed">
                  {comet.quote.text}
                </p>
                {(comet.quote.author || comet.quote.source) && (
                  <p className="mt-2 text-xs text-slate-400 font-mono">
                    {comet.quote.author && `— ${comet.quote.author}`}
                    {comet.quote.author && comet.quote.source && " • "}
                    {comet.quote.source}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Command Console Drawer */}
      <CommandConsole
        isOpen={isConsoleOpen}
        selectedEntity={selectedEntity}
        onClose={handleClose}
      />
    </div>
  );
}
