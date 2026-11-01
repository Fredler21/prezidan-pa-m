import './styles.css';
import { onLangChange, S } from './i18n';
import { parseHash, onRoute, type Location } from './router';
import { state, setMyVote, onState } from './state';
import { getStorage, STORAGE_MODE } from './storage';
import { candidateById, refreshContent, onContentChange } from './content';
import { renderHeader } from './ui/header';
import { renderBottom } from './ui/nav';
import { renderHome } from './ui/home';
import { renderStart } from './ui/start';
import { renderMatch } from './ui/match';
import { openProfile, closeProfile } from './ui/profile';
import { renderVote } from './ui/vote';
import { renderResults } from './ui/results';
import { renderAbout } from './ui/about';
import { renderPoll } from './ui/poll';
import { renderAdmin } from './ui/admin';
import { toast } from './ui/toast';
import { initAccount } from './account';

initAccount();
let cleanup: (() => void) | null = null;
let current: Location = parseHash();

// ?theme=light|dark overrides prefers-color-scheme (testing and shared links).
const themeParam = new URLSearchParams(location.search).get('theme');
if (themeParam === 'light' || themeParam === 'dark') document.documentElement.dataset.theme = themeParam;

function render(loc: Location): void {
  const main = document.getElementById('main');
  if (!main) return;
  if (cleanup) { cleanup(); cleanup = null; }
  closeProfile();
  current = loc;
  renderHeader(loc.route);
  // Chrome first: the Vote view mounts its own bar into #bottom and must not be cleared after.
  renderBottom(loc.route);
  switch (loc.route) {
    case 'home': cleanup = renderHome(main); break;
    case 'start': renderStart(main); break;
    case 'match': renderMatch(main, false); break;
    case 'candidates': {
      renderMatch(main, true);
      const c = loc.param ? candidateById(loc.param) : undefined;
      if (c) openProfile(c);
      break;
    }
    case 'vote': renderVote(main, loc.param); break;
    case 'results': cleanup = renderResults(main); break;
    case 'about': renderAbout(main); break;
    case 'poll': cleanup = renderPoll(main); break;
    case 'admin': renderAdmin(main); break;
  }
  window.scrollTo({ top: 0 });
  const nav = S().nav as Record<string, string>;
  document.title = loc.route === 'home' ? `${S().appName} · Ayiti 2027` : `${S().appName} · ${nav[loc.route === 'match' || loc.route === 'vote' ? 'candidates' : loc.route === 'admin' ? 'poll' : loc.route === 'start' ? 'priorities' : loc.route] ?? ''}`;
}

onRoute(render);
onLangChange(() => render(current));
onState(() => { if (current.route === 'start') renderBottom('start'); });
window.addEventListener('offline', () => toast(S().offline, 4000));

render(current);

// Firestore content (candidates, priorities, dates) is fetched after the first paint and only
// re-renders read-only pages, so a refresh never closes an open profile or wipes a half-typed vote.
const REFRESHABLE = new Set(['home', 'start', 'match', 'candidates', 'results', 'about']);
onContentChange(() => {
  if (REFRESHABLE.has(current.route) && !document.querySelector('dialog[open]')) render(current);
});
const idle = (fn: () => void): void => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 3000 });
  else setTimeout(fn, 1200);
};
if (navigator.onLine) idle(() => { void refreshContent(); });

// Load the visitor's existing vote in the background. In Firebase mode this is deferred
// until a page that needs the SDK is opened, so the landing page stays light.
async function loadMyVote(): Promise<void> {
  try {
    const v = await (await getStorage()).getMyVote();
    if (v) { setMyVote(v); if (current.route === 'vote') render(current); }
  } catch { /* not signed in yet, or offline */ }
}
const NEEDS_BACKEND = new Set(['vote', 'results', 'poll', 'admin']);
if (STORAGE_MODE === 'local' || NEEDS_BACKEND.has(current.route)) void loadMyVote();
else onRoute((loc) => { if (!state.myVote && NEEDS_BACKEND.has(loc.route)) void loadMyVote(); });
