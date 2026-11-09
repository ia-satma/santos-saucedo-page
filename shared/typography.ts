import fs from "node:fs";
import path from "node:path";

export const TYPOGRAPHY = Object.freeze({
  title: "Publico Text",
  body: "Geomanist",
  cssTitle: '"Publico Text", serif',
  cssBody: '"Geomanist", sans-serif',
});

const asset = (name: string, fallback: string) => {
  const preferred = path.join(process.cwd(), 'attached_assets', name);
  if (fs.existsSync(preferred)) return preferred;
  return path.join(process.cwd(), 'client', 'src', 'styles', 'fonts', fallback);
};
export const TYPOGRAPHY_ASSETS = Object.freeze({
 gelasioVariable: asset('PublicoTextWeb-Roman_1775694400337.ttf', 'Newsreader-Roman-latin.woff2'),
 gelasioRegular: asset('PublicoTextWeb-Roman_1775694400337.ttf', 'Newsreader-Roman-latin.woff2'),
 gelasioBold: asset('Publico-Bold_1775694018330.ttf', 'Newsreader-Roman-latin.woff2'),
 gelasioItalic: asset('PublicoTextWeb-Roman_1775694400337.ttf', 'Newsreader-Italic300-latin.woff2'),
 gelasioBoldItalic: asset('Publico-Bold_1775694018330.ttf', 'Newsreader-Italic300-latin.woff2'),
 interRegular: asset('geomanist-regular-webfont_1775694093666.ttf', 'HankenGrotesk-r-latin.woff2'),
 interBold: asset('geomanist-regular-webfont_1775694093666.ttf', 'HankenGrotesk-r-latin.woff2'),
 interItalic: asset('geomanist-regular-webfont_1775694093666.ttf', 'HankenGrotesk-i-latin.woff2'),
 interBoldItalic: asset('geomanist-regular-webfont_1775694093666.ttf', 'HankenGrotesk-i-latin.woff2'),
});
