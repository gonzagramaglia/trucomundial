import { describe, it, expect } from 'vitest';
import { getAssetUrl } from '../../lib/assets';

describe('assets utility', () => {
  it('returns empty string when given empty input', () => {
    expect(getAssetUrl('')).toBe('');
  });

  it('leaves absolute external URLs untouched', () => {
    expect(getAssetUrl('https://example.com/image.png')).toBe('https://example.com/image.png');
    expect(getAssetUrl('http://example.com/image.png')).toBe('http://example.com/image.png');
    expect(getAssetUrl('data:image/png;base64,123')).toBe('data:image/png;base64,123');
  });

  it('prefixes local paths correctly', () => {
    const base = import.meta.env.BASE_URL || './';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;

    const url1 = getAssetUrl('/playground.jpeg');
    expect(url1).toBe(`${normalizedBase}playground.jpeg`);

    const url2 = getAssetUrl('stickers/argentina/figu.png');
    expect(url2).toBe(`${normalizedBase}stickers/argentina/figu.png`);
  });
});
