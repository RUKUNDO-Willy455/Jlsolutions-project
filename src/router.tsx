import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

export function getPath(): string {
  const hash = window.location.hash;
  if (!hash || hash === '#') return '/';
  const p = hash.slice(1);
  return p.startsWith('/') ? p : `/${p}`;
}

export function useRoute(): string {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onChange = () => {
      setPath(getPath());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: ReactNode;
};

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  );
}