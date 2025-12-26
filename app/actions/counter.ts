"use server";

/**
 * Stub function for incrementing the counter in the database.
 * This will be replaced with actual database logic later.
 *
 * @returns Promise<number> The new count value (currently returns a random number for demo)
 */
export async function incrementCounter(): Promise<number> {
  // TODO: Implement actual database increment
  // - Connect to Directus or database
  // - Increment the counter value
  // - Return the new count

  // For now, simulate a database call with a delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return a random number between 1000-9999 for demo purposes
  // In production, this would return the actual count from the database
  return Math.floor(Math.random() * 9000) + 1000;
}
