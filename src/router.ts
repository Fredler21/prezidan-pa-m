export type Route = 'start' | 'match' | 'candidates' | 'vote' | 'results' | 'about' | 'poll' | 'admin';
const ROUTES: readonly Route[] = ['start', 'match', 'candidates', 'vote', 'results', 'about', 'poll', 'admin'];

export interface Location { route: Route; param: string | null }

export function parseHash(hash = location.hash): Location {
  const raw = hash.replace(/^#\/?/, '');
  const [first = '', param] = raw.split('/');
  const route = (ROUTES as readonly string[]).includes(first) ? (first as Route) : 'start';
  return { route, param: param ? decodeURIComponent(param) : null };
}

export function go(route: Route, param?: string): void {
  const next = `#${route}${param ? '/' + encodeURIComponent(param) : ''}`;
  if (location.hash === next) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = next;
}

export function onRoute(fn: (loc: Location) => void): void {
  window.addEventListener('hashchange', () => fn(parseHash()));
}
