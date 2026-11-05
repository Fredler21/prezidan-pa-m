/**
 * An open tab keeps running the version it loaded: pages switch without a reload, so a phone left on the
 * site would never see an update. When the tab comes back to the front (and every 15 minutes) the page
 * looks at the deployed index.html; once a newer build is out it reloads at the next page change, or at
 * once when the visitor returns to the tab and nothing is open or being typed. At most one automatic
 * reload every 5 minutes, so a slow CDN can never cause a loop.
 */
const MAIN = /\/assets\/index-[\w-]+\.js/;
const GUARD = 'ppm.fresh.at';

export function keepFresh(): void {
  const mine = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/index-"]')?.src.match(MAIN)?.[0];
  if (!mine) return; // the dev server: nothing to compare
  let stale = false;
  let lastCheck = 0;

  const busy = () => {
    const f = document.activeElement;
    return !!document.querySelector('dialog[open]') || f instanceof HTMLInputElement || f instanceof HTMLTextAreaElement || f instanceof HTMLSelectElement;
  };
  const reload = () => {
    try {
      const at = Number(sessionStorage.getItem(GUARD) || 0);
      if (Date.now() - at < 5 * 60_000) return;
      sessionStorage.setItem(GUARD, String(Date.now()));
    } catch { /* storage off: still reload once */ }
    location.reload();
  };
  const check = async (now: boolean) => {
    if (!stale && Date.now() - lastCheck > 60_000) {
      lastCheck = Date.now();
      try {
        const html = await (await fetch(`/index.html?fresh=${Date.now()}`, { cache: 'no-store' })).text();
        const live = html.match(MAIN)?.[0];
        if (live && live !== mine) stale = true;
      } catch { /* offline: try again later */ }
    }
    if (stale && now && !busy()) reload();
  };

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void check(true); });
  window.setInterval(() => void check(false), 15 * 60_000);
  // registered before the router, so the new page opens straight in the new version
  window.addEventListener('hashchange', () => { if (stale) reload(); });
}
