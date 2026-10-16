import path from "node:path";

export const TYPOGRAPHY = Object.freeze({
  title: "Publico Text",
  body: "Geomanist",
  cssTitle: '"Publico Text", serif',
  cssBody: '"Geomanist", sans-serif',
});

const asset=(name:string)=>path.join(process.cwd(),'attached_assets',name);
export const TYPOGRAPHY_ASSETS = Object.freeze({
 gelasioVariable:asset('PublicoTextWeb-Roman_1775694400337.ttf'),
 gelasioRegular:asset('PublicoTextWeb-Roman_1775694400337.ttf'),
 gelasioBold:asset('Publico-Bold_1775694018330.ttf'),
 gelasioItalic:asset('PublicoTextWeb-Roman_1775694400337.ttf'),
 gelasioBoldItalic:asset('Publico-Bold_1775694018330.ttf'),
 interRegular:asset('geomanist-regular-webfont_1775694093666.ttf'),
 interBold:asset('geomanist-regular-webfont_1775694093666.ttf'),
 interItalic:asset('geomanist-regular-webfont_1775694093666.ttf'),
 interBoldItalic:asset('geomanist-regular-webfont_1775694093666.ttf'),
});
