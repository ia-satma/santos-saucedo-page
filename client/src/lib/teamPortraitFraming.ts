import framing from './teamPortraitFraming.json';
import type { CSSProperties } from 'react';

// Optical framing for the original team portraits: consistent face size and eye line.
// Keyed by filename so CMS ordering does not change a person's crop.
export function teamPortraitFraming(url: string): CSSProperties {
  const filename = url.split(/[?#]/)[0].split('/').pop() || '';
  return (framing as Record<string, CSSProperties>)[filename]
    ?? { width: '125%', left: '-12.5%', top: '0%' };
}
