import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, absoluteUrl } from '../lib/siteMap';
import { DEFAULT_DESCRIPTION, DEFAULT_IMAGE, clipDescription, fullTitle } from '../lib/pageMeta';

// Finds the tag matching `selector`, creating it with `attrs` when missing.
const upsert = (tag, selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

const setMeta = (key, content, attr = 'name') => {
  if (!content) {
    document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
    return;
  }
  upsert('meta', `meta[${attr}="${key}"]`, { [attr]: key, content });
};

/**
 * Per-page head tags. `noindex` keeps error and private pages out of search
 * results; `jsonLd` is one schema.org object (or an array of them).
 */
const SEO = ({
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  keywords = '',
  ogImage,
  ogType = 'website',
  noindex = false,
  jsonLd = null,
}) => {
  const { pathname } = useLocation();
  // One canonical form: no trailing slash except on the root.
  const canonicalUrl = absoluteUrl(pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/');
  const titleText = fullTitle(title);
  const desc = clipDescription(description);
  const image = absoluteUrl(ogImage || DEFAULT_IMAGE);
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = titleText;
    setMeta('description', desc);
    setMeta('keywords', keywords);
    setMeta('robots', noindex ? 'noindex, follow' : '');

    setMeta('og:title', titleText, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:type', ogType, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', titleText);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', image);

    if (noindex) {
      document.head.querySelector('link[rel="canonical"]')?.remove();
    } else {
      upsert('link', 'link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
    }

    const script = document.head.querySelector('script[data-seo-jsonld]');
    if (ld) {
      const el = script ?? document.head.appendChild(Object.assign(document.createElement('script'), { type: 'application/ld+json' }));
      el.setAttribute('data-seo-jsonld', '');
      el.textContent = ld;
    } else {
      script?.remove();
    }
  }, [titleText, desc, keywords, image, ogType, canonicalUrl, noindex, ld]);

  return null;
};

export default SEO;
