'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const projects = [
    {
        title: 'Project Alpha',
        description: 'A full-stack web application for real-time data visualization, built with Next.js, TypeScript, and a GraphQL backend.',
        imageUrl: '/', // Replace with your project screenshot
        tags: ['Next.js', 'TypeScript', 'GraphQL', 'PostgreSQL'],
        liveUrl: '#',
        githubUrl: '#',
    },
    {
        title: 'Project Beta',
        description: 'A mobile-first progressive web app for collaborative task management, featuring offline support and push notifications.',
        imageUrl: '/', // Replace with your project screenshot
        tags: ['React', 'PWA', 'Firebase', 'Node.js'],
        liveUrl: '#',
        githubUrl: '#',
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Home page projects section method 1: a Grid of Featured Projects
export function FeaturedProjects() {
    return (
        <section className="py-16 md:py-24 border-t border-slate-800">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="font-heading text-3xl font-bold text-slate-50 sm:text-4xl">
                        Featured Projects
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                        A selection of projects that showcase my skills and passion for building things.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800"
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            <div className="relative h-64 w-full overflow-hidden">
                                <Image
                                    src={project.imageUrl}
                                    alt={project.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="font-heading text-xl font-semibold text-slate-50">
                                    {project.title}
                                </h3>
                                <p className="mt-3 flex-grow text-slate-300">{project.description}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {project.tags.map((tag) => (
                                        <span key={tag} className="rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-sky-300">
                      {tag}
                    </span>
                                    ))}
                                </div>
                                <div className="mt-6 flex items-center space-x-4">
                                    <Button asChild variant="outline">
                                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                            Live Demo <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button asChild variant="ghost">
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                            <Github className="mr-2 h-4 w-4" /> View Source
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}