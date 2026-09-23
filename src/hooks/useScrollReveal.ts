import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const selectors = ['.reveal', '.reveal-left', '.reveal-scale'];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    const scan = () => {
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
          }
          observer.observe(el);
        });
      });
    };

    scan();

    // Bounded fallback (a few frames, no DOM watching): guarantees any reveal
    // element already inside the viewport when the page mounts is shown even
    // if IntersectionObserver reports late — prevents stuck-hidden sections.
    const frame = requestAnimationFrame(scan);
    const t1 = window.setTimeout(scan, 120);
    const t2 = window.setTimeout(scan, 300);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
}
