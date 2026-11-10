import path from 'node:path';
import { PRESENTATION_BRAND_DIR } from '../presentationFonts';
import type { PresentationBookendTone } from './contracts';

export const PRESENTATION_LOGO = path.join(PRESENTATION_BRAND_DIR, 'logo-azul.png');

export function bookendArtworkPath(kind: 'intro' | 'closing', tone: PresentationBookendTone): string {
  return path.join(PRESENTATION_BRAND_DIR, `${kind}-${tone}.png`);
}
