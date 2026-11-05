import { h, svg } from './dom';
import { ICON } from './icons';
import { S } from '../i18n';

/*
 * Day (white, the default) or night (black). The choice is kept on this device; index.html applies
 * it before the first paint (no white flash at night), and ?theme=light|dark in a link overrides it.
 */
export type Theme = 'light' | 'dark';
const KEY = 'ppm.theme';
const BAR: Record<Theme, string> = { light: '#FFFFFF', dark: '#000000' };

export function getTheme(): Theme { return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }

export function setTheme(t: Theme): void {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(KEY, t); } catch { /* storage off: the choice lasts for this visit */ }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR[t]);
  for (const b of document.querySelectorAll<HTMLButtonElement>('.theme-btn')) draw(b);
}

function draw(b: HTMLButtonElement): void {
  const night = getTheme() === 'dark';
  b.replaceChildren(svg(night ? ICON.sun : ICON.moon));
  b.setAttribute('aria-pressed', String(night));
  b.title = night ? S().themeDay : S().themeNight;
}

/** The night mode switch: a moon by day, a sun by night. */
export function themeButton(): HTMLButtonElement {
  const b = h('button', { class: 'theme-btn', type: 'button', 'aria-label': S().themeNight });
  draw(b);
  b.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  return b;
}
