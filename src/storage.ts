export function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`glorp2:${key}`);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
export function save(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(`glorp2:${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
