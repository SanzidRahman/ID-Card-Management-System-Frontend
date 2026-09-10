'use client';

import { QRCodeSVG } from 'qrcode.react';
import { getCanvasPx } from '../../lib/cardDimensions';

const valueFor = (element, record = {}) => {
  const value = record?.data?.[element.fieldName] ?? record?.[element.fieldName];
  if (value === null || value === undefined || value === '') {
    if (element.fallbackBehavior === 'hide') return null;
    return element.fallbackBehavior === 'empty' ? '' : (element.fallbackValue || 'N/A');
  }
  return String(value);
};

export default function IDCardRenderer({ template, side = 'front', record, verificationUrl, className = '' }) {
  const card = template?.[side];
  if (!template || !card) return null;
  const { width, height } = getCanvasPx(template);
  const background = card.background || { type: 'color', value: '#fff' };
  return <div className={`relative overflow-hidden shadow-xl ${className}`} style={{ width, height, background: background.type === 'image' ? `center / ${background.size || 'cover'} no-repeat url(${background.value})` : background.value }}>
    {(card.elements || []).slice().sort((a, b) => a.zIndex - b.zIndex).map((el) => {
      const base = { position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, transform: `rotate(${el.rotation || 0}deg)`, opacity: el.opacity ?? 1, zIndex: el.zIndex, overflow: 'hidden' };
      const style = { ...base, fontFamily: el.style?.fontFamily || 'Arial', fontSize: el.style?.fontSize || 16, fontWeight: el.style?.fontWeight || 'normal', fontStyle: el.style?.fontStyle || 'normal', color: el.style?.color || '#000', backgroundColor: el.style?.backgroundColor || 'transparent', textAlign: el.style?.textAlign || 'left', lineHeight: el.style?.lineHeight || 1.2, letterSpacing: el.style?.letterSpacing || 0 };
      if (el.type === 'static_text') return <div key={el.id} style={style}>{el.content}</div>;
      if (el.type === 'dynamic_text') { const value = valueFor(el, record); return value === null ? null : <div key={el.id} style={style}>{el.prefix || ''}{value}{el.suffix || ''}</div>; }
      if (el.type === 'static_image' || el.type === 'dynamic_image') { const src = el.type === 'static_image' ? el.src : valueFor(el, record); return src ? <img key={el.id} src={src} alt="" style={{ ...base, objectFit: el.objectFit || 'cover', borderRadius: el.borderRadius || 0, border: `${el.borderWidth || 0}px solid ${el.borderColor || '#000'}` }} /> : <div key={el.id} style={{ ...base, background: '#e2e8f0', border: '1px dashed #94a3b8', color: '#64748b', display: 'grid', placeItems: 'center', fontSize: 12 }}>Image</div>; }
      if (el.type === 'qr_code') return <div key={el.id} style={{ ...base, background: 'white', padding: el.qrMargin || 4 }}><QRCodeSVG value={verificationUrl || 'https://verify.invalid/pending'} width="100%" height="100%" level={el.errorCorrectionLevel || 'M'} /></div>;
      if (el.type === 'shape_circle') return <div key={el.id} style={{ ...base, borderRadius: '50%', background: el.fill, border: `${el.strokeWidth || 0}px solid ${el.stroke || '#000'}` }} />;
      return <div key={el.id} style={{ ...base, background: el.type === 'shape_line' ? el.stroke : el.fill, border: el.type === 'shape_line' ? undefined : `${el.strokeWidth || 0}px solid ${el.stroke || '#000'}`, borderRadius: el.borderRadius || 0, height: el.type === 'shape_line' ? (el.strokeWidth || 2) : el.height }} />;
    })}
  </div>;
}

