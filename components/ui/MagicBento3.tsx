"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { techCategories } from "@/data/skills";

type Skill = { name: string; description: string };
type SelectedCard = {
  category: string;
  skills: Skill[];
};

export function BentoGrid() {
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);

  const handleCardClick = (categoryData: SelectedCard) => {
    setSelectedCard(categoryData);
  };

  const handleClose = () => {
    setSelectedCard(null);
  };

  return (
    <div className="relative flex items-center justify-center my-16">
      {/* Updated grid classes for the bento layout */}
      <motion.div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[12rem] gap-4 w-full max-w-5xl">
        {techCategories.map((categoryData) => (
          <BentoCard
            key={categoryData.category}
            name={categoryData.category}
            category="Category"
            Icon={categoryData.icon}
            description={`View skills related to ${categoryData.category}.`}
            className={categoryData.className} // Pass the layout className
            onClick={() => handleCardClick(categoryData)}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedCard && (
          // The detail card modal remains unchanged
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              layoutId={`card-${selectedCard.category}`}
              className="relative w-full max-w-lg p-8 rounded-xl bg-slate-900 border border-sky-300/50 shadow-2xl shadow-sky-900/50"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
              >
                <X />
              </motion.button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
              >
                <h2 className="font-heading text-3xl font-bold text-sky-300">
                  {selectedCard.category}
                </h2>
                <div className="mt-6 space-y-4">
                  {selectedCard.skills.map((skill) => (
                    <div key={skill.name}>
                      <h4 className="font-semibold text-slate-50">
                        {skill.name}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
