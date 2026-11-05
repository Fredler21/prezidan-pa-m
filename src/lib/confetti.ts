import { h } from './dom';

/** A short burst of flat paper pieces from the middle of `host`; skipped when the visitor prefers reduced motion. */
export function confetti(host: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = h('div', { class: 'qz-confetti', 'aria-hidden': 'true' });
  const colors = ['#1A3BB5', '#7D93E8', '#FFD66B', '#FFFFFF', '#3D63E6', '#D21034'];
  for (let i = 0; i < 40; i++) {
    const p = h('i');
    p.style.setProperty('--x', `${(Math.random() * 2 - 1) * 180}px`);
    p.style.setProperty('--y', `${-120 - Math.random() * 180}px`);
    p.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    p.style.setProperty('--d', `${Math.random() * 0.25}s`);
    p.style.background = colors[i % colors.length] ?? '#fff';
    layer.append(p);
  }
  host.append(layer);
  window.setTimeout(() => layer.remove(), 2400);
}
