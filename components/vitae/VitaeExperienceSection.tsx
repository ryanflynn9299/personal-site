"use client";

import { useMemo } from "react";
import { useVitaeTwinkle } from "@/hooks/useVitaeTwinkle";
import {
  getVitaeBulletColor,
  type VitaeExperienceEntry,
} from "@/lib/vitae/timeline";
import { cn } from "@/lib/utils";

interface VitaeExperienceSectionProps {
  experience: VitaeExperienceEntry[];
}

export function VitaeExperienceSection({
  experience,
}: VitaeExperienceSectionProps) {
  const bulletCount = useMemo(
    () => experience.reduce((total, job) => total + job.description.length, 0),
    [experience]
  );
  const twinklingIndex = useVitaeTwinkle(bulletCount);

  let flatBulletIndex = 0;

  return (
    <section>
      <h2 className="border-b border-slate-700 pb-2 font-heading text-2xl font-semibold text-slate-100">
        Work Experience
      </h2>
      <div className="mt-6 space-y-8">
        {experience.map((job, jobIndex) => (
          <div key={`${job.company}-${job.role}-${job.period}`}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold text-sky-300">{job.role}</h3>
              <p className="text-sm text-slate-400">{job.period}</p>
            </div>
            <p className="text-md font-medium text-slate-200">{job.company}</p>
            <ul className="mt-4 space-y-2">
              {job.description.map((item, itemIndex) => {
                const colors = getVitaeBulletColor(jobIndex, itemIndex);
                const isLastItem = itemIndex === job.description.length - 1;
                const currentFlatIndex = flatBulletIndex;
                flatBulletIndex += 1;
                const isTwinkling = twinklingIndex === currentFlatIndex;

                return (
                  <li
                    key={itemIndex}
                    className="relative flex items-start gap-x-4"
                  >
                    {!isLastItem && (
                      <div className="absolute left-2 top-4 bottom-0 h-full w-px bg-slate-700" />
                    )}

                    <div
                      className={cn(
                        "vitae-bullet-dot relative mt-2 flex h-4 w-4 flex-none items-center justify-center",
                        isTwinkling && "is-twinkling"
                      )}
                      aria-hidden="true"
                    >
                      <div
                        className={cn(
                          "vitae-bullet-ring absolute h-full w-full rounded-full bg-slate-800 ring-1",
                          colors.ring
                        )}
                      />
                      <div
                        className={cn(
                          "vitae-bullet-inner relative h-1.5 w-1.5 rounded-full",
                          colors.bg
                        )}
                      />
                    </div>

                    <p
                      className={cn(
                        "flex-auto text-slate-300",
                        !isLastItem && "pb-4"
                      )}
                    >
                      {item}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
