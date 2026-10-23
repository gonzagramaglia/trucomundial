/**
 * Utility to resolve public asset paths correctly across different deployment environments,
 * such as GitHub Pages subpaths (e.g. /trucomundial/) or standard root deployments.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const configuredBase = import.meta.env.BASE_URL;
  let base: string;

  if (configuredBase && configuredBase !== '/' && configuredBase !== './') {
    base = configuredBase;
  } else if (
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('github.io') || window.location.pathname.startsWith('/trucomundial'))
  ) {
    base = '/trucomundial/';
  } else {
    base = configuredBase || '/';
    if (base === './') base = '/';
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}

/**
 * Resolves internal application routes, taking into account configured deployment base paths
 * (such as /trucomundial/ on GitHub Pages) and preserving language prefixes if applicable.
 */
export function getAppRoute(path: string): string {
  if (!path) return '/';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const configuredBase = import.meta.env.BASE_URL;

  let base = '';
  if (configuredBase && configuredBase !== '/' && configuredBase !== './') {
    base = configuredBase.endsWith('/') ? configuredBase.slice(0, -1) : configuredBase;
  } else if (
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('github.io') || window.location.pathname.startsWith('/trucomundial'))
  ) {
    base = '/trucomundial';
  }

  let langPrefix = '';
  if (typeof window !== 'undefined') {
    const current = window.location.pathname;
    const isEn = current.startsWith(`${base}/en`) || current.startsWith('/en');
    if (isEn && !cleanPath.startsWith('/en')) {
      langPrefix = '/en';
    }
  }

  return `${base}${langPrefix}${cleanPath}`;
}
