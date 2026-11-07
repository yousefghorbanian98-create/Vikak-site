'use client';

import { useEffect, useState } from 'react';
import { ParticlesProvider } from '@tsparticles/react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine, ISourceOptions } from '@tsparticles/engine';

/**
 * Dust motes drifting up through the hero light.
 * Deliberately sparse and slow: nothing loops faster than 2.5s, nothing moves
 * because the page scrolled, and under reduced motion the layer is not even
 * mounted (tasteskill motion checklist: reduced-motion, hidden-content, webgl).
 */
const OPTIONS: ISourceOptions = {
  fullScreen: { enable: false },
  fpsLimit: 40,
  detectRetina: true,
  particles: {
    number: { value: 18, density: { enable: true, width: 1440, height: 900 } },
    color: { value: ['#c8752e', '#e2a05f', '#f3ebe1'] },
    opacity: {
      value: { min: 0.05, max: 0.22 },
      animation: { enable: true, speed: 0.2, sync: false },
    },
    size: { value: { min: 0.6, max: 2.4 } },
    move: {
      enable: true,
      speed: { min: 0.08, max: 0.3 },
      direction: 'top',
      random: true,
      straight: false,
      outModes: { default: 'out' },
    },
    links: { enable: false },
  },
  interactivity: { events: { onHover: { enable: false }, onClick: { enable: false }, resize: { enable: true } } },
  background: { color: 'transparent' },
};

export default function HeroParticles() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setAllowed(true);
  }, []);

  if (!allowed) return null;

  return (
    <div className="hero-particles" aria-hidden="true">
      <ParticlesProvider init={async (engine: Engine) => { await loadSlim(engine); }}>
        <Particles id="vikak-dust" options={OPTIONS} />
      </ParticlesProvider>
    </div>
  );
}
