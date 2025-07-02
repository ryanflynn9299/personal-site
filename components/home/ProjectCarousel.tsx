'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';
import { Github, ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Define your projects array here or import it
const projects = [
    {
        title: 'Project Alpha',
        description: 'A full-stack web application for real-time data visualization, built with Next.js, TypeScript, and a GraphQL backend.',
        imageUrl: 'https://placehold.co/1200x800/',
        tags: ['Next.js', 'TypeScript', 'GraphQL', 'PostgreSQL'],
        liveUrl: '#',
        githubUrl: '#',
    },
    {
        title: 'Project Beta',
        description: 'A mobile-first progressive web app for collaborative task management, featuring offline support and push notifications.',
        imageUrl: 'https://placehold.co/1200x800/',
        tags: ['React', 'PWA', 'Firebase', 'Node.js'],
        liveUrl: '#',
        githubUrl: '#',
    },
    {
        title: 'Project Gamma',
        description: 'An open-source design system component library published to NPM, focusing on accessibility and developer experience.',
        imageUrl: 'https://placehold.co/1200x800/',
        tags: ['React', 'Storybook', 'TypeScript', 'NPM'],
        liveUrl: '#',
        githubUrl: '#',
    },
    {
        title: 'Project Omnicron',
        description: 'An open-source design system component library published to NPM, focusing on accessibility and developer experience.',
        imageUrl: 'https://placehold.co/1200x800/',
        tags: ['React', 'Storybook', 'TypeScript', 'NPM'],
        liveUrl: '#',
        githubUrl: '#',
    },
    {
        title: 'Project Omega',
        description: 'An open-source design system component library published to NPM, focusing on accessibility and developer experience.',
        imageUrl: 'https://placehold.co/1200x800/',
        tags: ['React', 'Storybook', 'TypeScript', 'NPM'],
        liveUrl: '#',
        githubUrl: '#',
    },
    {
        title: 'Project Gamma',
        description: 'An open-source design system component library published to NPM, focusing on accessibility and developer experience.',
        imageUrl: 'https://placehold.co/1200x800/',
        tags: ['React', 'Storybook', 'TypeScript', 'NPM'],
        liveUrl: '#',
        githubUrl: '#',
    },
    {
        title: 'Project Gamma',
        description: 'An open-source design system component library published to NPM, focusing on accessibility and developer experience.',
        imageUrl: 'https://placehold.co/1200x800/',
        tags: ['React', 'Storybook', 'TypeScript', 'NPM'],
        liveUrl: '#',
        githubUrl: '#',
    },
];

// Carousel options
const OPTIONS: EmblaOptionsType = { loop: true };

export function ProjectCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative">
            <div className="py-8">
                <h2 className="font-heading text-3xl font-bold text-slate-50 sm:text-4xl text-center">
                    Featured Projects
                </h2>
                <p className="mt-4 max-w-2xl text-lg text-slate-300 mx-auto text-center">
                    A selection of projects that showcase my skills and passion for building things.
                </p>
            </div>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {projects.map((project, index) => (
                        <div className="flex-grow-0 flex-shrink-0 basis-full md:basis-1/2 lg:basis-1/3 p-4" key={index}>
                            <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
                                <div className="relative h-64 w-full overflow-hidden">
                                    <Image
                                        src={project.imageUrl}
                                        alt={project.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <h3 className="font-heading text-xl font-semibold text-slate-50">{project.title}</h3>
                                    <p className="mt-3 flex-grow text-slate-300">{project.description}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-sky-300">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex items-center space-x-4">
                                        <Button asChild variant="outline" size="sm">
                                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                                Live Demo <ArrowUpRight className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button asChild variant="ghost" size="sm">
                                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                                <Github className="mr-2 h-4 w-4" /> Source
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-0 lg:-px-8">
                <Button onClick={scrollPrev} variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-slate-800/50 hover:bg-slate-700" disabled={prevBtnDisabled}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button onClick={scrollNext} variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-slate-800/50 hover:bg-slate-700" disabled={nextBtnDisabled}>
                    <ArrowRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Dot Indicators */}
            <div className="mt-8 flex justify-center gap-2">
                {projects.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${index === selectedIndex ? 'w-4 bg-sky-300' : 'bg-slate-600 hover:bg-slate-500'}`}
                    />
                ))}
            </div>
        </div>
    );
}