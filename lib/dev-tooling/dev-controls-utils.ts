/**
 * Dev Controls section visibility helpers.
 *
 * Variant sections with a single option are hidden — there is nothing to choose.
 * Toggle and action sections are always rendered when their parent includes them.
 */

export function shouldShowVariantSection(optionCount: number): boolean {
  return optionCount > 1;
}

export function hasVisibleDevControlSections(
  sectionVisibility: boolean[]
): boolean {
  return sectionVisibility.some(Boolean);
}
