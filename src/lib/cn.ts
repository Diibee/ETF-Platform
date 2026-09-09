type ClassValue = string | number | false | null | undefined;

/**
 * Joins class names, dropping falsy values. Deliberately dependency-free:
 * the design system never needs conflict resolution because variants are
 * built from mutually exclusive lookup tables rather than overrides.
 */
export function cn(...values: ClassValue[]): string {
  let out = '';
  for (const v of values) {
    if (!v && v !== 0) continue;
    out = out ? `${out} ${v}` : String(v);
  }
  return out;
}
