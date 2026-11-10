import fs from 'node:fs';
import path from 'node:path';
import { PRESENTATION_BRAND_DIR } from '../presentationFonts';
import { H, W, OUTPUT_WIDTH, renderPresentationSvg } from './designSystem';

export const PRESENTATION_LOGO = path.join(PRESENTATION_BRAND_DIR, 'logo-azul.png');
const WHITE_LOGO = path.join(PRESENTATION_BRAND_DIR, 'logo-blanco.png');
const SYMBOL = path.join(PRESENTATION_BRAND_DIR, 'ss-simbolo.png');

export const BRAND_SLOGAN = 'Derecho laboral para empresas';
export const BRAND_LOCATION = 'San Pedro Garza García · Desde 2010';

const imageData = (file: string) => `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
const IMAGE_ASSETS = new Map<string, string>();
function image(file: string, x: number, y: number, w: number, h: number, attributes = '') {
  let data = IMAGE_ASSETS.get(file);
  if (!data) {
    data = imageData(file);
    IMAGE_ASSETS.set(file, data);
  }
  return `<image href="${data}" x="${x}" y="${y}" width="${w}" height="${h}" ${attributes}/>`;
}

export function bookendArtwork(closing: boolean): string {
  return `<defs>
    <linearGradient id="institutional" x2="0" y2="1">
      <stop stop-color="#0C2340"/><stop offset="1" stop-color="#145385"/>
    </linearGradient>
    <filter id="watermark"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#institutional)"/>
  ${image(SYMBOL, closing ? 936 : 1000, closing ? 42 : 4, 480, 720, 'filter="url(#watermark)" opacity="0.08"')}
  ${closing
    ? `<path d="M627 0V563 M100 563H1180" fill="none" stroke="#fff" opacity="0.26"/>${image(WHITE_LOGO, 87, 581, 332, 96)}`
    : image(WHITE_LOGO, 202, 120, 876, 243)}
  <rect x="100" y="${closing ? 397 : 581}" width="92" height="3" fill="#BBF741"/> `;
}

const artworkPngs = new Map<boolean, Buffer>();
export function bookendArtworkPng(closing: boolean): Buffer {
  let artwork = artworkPngs.get(closing);
  if (!artwork) {
    artwork = renderPresentationSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${bookendArtwork(closing)}</svg>`,
      OUTPUT_WIDTH,
    );
    artworkPngs.set(closing, artwork);
  }
  return artwork;
}
