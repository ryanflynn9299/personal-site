"use client";

import type { ReactNode } from "react";
import type { PolicyColorTheme } from "@/types/policies";
import {
  getPolicyHeadingClassName,
  getPolicyHeadingWrapperClassName,
  POLICY_OUTLINE_BRANCH,
  POLICY_OUTLINE_GUIDE,
  POLICY_OUTLINE_STEP,
  type PolicyHeadingLevel,
} from "@/lib/policies/heading-styles";
import { cn } from "@/lib/utils";

export function PolicyHeading({
  level,
  theme,
  children,
  id,
}: {
  level: PolicyHeadingLevel;
  theme: PolicyColorTheme;
  children?: ReactNode;
  id?: string;
}) {
  if (level === "h3") {
    return (
      <div className={getPolicyHeadingWrapperClassName("h3")}>
        <div
          className={cn(POLICY_OUTLINE_STEP, POLICY_OUTLINE_GUIDE)}
          aria-hidden="true"
        />
        <h3 id={id} className={getPolicyHeadingClassName("h3", theme)}>
          {children}
        </h3>
      </div>
    );
  }

  if (level === "h4") {
    return (
      <div className={getPolicyHeadingWrapperClassName("h4")}>
        <div
          className={cn(POLICY_OUTLINE_STEP, POLICY_OUTLINE_GUIDE)}
          aria-hidden="true"
        />
        <div
          className={cn(POLICY_OUTLINE_STEP, POLICY_OUTLINE_BRANCH)}
          aria-hidden="true"
        />
        <h4 id={id} className={getPolicyHeadingClassName("h4", theme)}>
          {children}
        </h4>
      </div>
    );
  }

  const Tag = level;

  return (
    <Tag id={id} className={getPolicyHeadingClassName(level, theme)}>
      {children}
    </Tag>
  );
}
