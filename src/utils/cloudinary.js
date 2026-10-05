/**
 * Cloudinary Delivery & Responsive Optimization Helper
 * HAXUDIO DIGITAL SOLUTIONS
 *
 * Transforms Cloudinary image URLs dynamically at render-time to deliver:
 * - Modern auto-formatting (WebP/AVIF via `f_auto`)
 * - Perceptual quality compression (via `q_auto`)
 * - Responsive viewport-specific scaling (via `w_<width>,c_limit`)
 *
 * NOTE: Non-Cloudinary URLs (e.g. local assets in /src/assets/images/)
 * are preserved and returned completely unchanged. Original URLs stored
 * in MongoDB Atlas are never mutated.
 */

const CLOUDINARY_REGEX = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

/**
 * Returns an optimized delivery URL for a given image.
 *
 * @param {string} url - Source image URL (Cloudinary or local)
 * @param {object} options - Optimization parameters
 * @param {number} [options.width] - Maximum display width in pixels
 * @param {string} [options.quality='auto'] - Cloudinary quality mode
 * @param {string} [options.format='auto'] - Cloudinary format mode
 * @param {string} [options.crop='limit'] - Cloudinary crop mode
 * @returns {string} Optimized image URL or original unchanged URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return '';

  const match = url.match(CLOUDINARY_REGEX);
  if (!match) {
    // Local assets, relative paths, or non-Cloudinary images returned unchanged
    return url;
  }

  const prefix = match[1];
  const rest = match[2];

  // If already transformed with f_auto or q_auto, avoid duplicate transforms
  if (rest.startsWith('f_auto') || rest.startsWith('q_auto')) {
    return url;
  }

  const transforms = [];
  const format = options.format || 'auto';
  const quality = options.quality || 'auto';
  const crop = options.crop || 'limit';

  transforms.push(`f_${format}`);
  transforms.push(`q_${quality}`);

  if (options.width && typeof options.width === 'number') {
    transforms.push(`w_${options.width}`);
    transforms.push(`c_${crop}`);
  }

  const transformString = transforms.join(',') + '/';
  return `${prefix}${transformString}${rest}`;
}

/**
 * Generates a responsive srcset attribute for Cloudinary images.
 *
 * @param {string} url - Source image URL
 * @param {number[]} widths - Array of breakpoint widths (default: [480, 768, 1024, 1440])
 * @returns {string|null} Responsive srcset string or null if not a Cloudinary image
 */
export function getCloudinarySrcSet(url, widths = [480, 768, 1024, 1440]) {
  if (!url || typeof url !== 'string' || !CLOUDINARY_REGEX.test(url)) {
    return null;
  }

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Default sizes attribute helper for common responsive layouts
 */
export const RESPONSIVE_SIZES = {
  hero: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
  thumbnail: '(max-width: 640px) 120px, 200px',
  fullscreen: '100vw',
};
