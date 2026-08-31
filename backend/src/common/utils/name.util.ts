/**
 * Normalizes a user name to a stable, comparable key used to enforce
 * uniqueness. Example inputs such as "mr-essam", "mr.essam", "Mr Essam"
 * and "عصام" are all supported; the key collapses whitespace, lowercases
 * Latin characters and strips common separators so near-duplicate names
 * cannot be registered twice. Arabic characters are preserved as-is.
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.\-_]/g, '');
}
