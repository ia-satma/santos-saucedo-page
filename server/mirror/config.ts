import path from "node:path";
/** Compatibility boundary: agents inspect Santos assets, never a copied Von Wobeser frontend. */
export function getMirrorDir() {
  return path.join(process.cwd(), "client", "public");
}
export function mirrorPath(...parts: string[]) {
  return path.join(getMirrorDir(), ...parts);
}
