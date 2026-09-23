import { useId } from 'react';
import { IMAGES } from '../data/images';

interface Props {
  size?: number;
  glow?: boolean;
  className?: string;
}

/**
 * Company brand mark. Renders the official logo photo when one is set
 * (src/data/images.ts → IMAGES.logo), otherwise falls back to the built-in
 * JL lightning-bolt vector mark.
 */
export default function BrandLogo({ size = 46, glow = false, className = '' }: Props) {
  const gradId = useId();

  if (IMAGES.logo) {
    return (
      <img
        src={IMAGES.logo}
        alt="Jean Luc Solutions logo"
        width={size}
        height={size}
        className={`brand-logo ${glow ? 'brand-logo--glow' : ''} ${className}`}
        style={{ display: 'block', objectFit: 'cover', borderRadius: size * 0.22 }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={`brand-logo ${glow ? 'brand-logo--glow' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f9bff" />
          <stop offset="1" stopColor="#00c6ff" />
        </linearGradient>
      </defs>
      <rect
        width="64"
        height="64"
        rx="15"
        fill="#081129"
        stroke="rgba(47,155,255,0.45)"
        strokeWidth="1.5"
      />
      <path d="M35 7 L14 36 H26 L24 57 L50 27 H37 L39 7 Z" fill={`url(#${gradId})`} />
    </svg>
  );
}