"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { projects } from "@/data/projects";
import { ProjectCard2 } from "./ProjectCard2";

const OPTIONS: EmblaOptionsType = { loop: true, align: "start" };

export function ProjectCarousel2() {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-8 md:py-24 group relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold text-slate-50 sm:text-4xl">
            Featured Projects
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-300 mx-auto">
            A selection of projects that showcase my skills and passion for
            building things.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Left Navigation Button */}
          <div className="flex shrink-0">
            <Button
              onClick={scrollPrev}
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-800/50 hover:bg-slate-700 transition-opacity duration-300 opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto"
              disabled={prevBtnDisabled}
              aria-label="Previous projects"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </div>

          {/* Carousel Track */}
          <div className="overflow-hidden flex-grow" ref={emblaRef}>
            <div className="flex -ml-4">
              {projects.map((project, index) => (
                <div
                  className="pl-4 flex-grow-0 flex-shrink-0 basis-full md:basis-1/2 lg:basis-1/3"
                  key={index}
                >
                  <ProjectCard2 project={project} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Navigation Button */}
          <div className="flex shrink-0">
            <Button
              onClick={scrollNext}
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-800/50 hover:bg-slate-700 transition-opacity duration-300 opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto"
              disabled={nextBtnDisabled}
              aria-label="Next projects"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation / Dot Indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? "w-4 bg-sky-300"
                  : "bg-slate-600 hover:bg-slate-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
