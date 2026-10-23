import { describe, it, expect } from 'vitest';
import { getAssetUrl, getAppRoute } from '../../lib/assets';

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

  it('resolves /trucomundial/ subpath when running on github.io domain or trucomundial subpath', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          hostname: 'gonzagramaglia.github.io',
          pathname: '/trucomundial/mazo',
        },
      },
      writable: true,
      configurable: true,
    });

    expect(getAssetUrl('/stickers/argentina/figu.png')).toBe('/trucomundial/stickers/argentina/figu.png');

    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          hostname: 'example.com',
          pathname: '/trucomundial',
        },
      },
      writable: true,
      configurable: true,
    });

    expect(getAssetUrl('/card-back.png')).toBe('/trucomundial/card-back.png');

    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  it('resolves internal application routes with deployment base and language prefix', () => {
    expect(getAppRoute('')).toBe('/');

    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          hostname: 'gonzagramaglia.github.io',
          pathname: '/trucomundial/mazo',
        },
      },
      writable: true,
      configurable: true,
    });

    expect(getAppRoute('/votar')).toBe('/trucomundial/votar');
    expect(getAppRoute('prode')).toBe('/trucomundial/prode');

    // With English prefix
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          hostname: 'gonzagramaglia.github.io',
          pathname: '/trucomundial/en/mazo',
        },
      },
      writable: true,
      configurable: true,
    });

    expect(getAppRoute('/votar')).toBe('/trucomundial/en/votar');

    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });
});
