const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);

export function mergeCms<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    if (!base.length) return structuredClone(override) as T;
    return override.map((value, i) => mergeCms(base[i] ?? base[0], value)) as T;
  }
  if (base !== null && typeof base === "object") {
    if (!override || typeof override !== "object" || Array.isArray(override)) return base;
    const out = { ...base } as Record<string, unknown>;
    for (const key of Object.keys(out)) {
      if (!blockedKeys.has(key) && Object.prototype.hasOwnProperty.call(override, key)) {
        out[key] = mergeCms(out[key], (override as Record<string, unknown>)[key]);
      }
    }
    return out as T;
  }
  return typeof base === typeof override ? (override as T) : base;
}
