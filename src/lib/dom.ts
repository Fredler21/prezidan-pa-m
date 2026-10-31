type Child = Node | string | null | undefined | false;
type Props = Record<string, string | number | boolean | EventListener | undefined> & { html?: string };

/** Tiny element builder. Text children go through textContent (never innerHTML), only trusted
 *  inline SVG from lib/icons.ts is injected via the explicit `html` prop. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Props | null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === false) continue;
      if (k === 'html') { el.innerHTML = String(v); continue; }
      if (k.startsWith('on') && typeof v === 'function') { el.addEventListener(k.slice(2).toLowerCase(), v); continue; }
      if (k === 'class') { el.className = String(v); continue; }
      if (k === 'style') { el.setAttribute('style', String(v)); continue; }
      if (v === true) { el.setAttribute(k, ''); continue; }
      el.setAttribute(k, String(v));
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

export function svg(markup: string, cls?: string): HTMLSpanElement {
  const s = h('span', { class: cls ?? 'ico', html: markup });
  s.style.display = 'inline-flex';
  return s;
}

export function clear(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function frag(...children: Child[]): DocumentFragment {
  const f = document.createDocumentFragment();
  for (const c of children) if (c) f.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return f;
}
