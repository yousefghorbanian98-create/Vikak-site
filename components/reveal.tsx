'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** delay in ms, useful for staggering a row */
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'li';
};

/**
 * Fades + lifts a block into view once (IntersectionObserver).
 * Under reduced motion the element is shown immediately and never hides,
 * which is the requirement from the tasteskill motion checklist
 * [reduced-motion, hidden-content].
 */
export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.dataset.state = 'in';
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.dataset.state = 'in';
            io.unobserve(node);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    // anything already on screen at load enters without waiting
    node.dataset.state = 'out';
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      data-state="out"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
