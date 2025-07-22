'use client';

import { motion } from 'framer-motion';
import { LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent } from 'react';

interface BentoCardProps {
    name: string;
    category: string;
    Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>;
    description: string;
    className?: string; // Add className to props
    onClick: () => void;
}

export function BentoCard({ name, category, Icon, description, className, onClick }: BentoCardProps) {
    return (
        <motion.div
            layoutId={`card-${name}`}
            onClick={onClick}
            // Apply the passed className here for grid layout control
            className={`relative flex flex-col justify-between p-6 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer 
                 transition-all duration-300 hover:border-sky-300/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-sky-900/50
                 ${className}`}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex-grow">
                <Icon className="h-8 w-8 text-sky-300 mb-4" />
                <h3 className="font-heading text-xl font-semibold text-slate-50">{name}</h3>
                <p className="text-slate-400 text-sm mt-2">{description}</p>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-4">{category}</p>
        </motion.div>
    );
}