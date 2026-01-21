import React, { useState, useRef, useEffect } from "react";
import { folder as folderColors } from "@/constants/theme";

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  ariaExpanded?: boolean;
  ariaLabel?: string;
  onOpenChange?: (isOpen: boolean) => void;
  defaultOpen?: boolean;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

const Folder: React.FC<FolderProps> = ({
  color = folderColors.default,
  size = 1,
  items = [],
  className = "",
  onKeyDown,
  ariaExpanded,
  ariaLabel,
  onOpenChange,
  defaultOpen = false,
}) => {
  const maxItems = 3;
  const actualItems = items.slice(0, maxItems);
  const itemCount = actualItems.length;

  // Handle different item counts: 3 items (all), 2 items (first and third), 1 item (second only)
  const papers: (React.ReactNode | null)[] = [];
  if (itemCount === 3) {
    // All three papers
    papers.push(actualItems[0], actualItems[1], actualItems[2]);
  } else if (itemCount === 2) {
    // First and third papers
    papers.push(actualItems[0], null, actualItems[1]);
  } else if (itemCount === 1) {
    // Only second paper
    papers.push(null, actualItems[0], null);
  } else {
    // No items - all null
    papers.push(null, null, null);
  }

  const [open, setOpen] = useState(defaultOpen);
  const [hoveredPaper, setHoveredPaper] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastHoveredRef = useRef<number | null>(null);

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = folderColors.paper.dark1;
  const paper2 = folderColors.paper.dark2;
  const paper3 = folderColors.paper.light;

  // Sync open state with parent component
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  }, [open, onOpenChange]);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent) => {
    // Handle Enter and Space to toggle folder
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
    // Pass other keys to parent handler (for arrow navigation)
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handlePaperMouseEnter = (index: number) => {
    // Clear any pending timeout to prevent bouncing between cards
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Only update if it's actually a different card to prevent unnecessary re-renders
    if (hoveredPaper !== index) {
      setHoveredPaper(index);
      lastHoveredRef.current = index;
    }
  };

  const handlePaperMouseLeave = (index: number) => {
    // Only start timeout if this is the currently hovered card
    // This prevents bouncing when mouse moves between cards
    if (hoveredPaper === index) {
      // Add 500ms delay before reverting to neutral state
      hoverTimeoutRef.current = setTimeout(() => {
        // Double-check that we're still not hovering any card before clearing
        if (hoveredPaper === index) {
          setHoveredPaper(null);
          lastHoveredRef.current = null;
        }
        hoverTimeoutRef.current = null;
      }, 500);
    }
  };

  const folderStyle: React.CSSProperties = {
    "--folder-color": color,
    "--folder-back-color": folderBackColor,
    "--paper-1": paper1,
    "--paper-2": paper2,
    "--paper-3": paper3,
  } as React.CSSProperties;

  const scaleStyle = { transform: `scale(${size})` };

  // Calculate radial direction and distance for each card position
  // This works for all configurations (1, 2, or 3 cards) by using the actual array position
  const getRadialOffset = (arrayIndex: number, isHovered: boolean) => {
    // Base positions relative to folder center for each possible array position
    // These represent where cards appear when the folder is open
    const basePositions: {
      [key: number]: { x: number; y: number; angle: number };
    } = {
      0: { x: -120, y: -70, angle: -15 }, // Top left (first card in 3-card or 2-card config)
      1: { x: 10, y: -70, angle: 15 }, // Top right (middle card in 3-card, or only card in 1-card config)
      2: { x: -50, y: -100, angle: 5 }, // Top center (third card in 3-card or 2-card config)
    };

    const pos = basePositions[arrayIndex];
    if (!pos) {
      return { x: 0, y: 0, rotate: 0 };
    }

    // Calculate radial direction from folder center (0, 0) to card position
    // Normalize the vector to get direction
    const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y);

    // Avoid division by zero
    if (distance === 0) {
      return { x: pos.x, y: pos.y, rotate: pos.angle };
    }

    const normalizedX = pos.x / distance;
    const normalizedY = pos.y / distance;

    // On hover, move further in the radial direction (outward from folder center)
    // Use a percentage of the base distance for consistent movement
    const hoverOffsetPercent = isHovered ? 0.25 : 0; // 25% further out
    const hoverOffset = distance * hoverOffsetPercent;
    const offsetX = normalizedX * hoverOffset;
    const offsetY = normalizedY * hoverOffset;

    return {
      x: pos.x + offsetX,
      y: pos.y + offsetY,
      rotate: pos.angle,
    };
  };

  const getOpenTransform = (arrayIndex: number) => {
    const isHovered = hoveredPaper === arrayIndex;
    const offset = getRadialOffset(arrayIndex, isHovered);
    return `translate(${offset.x}%, ${offset.y}%) rotate(${offset.rotate}deg)`;
  };

  return (
    <div style={scaleStyle} className={className}>
      <div
        className={`group relative transition-all duration-200 ease-in cursor-pointer ${
          !open ? "hover:-translate-y-2" : ""
        }`}
        style={{
          ...folderStyle,
          transform: open ? "translateY(-8px)" : undefined,
          transition: "transform 0.2s ease-in",
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDownInternal}
        aria-expanded={ariaExpanded !== undefined ? ariaExpanded : open}
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        <div
          className="relative w-[100px] h-[80px] rounded-tl-0 rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]"
          style={{ backgroundColor: folderBackColor }}
        >
          <span
            className="absolute z-0 bottom-[98%] left-0 w-[30px] h-[10px] rounded-tl-[5px] rounded-tr-[5px] rounded-bl-0 rounded-br-0"
            style={{ backgroundColor: folderBackColor }}
          ></span>
          {papers.map((item, i) => {
            // Skip rendering if item is null
            if (item === null) {
              return null;
            }

            let sizeClasses = "";
            if (i === 0) {
              sizeClasses = open ? "w-[70%] h-[80%]" : "w-[70%] h-[80%]";
            }
            if (i === 1) {
              sizeClasses = open ? "w-[80%] h-[80%]" : "w-[80%] h-[70%]";
            }
            if (i === 2) {
              sizeClasses = open ? "w-[90%] h-[80%]" : "w-[90%] h-[60%]";
            }

            const transformStyle = open ? getOpenTransform(i) : undefined;

            // Clone the item and update its index prop to match the position (i)
            const itemWithCorrectIndex =
              React.isValidElement(item) &&
              item.props &&
              typeof item.props === "object" &&
              item.props !== null &&
              "index" in item.props
                ? React.cloneElement(item as React.ReactElement<any>, {
                    index: i,
                  })
                : item;

            return (
              <div
                key={i}
                onMouseEnter={() => handlePaperMouseEnter(i)}
                onMouseLeave={() => handlePaperMouseLeave(i)}
                className={`absolute z-20 bottom-[10%] left-1/2 transition-all duration-500 ease-out ${
                  !open ? "transform -translate-x-1/2 translate-y-[10%]" : ""
                } ${sizeClasses}`}
                style={{
                  ...(!open ? {} : { transform: transformStyle }),
                  backgroundColor: i === 0 ? paper1 : i === 1 ? paper2 : paper3,
                  borderRadius: "10px",
                }}
              >
                {itemWithCorrectIndex}
              </div>
            );
          })}
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${
              !open ? "group-hover:[transform:skew(15deg)_scaleY(0.6)]" : ""
            }`}
            style={{
              backgroundColor: color,
              borderRadius: "5px 10px 10px 10px",
              ...(open && { transform: "skew(15deg) scaleY(0.6)" }),
            }}
          ></div>
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${
              !open ? "group-hover:[transform:skew(-15deg)_scaleY(0.6)]" : ""
            }`}
            style={{
              backgroundColor: color,
              borderRadius: "5px 10px 10px 10px",
              ...(open && { transform: "skew(-15deg) scaleY(0.6)" }),
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
