/**
 * Image Optimizer for Explore Scripture
 * Implements lazy loading, WebP support, and responsive images
 */

class ImageOptimizer {
  constructor() {
    this.supportsWebP = null;
    this.supportsIntersectionObserver = typeof IntersectionObserver !== 'undefined';
    this.lazyImages = [];
    this.resizeTimeout = null;
    this.boundHandleResize = null;
    this.init();
  }

  async init() {
    // Check WebP support
    await this.checkWebPSupport();

    // Set up lazy loading
    this.setupLazyLoading();

    // Optimize existing images
    this.optimizeExistingImages();

    // Set up responsive image handling
    this.setupResponsiveImages();
  }

  async checkWebPSupport() {
    if (typeof Image === 'undefined') {
      return false;
    }

    return new Promise(resolve => {
      // eslint-disable-next-line no-undef
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.supportsWebP = webP.height === 2;
        resolve(this.supportsWebP);
      };
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  setupLazyLoading() {
    if (this.supportsIntersectionObserver) {
      // eslint-disable-next-line no-undef
      this.intersectionObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              this.intersectionObserver.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before image comes into view
        }
      );

      this.observeImages();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  observeImages() {
    // Find all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src], picture[data-src]');
    lazyImages.forEach(img => {
      this.intersectionObserver.observe(img);
    });

    // Also observe images that will be added dynamically
    this.observeNewImages();
  }

  observeNewImages() {
    if (typeof MutationObserver === 'undefined') return;

    // Check if document.body exists before observing
    if (!document.body) {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.observeNewImages());
      }
      return;
    }

    // eslint-disable-next-line no-undef
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Element node
            // Check if the node itself is a lazy image
            if (node.matches && node.matches('img[data-src], picture[data-src]')) {
              this.intersectionObserver.observe(node);
            }
            // Check for lazy images within the node
            const lazyImages =
              node.querySelectorAll && node.querySelectorAll('img[data-src], picture[data-src]');
            if (lazyImages) {
              lazyImages.forEach(img => this.intersectionObserver.observe(img));
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  loadImage(element) {
    const src = element.dataset.src;
    const srcset = element.dataset.srcset;

    if (!src || typeof Image === 'undefined') return;

    // Create new image to test loading
    // eslint-disable-next-line no-undef
    const img = new Image();

    img.onload = () => {
      // Image loaded successfully
      if (element.tagName === 'IMG') {
        element.src = this.getOptimizedImageUrl(src);
        if (srcset) {
          element.srcset = this.getOptimizedSrcSet(srcset);
        }
      } else if (element.tagName === 'PICTURE') {
        this.loadPictureElement(element);
      }

      // Add loaded class for CSS transitions
      element.classList.add('image-loaded');
      element.classList.remove('image-loading');

      // Remove data attributes to prevent reprocessing
      delete element.dataset.src;
      delete element.dataset.srcset;
    };

    img.onerror = () => {
      // Image failed to load, use fallback
      element.src = this.getFallbackImage();
      element.classList.add('image-error');
      element.classList.remove('image-loading');
    };

    // Add loading class
    element.classList.add('image-loading');

    // Start loading
    img.src = src;
  }

  loadPictureElement(picture) {
    const sources = picture.querySelectorAll('source[data-srcset]');
    sources.forEach(source => {
      source.srcset = this.getOptimizedSrcSet(source.dataset.srcset);
      delete source.dataset.srcset;
    });

    const img = picture.querySelector('img[data-src]');
    if (img) {
      img.src = this.getOptimizedImageUrl(img.dataset.src);
      delete img.dataset.src;
    }
  }

  getOptimizedImageUrl(originalUrl) {
    // Convert to WebP if supported and not already WebP
    if (this.supportsWebP && !originalUrl.includes('.webp')) {
      return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return originalUrl;
  }

  getOptimizedSrcSet(srcset) {
    if (!this.supportsWebP) return srcset;

    // Convert all images in srcset to WebP
    return srcset.replace(/\.(jpg|jpeg|png)(\s+\d+[wx])/gi, '.webp$2');
  }

  getFallbackImage() {
    // Return a small placeholder SVG
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
  }

  optimizeExistingImages() {
    // Add loading="lazy" to images that don't have it
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.loading = 'lazy';
    });

    // Convert existing images to lazy loading format
    const immediateImages = document.querySelectorAll('img[src]:not([data-src])');
    immediateImages.forEach(img => {
      if (this.isImageBelowFold(img)) {
        // Move src to data-src for lazy loading
        img.dataset.src = img.src;
        img.src = this.getPlaceholderImage(img);
        this.intersectionObserver?.observe(img);
      }
    });
  }

  isImageBelowFold(img) {
    const rect = img.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top > windowHeight;
  }

  getPlaceholderImage(img) {
    const width = img.width || 400;
    const height = img.height || 300;

    if (typeof btoa === 'undefined') {
      return `data:image/svg+xml,<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="%23ccc" text-anchor="middle" dy=".3em">Loading...</text></svg>`;
    }

    // eslint-disable-next-line no-undef
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#ccc" text-anchor="middle" dy=".3em">Loading...</text>
      </svg>
    `)}`;
  }

  setupResponsiveImages() {
    // Create responsive image configurations
    this.responsiveBreakpoints = {
      small: 480,
      medium: 768,
      large: 1024,
      xlarge: 1200,
    };

    // Add resize listener to update image sources if needed
    this.boundHandleResize = () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.handleResize(), 250);
    };

