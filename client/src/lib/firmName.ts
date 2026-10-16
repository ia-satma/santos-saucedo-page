// "Santos & Saucedo" nunca se parte entre líneas: espacios duros (U+00A0) alrededor del &.
export const keepFirmName = (text: string): string =>
  text.replace(/Santos & Saucedo/g, "Santos & Saucedo");
