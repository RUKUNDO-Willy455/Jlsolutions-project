import { useEffect } from 'react';
import { absoluteUrl, routeMeta, SITE_URL } from '../data/routes';
import { SITE } from '../data/site';

function findOrCreateMeta(selector: string, attr: string, attrValue: string): HTMLMetaElement {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  return el;
}

function findOrCreateLink(rel: string): HTMLLinkElement {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  return el;
}

/**
 * Keeps per-page SEO head tags in sync with the current route: document title,
 * description, canonical URL and Open Graph/Twitter cards.
 */
export function useSeo(path: string) {
  useEffect(() => {
    const meta = routeMeta(path);
    const url = absoluteUrl(path);

    document.title = meta.title;

    findOrCreateMeta('meta[name="description"]', 'name', 'description').setAttribute(
      'content',
      meta.description,
    );
    findOrCreateMeta('meta[property="og:type"]', 'property', 'og:type').setAttribute(
      'content',
      'website',
    );
    findOrCreateMeta('meta[property="og:title"]', 'property', 'og:title').setAttribute(
      'content',
      meta.title,
    );
    findOrCreateMeta('meta[property="og:description"]', 'property', 'og:description').setAttribute(
      'content',
      meta.description,
    );
    findOrCreateMeta('meta[property="og:url"]', 'property', 'og:url').setAttribute(
      'content',
      url,
    );
    findOrCreateMeta('meta[property="og:site_name"]', 'property', 'og:site_name').setAttribute(
      'content',
      SITE.name,
    );
    findOrCreateMeta('meta[property="og:image"]', 'property', 'og:image').setAttribute(
      'content',
      `${SITE_URL}/images/cctv.jpeg`,
    );
    findOrCreateMeta('meta[name="twitter:card"]', 'name', 'twitter:card').setAttribute(
      'content',
      'summary_large_image',
    );
    findOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title').setAttribute(
      'content',
      meta.title,
    );
    findOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description').setAttribute(
      'content',
      meta.description,
    );
    findOrCreateMeta('meta[name="twitter:image"]', 'name', 'twitter:image').setAttribute(
      'content',
      `${SITE_URL}/images/cctv.jpeg`,
    );

    findOrCreateLink('canonical').setAttribute('href', url);
  }, [path]);
}