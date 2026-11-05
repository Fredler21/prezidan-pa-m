export type Route = 'home' | 'start' | 'match' | 'candidates' | 'vote' | 'results' | 'about' | 'poll' | 'admin' | 'about-us' | 'privacy' | 'terms' | 'quiz';
const ROUTES: readonly Route[] = ['home', 'start', 'match', 'candidates', 'vote', 'results', 'about', 'poll', 'admin', 'about-us', 'privacy', 'terms', 'quiz'];
/** Pages that also answer at a clean path (hosting rewrites them to the app): /about-us, /privacy, /terms. */
const PATH_ROUTES: readonly Route[] = ['about-us', 'privacy', 'terms'];

export interface Location { route: Route; param: string | null }

/** Empty or unknown hash opens the home page (or the clean-path page when the URL is one); #start is the priorities step. */
export function parseHash(hash = location.hash): Location {
  const raw = hash.replace(/^#\/?/, '');
  const [first = '', param] = raw.split('/');
  if ((ROUTES as readonly string[]).includes(first)) return { route: first as Route, param: param ? decodeURIComponent(param) : null };
  const path = location.pathname.replace(/^\/|\/$/g, '');
  if ((PATH_ROUTES as readonly string[]).includes(path)) return { route: path as Route, param: null };
  return { route: 'home', param: null };
}

export function go(route: Route, param?: string): void {
  const next = `#${route}${param ? '/' + encodeURIComponent(param) : ''}`;
  if (location.hash === next) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = next;
}

export function onRoute(fn: (loc: Location) => void): void {
  window.addEventListener('hashchange', () => fn(parseHash()));
}
