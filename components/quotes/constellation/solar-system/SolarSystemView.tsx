"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { QuoteModalTitle } from "@/components/quotes/QuoteModalTitle";
import { useQuoteViewStore } from "@/components/quotes/store/useQuoteViewStore";
import { env } from "@/lib/env";
import type { Entity, SolarSystemViewProps } from "./types";
import { buildEntities } from "./buildEntities";
import { useComets } from "./useComets";
import { getEntityPosition, getEntityClickPosition } from "./utils";
import { Sun } from "./components/Sun";
import { Entity as EntityComponent } from "./components/Entity";
import { OrbitLine } from "./components/OrbitLine";
import { Comet } from "./components/Comet";
import { CommandConsole } from "./components/CommandConsole";
import { ZoomedEntityView } from "./components/ZoomedEntityView";
import { BlurredBackground } from "./components/BlurredBackground";
import { TOOLTIP_HIDE_DELAY } from "./constants";

export function SolarSystemView({ quotes }: SolarSystemViewProps) {
  const { entities, sunEntity, quoteBank } = useMemo(
    () => buildEntities(quotes),
    [quotes]
  );
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const { isZoomed, setIsZoomed } = useQuoteViewStore();
  const [panState, setPanState] = useState({ x: 0, y: 0, scale: 1 });
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);
  const [hoveredCometId, setHoveredCometId] = useState<string | null>(null);
  const [initialEntityPosition, setInitialEntityPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const tooltipHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { setCometTriggerCallback } = useQuoteViewStore();
  // Use quote bank for comets (leftover quotes from entities)
  const { comets } = useComets(
    quoteBank,
    containerRef,
    isZoomed,
    setCometTriggerCallback
  );

  // Update orbital positions
  useEffect(() => {
    if (isZoomed) {
      return;
    } // Pause when zoomed

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
    if (!containerRef.current) {
      return;
    }

    // Get the current position of the entity relative to container
    const position = getEntityPosition(entity, containerRef);
    const rect = containerRef.current.getBoundingClientRect();

    // Convert to absolute screen coordinates for animation
    // Account for container's position on screen and the orrery's translateY offset (-60px)
    const screenX = rect.left + position.x;
    const screenY = rect.top + position.y - 60; // Account for translateY: -60px on orrery

    setInitialEntityPosition({
      x: screenX,
      y: screenY,
    });

    // Set selected entity and zoom state
    setSelectedEntity(entity);
    setIsZoomed(true);

    // Fade out the orrery by scaling it down and moving it
    // The actual entity will be shown via ZoomedEntityView
    setPanState({
      x: 0,
      y: 0,
      scale: 0.3, // Scale down the orrery to fade it into background
    });

    // Open console after animation completes
    setTimeout(() => {
      setIsConsoleOpen(true);
    }, 800); // Slightly longer to allow fly-in animation to complete
  };

  // Handle close
  const handleClose = () => {
    setIsConsoleOpen(false);
    // Start reverse animation by setting isZoomed to false
    setIsZoomed(false);
    // Clear state after reverse animation completes
    setTimeout(() => {
      setSelectedEntity(null);
      setInitialEntityPosition(null);
      setPanState({ x: 0, y: 0, scale: 1 });
    }, 600); // Match animation duration
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

      {/* Modal Title - blurred behind background when zoomed */}
      <div
        className="absolute left-0 top-0 z-[104]"
        style={{
          opacity: isZoomed ? 0.3 : 1,
          transition: "opacity 0.6s ease-out",
        }}
      >
        <QuoteModalTitle
          title="My Quotes"
          description={
            <>
              <p>Click on any celestial body to view its quotes.</p>
              <p>Orbits are tilted for a 3D perspective view.</p>
            </>
          }
        />
      </div>

      {/* Blurred Background Overlay - fades in when zoomed, fades out when closing */}
      <BlurredBackground
        isVisible={isZoomed}
        color={selectedEntity?.color}
        animationDelay={isZoomed ? 0.3 : 0} // Start fading in after planet starts moving, fade out immediately when closing
        onClose={handleClose}
      />

      {/* Zoomed Entity View - shows entity at center top when zoomed */}
      <ZoomedEntityView
        entity={selectedEntity}
        isVisible={isZoomed}
        initialPosition={initialEntityPosition}
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
          opacity: isZoomed ? 0.2 : 1, // Fade out orrery when zoomed
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
      {/* Hide comets when zoomed for cleaner view */}
      {!isZoomed &&
        comets.map((comet) => (
          <Comet
            key={comet.id}
            comet={comet}
            onHover={() => setHoveredCometId(comet.id)}
            onHoverEnd={() => setHoveredCometId(null)}
          />
        ))}

      {/* Category 1 Tooltips Layer - z-100, rendered after all entities */}
      {/* All Category 1 tooltips in same stacking context, above everything */}
      {!isZoomed && (
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
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className="absolute bottom-full left-0 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900/95 border-2 rounded-lg shadow-xl backdrop-blur-xl"
                style={{
                  borderColor: sunEntity.color,
                  left: "50%",
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
                <p className="text-xs text-slate-400 font-mono mb-2">0.0 AU</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click to explore more quotes
                </p>
              </div>
            </div>
          )}
          {entities.map((entity) => {
            if (hoveredEntityId !== entity.id) {
              return null;
            }
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
      )}

      {/* Category 2 Tooltips Layer - z-90, rendered after Category 1 tooltips */}
      {/* All Category 2 tooltips in same stacking context, below Category 1 tooltips */}
      {!isZoomed && (
        <div className="absolute inset-0 pointer-events-none z-[90]">
          {comets.map((comet) => {
            if (hoveredCometId !== comet.id) {
              return null;
            }

            // Don't show tooltip if no quote (production) or show "No quotes available" in dev
            if (!comet.quote) {
              // In dev mode UI, show "No quotes available", in prod show nothing
              if (!env.devModeUI) {
                return null;
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
      )}

      {/* Command Console Drawer */}
      <CommandConsole
        isOpen={isConsoleOpen}
        selectedEntity={selectedEntity}
        onClose={handleClose}
      />
    </div>
  );
}
