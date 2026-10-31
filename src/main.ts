import './styles.css';
import { onLangChange, S } from './i18n';
import { parseHash, onRoute, type Location } from './router';
import { state, setMyVote, onState } from './state';
import { getStorage, STORAGE_MODE } from './storage';
import { CANDIDATE_BY_ID } from './data/candidates';
import { renderHeader } from './ui/header';
import { renderBottom } from './ui/nav';
import { renderStart } from './ui/start';
import { renderMatch } from './ui/match';
import { openProfile, closeProfile } from './ui/profile';
import { renderVote } from './ui/vote';
import { renderResults } from './ui/results';
import { renderAbout } from './ui/about';
import { renderPoll } from './ui/poll';
import { renderAdmin } from './ui/admin';
import { toast } from './ui/toast';

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
  switch (loc.route) {
    case 'start': renderStart(main); break;
    case 'match': renderMatch(main, false); break;
    case 'candidates': {
      renderMatch(main, true);
      const c = loc.param ? CANDIDATE_BY_ID.get(loc.param) : undefined;
      if (c) openProfile(c);
      break;
    }
    case 'vote': renderVote(main, loc.param); break;
    case 'results': cleanup = renderResults(main); break;
    case 'about': renderAbout(main); break;
    case 'poll': cleanup = renderPoll(main); break;
    case 'admin': renderAdmin(main); break;
  }
  renderBottom(loc.route);
  window.scrollTo({ top: 0 });
  document.title = loc.route === 'start' ? `${S().appName} · Ayiti 2027` : `${S().appName} · ${S().nav[loc.route === 'match' || loc.route === 'vote' ? 'candidates' : loc.route === 'admin' ? 'poll' : loc.route] ?? ''}`;
}

onRoute(render);
onLangChange(() => render(current));
onState(() => { if (current.route === 'start') renderBottom('start'); });
window.addEventListener('offline', () => toast(S().offline, 4000));

render(current);

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
