"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Counter from "@/components/primitives/misc/Counter";
import { incrementCounter } from "@/app/actions/counter";
import { core } from "@/constants/theme";

const SESSION_STORAGE_KEY = "contact_counter_clicked";
const QUIRKY_MESSAGES = [
  "You clicked it! Why? Who knows! 🤷",
  "The counter goes up. The universe remains unchanged. ✨",
  "Congratulations! You've successfully incremented a number! 🎉",
  "That's one more click that will be remembered... somewhere... maybe... 🗄️",
  "The button was clicked. The counter incremented. All is right with the world. 🌍",
];

export function FunCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [hasClicked, setHasClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Check if user has already clicked in this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const clicked = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (clicked === "true") {
        setHasClicked(true);
      }
    }
  }, []);

  const handleClick = async () => {
    if (hasClicked || isLoading) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Call the server action to increment counter
      const newCount = await incrementCounter();
      setCount(newCount);
      setHasClicked(true);

      // Store in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      }

      // Show a random quirky message
      const randomMessage =
        QUIRKY_MESSAGES[Math.floor(Math.random() * QUIRKY_MESSAGES.length)];
      setMessage(randomMessage);
    } catch (error) {
      console.error("Failed to increment counter:", error);
      setMessage("Oops! Something went wrong. But hey, you tried! 💪");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8 rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-sky-300" />
        <h3 className="font-semibold text-slate-200">
          Useless Counter Challenge
        </h3>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        Click the button below to increment a counter for absolutely no reason.
        It&apos;s stored in a database somewhere (or will be, eventually). One
        click per session, because even randomness needs rules.
      </p>

      <div className="flex flex-col items-center gap-4">
        {count !== null ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex items-center justify-center"
          >
            <Counter
              value={count}
              fontSize={48}
              textColor={core.foreground.secondary}
              fontWeight="bold"
              places={[10000, 1000, 100, 10, 1]}
              gap={4}
            />
          </motion.div>
        ) : (
          <div className="h-16 flex items-center justify-center">
            <span className="text-4xl font-bold text-slate-600">---</span>
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={hasClicked || isLoading}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            hasClicked
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : isLoading
                ? "bg-sky-600 text-slate-200 cursor-wait"
                : "bg-sky-500 text-white hover:bg-sky-400 active:scale-95"
          }`}
        >
          {isLoading
            ? "Incrementing..."
            : hasClicked
              ? "Already clicked this session!"
              : "Click Me (For Science!)"}
        </button>

        {message && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-slate-300 italic"
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
