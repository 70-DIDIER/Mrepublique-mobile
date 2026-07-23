export const API_URL = 'https://limegreen-wombat-728254.hostingersite.com/api';

// Origine du serveur (sans le /api) — sert à reconstruire les URLs de fichiers
export const API_HOST = API_URL.replace(/\/api\/?$/, '');

// Hôtes de développement qui peuvent encore apparaître dans les données
// renvoyées par l'API (images enregistrées quand le back tournait en local).
const LOCAL_HOST_PATTERN =
  /^https?:\/\/(127\.0\.0\.1|localhost|10\.0\.2\.2|10\.0\.201\.76|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?/i;

/**
 * Normalise une URL d'image renvoyée par l'API vers le serveur en ligne :
 * réécrit les anciens hôtes locaux et préfixe les chemins relatifs.
 */
export const resolveImageUrl = (imageUrl?: string | null, fallback = ''): string => {
  if (!imageUrl) return fallback;
  if (LOCAL_HOST_PATTERN.test(imageUrl)) {
    return imageUrl.replace(LOCAL_HOST_PATTERN, API_HOST);
  }
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_HOST}/${imageUrl.replace(/^\//, '')}`;
};
