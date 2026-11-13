import type { CategoryGroup } from "../types/products";

export function mergeCategories(...lists: CategoryGroup[][]): CategoryGroup[] {
  const groups = new Map<string, Set<string>>();

  for (const list of lists) {
    for (const { category, subcategories } of list) {
      const subs = groups.get(category) ?? new Set<string>();
      subcategories.forEach((s) => subs.add(s));
      groups.set(category, subs);
    }
  }

  return Array.from(groups, ([category, subs]) => ({
    category,
    subcategories: Array.from(subs).sort((a, b) => a.localeCompare(b, "es"))
  }));
}
