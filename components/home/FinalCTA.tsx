'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function FinalCTA() {
    return (
        <motion.section
            className="py-16 md:py-24 border-t border-slate-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
        >
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
                    Let's Build Something Together
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
                    I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision.
                </p>
                <div className="mt-8">
                    <Button asChild size="lg">
                        <Link href="/contact">Get in Touch</Link>
                    </Button>
                </div>
            </div>
        </motion.section>
    );
}