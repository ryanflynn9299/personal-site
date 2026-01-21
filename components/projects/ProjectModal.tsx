"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useHasMounted } from "@/lib/hooks/useHasMounted";

// Project type based on the data structure
interface Project {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
}

import { projects as projectColors } from "@/constants/theme";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

/**
 * Project Detail Modal
 * Displays full project information with links
 */
// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function ProjectModal({
  project,
  isOpen,
  onClose,
  accentColor = projectColors.default,
}: ProjectModalProps) {
  const hasMounted = useHasMounted();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Handle ESC key and focus management
  useEffect(() => {
    if (!hasMounted || !isOpen || !project) {
      return;
    }

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus close button after a short delay to allow animation
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Focus trap: Tab key handling
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          // Shift+Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [hasMounted, isOpen, onClose, project]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      // Small delay to ensure modal is fully closed
      setTimeout(() => {
        previousFocusRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!project) {
    return null;
  }

  const titleId = `modal-title-${project.title}`;
  const descriptionId = `modal-description-${project.title}`;

  if (!hasMounted) {
    if (!isOpen) {
      return null;
    }
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md"
        />
        {/* Modal Container - Centered */}
        <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
          <div
            ref={modalRef}
            role="dialog"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 bg-gradient-to-br from-slate-900 via-slate-800/95 to-slate-900 p-8 shadow-2xl ring-2 backdrop-blur-xl mx-4"
            style={{
              borderColor: `${accentColor}B3`,
              boxShadow: `0 25px 50px -12px ${accentColor}40`,
            }}
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-all hover:ring-2 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            {/* Content - same as animated version */}
            <div>
              {project.imageUrl && (
                <div className="mb-6 flex justify-center">
                  <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              )}
              <h2
                id={titleId}
                className="mb-4 text-center font-heading text-3xl font-bold"
                style={{ color: accentColor }}
              >
                {project.title}
              </h2>
              <div
                className="mb-6 h-px bg-gradient-to-r from-transparent to-transparent"
                style={{
                  background: `linear-gradient(to right, transparent, ${accentColor}4D, transparent)`,
                }}
              />
              <p
                id={descriptionId}
                className="mb-6 text-slate-300 leading-relaxed"
              >
                {project.description}
              </p>
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  🏷️ Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1 text-sm font-medium backdrop-blur-sm ring-1"
                      style={{
                        background: `linear-gradient(to right, ${accentColor}33, ${accentColor}26)`,
                        color: accentColor,
                        borderColor: `${accentColor}4D`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {project.githubUrl && project.githubUrl !== "#" && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-slate-200 transition-colors hover:bg-slate-700 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2"
                  >
                    <Github className="h-5 w-5" />
                    <span>View on GitHub</span>
                  </a>
                )}
                {project.liveUrl && project.liveUrl !== "#" && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: accentColor,
                    }}
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
            <motion.div
              ref={modalRef}
              key={`modal-${project.title}`}
              role="dialog"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 bg-gradient-to-br from-slate-900 via-slate-800/95 to-slate-900 p-8 shadow-2xl ring-2 backdrop-blur-xl mx-4"
              style={{
                borderColor: `${accentColor}B3`, // 70% opacity
                boxShadow: `0 25px 50px -12px ${accentColor}40`, // 25% opacity
              }}
            >
              {/* Close Button */}
              <motion.button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-all hover:ring-2 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2"
                style={
                  {
                    "--hover-bg": `${accentColor}33`, // 20% opacity
                    "--hover-text": accentColor,
                    "--hover-ring": `${accentColor}80`, // 50% opacity
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${accentColor}33`;
                  e.currentTarget.style.color = accentColor;
                  e.currentTarget.style.borderColor = `${accentColor}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.color = "";
                  e.currentTarget.style.borderColor = "";
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.1 } }}
              >
                {/* Project Image */}
                {project.imageUrl && (
                  <div className="mb-6 flex justify-center">
                    <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  </div>
                )}

                {/* Title */}
                <h2
                  id={titleId}
                  className="mb-4 text-center font-heading text-3xl font-bold"
                  style={{ color: accentColor }}
                >
                  {project.title}
                </h2>

                {/* Divider */}
                <div
                  className="mb-6 h-px bg-gradient-to-r from-transparent to-transparent"
                  style={{
                    background: `linear-gradient(to right, transparent, ${accentColor}4D, transparent)`, // 30% opacity
                  }}
                />

                {/* Description */}
                <p
                  id={descriptionId}
                  className="mb-6 text-slate-300 leading-relaxed"
                >
                  {project.description}
                </p>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                    🏷️ Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-3 py-1 text-sm font-medium backdrop-blur-sm ring-1"
                        style={{
                          background: `linear-gradient(to right, ${accentColor}33, ${accentColor}26)`, // 20% and 15% opacity
                          color: accentColor,
                          borderColor: `${accentColor}4D`, // 30% opacity
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-4">
                  {project.githubUrl && project.githubUrl !== "#" && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-slate-200 transition-colors hover:bg-slate-700 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2"
                    >
                      <Github className="h-5 w-5" />
                      <span>View on GitHub</span>
                    </a>
                  )}
                  {project.liveUrl && project.liveUrl !== "#" && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2"
                      style={{
                        backgroundColor: accentColor,
                      }}
                      onMouseEnter={(e) => {
                        // Lighten the color on hover
                        const rgb = hexToRgb(accentColor);
                        if (rgb) {
                          e.currentTarget.style.backgroundColor = `rgb(${Math.min(255, rgb.r + 20)}, ${Math.min(255, rgb.g + 20)}, ${Math.min(255, rgb.b + 20)})`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = accentColor;
                      }}
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