    window.addEventListener('resize', this.boundHandleResize);
  }

  handleResize() {
    // Re-evaluate loaded images for better responsive variants
    const loadedImages = document.querySelectorAll('img.image-loaded[srcset]');
    loadedImages.forEach(_img => {
      // Browser should handle this automatically with srcset
      // but we could add custom logic here if needed
    });
  }

  // Create responsive image markup
  createResponsiveImage(baseUrl, alt, sizes = '100vw', className = '') {
    const formats = this.supportsWebP ? ['webp', 'jpg'] : ['jpg'];
    const breakpoints = [400, 800, 1200, 1600];

    let pictureHtml = '<picture>';

    formats.forEach(format => {
      const srcset = breakpoints.map(width => `${baseUrl}-${width}.${format} ${width}w`).join(', ');

      if (format === 'webp') {
        pictureHtml += `<source srcset="${srcset}" sizes="${sizes}" type="image/webp">`;
      }
    });

    // Fallback img tag
    const fallbackSrcset = breakpoints.map(width => `${baseUrl}-${width}.jpg ${width}w`).join(', ');

    pictureHtml += `<img 
      src="${baseUrl}-800.jpg" 
      srcset="${fallbackSrcset}" 
      sizes="${sizes}"
      alt="${alt}" 
      class="${className} lazy-image"
      loading="lazy"
    >`;

    pictureHtml += '</picture>';
    return pictureHtml;
  }

  // Preload critical images
  preloadCriticalImages(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.getOptimizedImageUrl(url);
      document.head.appendChild(link);
    });
  }

  loadAllImages() {
    // Fallback for browsers without IntersectionObserver
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => this.loadImage(img));
  }

  getStats() {
    return {
      supportsWebP: this.supportsWebP,
      supportsIntersectionObserver: this.supportsIntersectionObserver,
      totalLazyImages: document.querySelectorAll('img[data-src]').length,
      loadedImages: document.querySelectorAll('img.image-loaded').length,
    };
  }

  destroy() {
    // Clear resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    // Remove resize listener
    if (this.boundHandleResize) {
      window.removeEventListener('resize', this.boundHandleResize);
      this.boundHandleResize = null;
    }

    // Disconnect intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }
}

// Initialize image optimizer
const imageOptimizer = new ImageOptimizer();

// Expose to global scope
window.imageOptimizer = imageOptimizer;
window.createResponsiveImage = (...args) => imageOptimizer.createResponsiveImage(...args);
window.preloadCriticalImages = urls => imageOptimizer.preloadCriticalImages(urls);

// Add CSS for image transitions
const imageCSS = `
  .lazy-image {
    transition: opacity 0.3s ease;
  }
  .image-loading {
    opacity: 0.5;
  }
  .image-loaded {
    opacity: 1;
  }
  .image-error {
    opacity: 0.7;
    filter: grayscale(100%);
  }
`;

const style = document.createElement('style');
style.textContent = imageCSS;
document.head.appendChild(style);

console.log('[ImageOptimizer] Initialized with lazy loading and WebP support');
