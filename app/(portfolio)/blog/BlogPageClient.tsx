// src/app/blog/BlogPageClient.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Command } from 'cmdk';
import { Post } from '@/types';
import { PostCard } from '@/components/PostCard';
import { SearchButton } from '@/components/ui/SearchButton';
import { FileText } from 'lucide-react';
import { Dialog } from 'radix-ui';

interface BlogPageClientProps {
    posts: Post[];
}

export function BlogPageClient({ posts }: BlogPageClientProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        // Use a React Fragment to wrap the page content and dialog
        <>
            <div className={open ? 'content-blur' : 'transition-all duration-300'}>
                <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="font-heading text-4xl font-bold text-slate-50">Blog</h1>
                            <p className="mt-4 text-lg text-slate-300">
                                Welcome to my digital journal. Here I share my thoughts, learnings, and explorations in
                                the world of technology.
                            </p>
                        </div>
                        <SearchButton onClick={() => setOpen(true)}/>
                    </div>

                    {posts && posts.length > 0 ? (
                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post}/>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-12 text-center text-slate-400">No posts found. Check back soon!</p>
                    )}
                </div>
            </div>

                {/* The Command Palette Dialog is now a sibling to the main content div */}
                <Command.Dialog open={open} onOpenChange={setOpen} label="Search Blog Posts">
                    <Dialog.Title className="DialogTitle"/> {/* Necessary to prevent react error */}
                    <Command.Input placeholder="Type to search articles..."/>
                    <Command.List>
                        <Command.Empty>No results found.</Command.Empty>
                        <Command.Group heading="Articles">
                            {posts.map((post) => (
                                <Link href={`/app/(portfolio)/blog/${post.slug}`} key={post.id} passHref>
                                    <Command.Item onSelect={() => setOpen(false)}>
                                        <FileText className="mr-3 h-5 w-5 text-slate-400"/>
                                        <div className="flex flex-col">
                                            <span className="text-slate-50">{post.title}</span>
                                            <span className="text-xs text-slate-400">{post.summary}</span>
                                        </div>
                                    </Command.Item>
                                </Link>
                            ))}
                        </Command.Group>
                    </Command.List>
                </Command.Dialog>
            </>
            );
            }