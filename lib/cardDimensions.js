/**
 * Card dimension presets and conversion utilities (client-side mirror of server).
 * All presets in mm. Designer works in px at 96 DPI.
 */

export const MM_TO_PX = 3.7795275591;
export const PX_TO_MM = 1 / MM_TO_PX;

export const CARD_PRESETS = {
  CR80: { name: 'CR80 (Standard)', width: 85.6, height: 53.98, description: 'Standard ID card size' },
  CR79: { name: 'CR79', width: 83.82, height: 51.44, description: 'Adhesive-back card' },
  A7: { name: 'A7', width: 105, height: 74, description: 'A7 paper size' },
  CUSTOM: { name: 'Custom', width: 85.6, height: 53.98, description: 'Custom dimensions' },
};

export const mmToPx = (mm) => Math.round(mm * MM_TO_PX * 100) / 100;
export const pxToMm = (px) => Math.round(px * PX_TO_MM * 100) / 100;

/** Get canvas dimensions in px from a template object */
export const getCanvasPx = (template) => {
  const w = template.unit === 'mm' ? mmToPx(template.width) : template.width;
  const h = template.unit === 'mm' ? mmToPx(template.height) : template.height;
  return { width: w, height: h };
};

/** Generate a unique element ID */
export const genElementId = () => `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Available font families for the designer */
export const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New',
  'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
];

export const FONT_WEIGHTS = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
