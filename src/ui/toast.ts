let timer: number | undefined;

export function toast(message: string, ms = 2600): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  if (timer) clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.remove('show'), ms);
}
