/** Pointer-tracking 3D tilt for cards (hover devices only, never with reduced motion). */
export function attachTilt(el: HTMLElement, maxDeg = 6): () => void {
  if (!window.matchMedia('(hover: hover)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  el.classList.add('tilt');
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * maxDeg).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * maxDeg).toFixed(2)}deg`);
  };
  const leave = () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); el.classList.remove('tilt'); };
}
