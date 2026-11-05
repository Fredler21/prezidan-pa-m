import type { PriorityId } from '../types';

// Simple line icons, 24px grid, 1.75px stroke, currentColor. No icon font, no external images.
const wrap = (paths: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const PRIORITY_ICONS: Record<PriorityId, string> = {
  security: wrap('<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/><path d="M9.5 12l1.8 1.8L15 10"/>'),
  education: wrap('<path d="M12 5.5C10 4 7 4 4 5v13c3-1 6-1 8 .5 2-1.5 5-1.5 8-.5V5c-3-1-6-1-8 .5z"/><path d="M12 5.5v13"/>'),
  infrastructure: wrap('<path d="M5 20L9 4h6l4 16"/><path d="M12 7v2.5M12 12.5v2.5M12 18v2"/><path d="M3 20h18"/>'),
  economy: wrap('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M3 12h18"/><path d="M12 11v2"/>'),
  health: wrap('<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/><path d="M6.5 12H9l1.5-2.5 2 5 1.5-2.5h2.5"/>'),
  agriculture: wrap('<path d="M12 21V9"/><path d="M12 9c0-3 2-5 5-5 0 3-2 5-5 5z"/><path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5z"/><path d="M12 17c0-3 2-5 5-5 0 3-2 5-5 5z"/><path d="M12 5c0-1 .5-2 1-2.5"/>'),
  justice: wrap('<path d="M12 4v16"/><path d="M8 20h8"/><path d="M5 8h14"/><path d="M7 8l-3 6a3 3 0 006 0z"/><path d="M17 8l-3 6a3 3 0 006 0z"/>'),
  utilities: wrap('<path d="M13 3L6 13h5l-1 8 7-11h-5z"/><path d="M18.5 14c-1.5 2-2.5 3.5-2.5 4.8a2.5 2.5 0 005 0c0-1.3-1-2.8-2.5-4.8z"/>'),
  diaspora: wrap('<path d="M3 12l6 2 2 6 2-5 7-9z"/><path d="M9 14l11-8"/>'),
  environment: wrap('<path d="M12 21v-4"/><path d="M7 17c-2.5 0-4-1.5-4-3.5 0-1.5 1-2.8 2.5-3.2A4 4 0 0112 7a4 4 0 016.5 3.3c1.5.4 2.5 1.7 2.5 3.2 0 2-1.5 3.5-4 3.5z"/>'),
  institutions: wrap('<rect x="3" y="11" width="18" height="9" rx="1.5"/><path d="M3 15h18"/><path d="M8 11V5h8v6"/><path d="M10 7.5l1.5 1.5L14.5 6"/>'),
  youth: wrap('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.5-6 6-6s6 2.5 6 6"/><path d="M15 14.5c2.5 0 5 2 5 5"/>'),
};

export const ICON = {
  arrowRight: wrap('<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>'),
  back: wrap('<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>'),
  chevronRight: wrap('<path d="M9 6l6 6-6 6"/>'),
  expand: wrap('<path d="M6 9l6 6 6-6"/>'),
  outward: wrap('<path d="M7 17L17 7"/><path d="M8 7h9v9"/>'),
  generic: wrap('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>'),
  home: wrap('<path d="M4 11l8-7 8 7"/><path d="M6 10v10h5v-6h2v6h5V10"/>'),
  person: wrap('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>'),
  eye: wrap('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: wrap('<path d="M3 3l18 18"/><path d="M10.6 5.3A10.5 10.5 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.2"/><path d="M6.6 6.6A16.6 16.6 0 002 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>'),
  login: wrap('<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 3h6a2 2 0 012 2v14a2 2 0 01-2 2h-6"/>'),
  google: wrap('<path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.1a4.4 4.4 0 01-1.9 2.9v2.4h3c1.8-1.7 2.8-4.1 2.8-7z" fill="currentColor" stroke="none"/><path d="M12 21c2.5 0 4.6-.8 6.2-2.2l-3-2.4c-.8.6-1.9.9-3.2.9-2.4 0-4.5-1.6-5.2-3.9H3.7v2.4A9 9 0 0012 21z" fill="currentColor" stroke="none" opacity=".8"/><path d="M6.8 13.4a5.4 5.4 0 010-3.4V7.6H3.7a9 9 0 000 8.2l3.1-2.4z" fill="currentColor" stroke="none" opacity=".6"/><path d="M12 6.6c1.4 0 2.6.5 3.5 1.4l2.6-2.6A9 9 0 003.7 7.6l3.1 2.4C7.5 7.7 9.6 6.6 12 6.6z" fill="currentColor" stroke="none" opacity=".9"/>'),
  calendar: wrap('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/><path d="M8 14h3v3H8z"/>'),
  brand: wrap('<path d="M5 15h14l-1.5 5h-11z"/><path d="M8.5 15V6.5A1.5 1.5 0 0110 5h4a1.5 1.5 0 011.5 1.5V15"/><path d="M10.5 9.5l1.2 1.2 2-2.2"/>'),
  check: wrap('<path d="M5 12l4.5 4.5L19 7"/>'),
  info: wrap('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>'),
  lock: wrap('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
  link: wrap('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>'),
  external: wrap('<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5"/>'),
  close: wrap('<path d="M6 6l12 12"/><path d="M18 6L6 18"/>'),
  search: wrap('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>'),
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 00-8.2 14.3L2.5 21.5l4.9-1.3A9.5 9.5 0 1012 2.5zm0 1.8a7.7 7.7 0 110 15.4 7.6 7.6 0 01-3.9-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.7 7.7 0 0112 4.3zm-3 3.9c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5 0 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1a6.3 6.3 0 01-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.3z"/></svg>`,
  share: wrap('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6"/>'),
  download: wrap('<path d="M12 4v11"/><path d="M7 10.5l5 5 5-5"/><path d="M5 20h14"/>'),
  idea: wrap('<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>'),
  sliders: wrap('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  people: wrap('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.5-6 6-6s6 2.5 6 6"/><path d="M15 14.5c2.5 0 5 2 5 5"/>'),
  ballot: wrap('<path d="M4 13h16v7H4z"/><path d="M8 13V5h8v8"/><path d="M10 8.5l1.5 1.5L14.5 7"/>'),
  poll: wrap('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 15v-4M12 15V8M16 15v-2"/>'),
  bars: wrap('<path d="M4 20h16"/><path d="M6 16V9M12 16V5M18 16v-4"/>'),
  count: wrap('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  globe: wrap('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.7 2.5 15.3 0 18"/><path d="M12 3c-2.5 2.7-2.5 15.3 0 18"/>'),
  photo: wrap('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-4-7 7"/>'),
};
