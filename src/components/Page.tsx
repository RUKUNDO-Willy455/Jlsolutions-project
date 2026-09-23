import type { ReactNode } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Page({ children }: { children: ReactNode }) {
  useScrollReveal();
  return <>{children}</>;
}