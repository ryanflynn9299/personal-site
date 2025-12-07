import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to conditionally join class names together.
 * It uses `clsx` to handle conditional classes and `tailwind-merge`
 * to intelligently merge Tailwind CSS classes without style conflicts.
 *
 * @param {...ClassValue} inputs - A list of class values to be merged.
 * These can be strings, arrays, or objects with boolean values.
 * @returns {string} The final, merged class name string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
