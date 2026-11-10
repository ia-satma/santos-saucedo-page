import { PDFDocument } from 'pdf-lib';
import { OUTPUT_HEIGHT, OUTPUT_WIDTH } from './designSystem';

export async function createPdfFromPngs(pngBuffers: Buffer[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (const png of pngBuffers) {
    const image = await pdf.embedPng(png);
    const page = pdf.addPage([OUTPUT_WIDTH, OUTPUT_HEIGHT]);
    page.drawImage(image, { x: 0, y: 0, width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT });
  }
  return pdf.save();
}
