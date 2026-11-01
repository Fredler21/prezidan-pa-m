import earcut from 'earcut';
import type { DepartmentId } from '../types';
import { HAITI_GEO } from '../data/haiti-geo';

/*
 * The 3D map of Haiti in the hero: the ten departments extruded from src/data/haiti-geo.ts,
 * drawn with plain WebGL (no library, about 10 KB with earcut). It floats, tilts toward the
 * pointer, lifts the department under the cursor and names it. Without WebGL it falls back to a
 * flat SVG map; with reduced motion it renders once and only reacts to the pointer.
 */

export interface Haiti3DOptions {
  /** Department name in the current language (shown on hover / tap). */
  label: (id: DepartmentId) => string;
}

type V3 = [number, number, number];
const H = 0.18; // extrusion height, map units (the map is 2 units wide)
const EYE: V3 = [0, -2.62, 1.66];
const CENTER: V3 = [0, 0.04, 0.05];
const LIGHT: V3 = norm([-0.45, -0.5, 0.95]);
const FOV = (30 * Math.PI) / 180;

function norm(v: V3): V3 { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function cross(a: V3, b: V3): V3 { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot(a: V3, b: V3): number { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

/** 3x3 row-major rotation helpers. */
type M3 = [number, number, number, number, number, number, number, number, number];
function rotX(a: number): M3 { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; }
function rotY(a: number): M3 { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; }
function rotZ(a: number): M3 { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; }
function mul3(a: M3, b: M3): M3 {
  const r: M3 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = (a[i * 3] ?? 0) * (b[j] ?? 0) + (a[i * 3 + 1] ?? 0) * (b[3 + j] ?? 0) + (a[i * 3 + 2] ?? 0) * (b[6 + j] ?? 0);
  return r;
}
function apply3(m: M3, v: V3): V3 { return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]; }
function applyT3(m: M3, v: V3): V3 { return [m[0] * v[0] + m[3] * v[1] + m[6] * v[2], m[1] * v[0] + m[4] * v[1] + m[7] * v[2], m[2] * v[0] + m[5] * v[1] + m[8] * v[2]]; }

/** Column-major 4x4 (WebGL layout). */
function perspective(aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(FOV / 2), nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
function lookAt(eye: V3, center: V3, up: V3): Float32Array {
  const f = norm([center[0] - eye[0], center[1] - eye[1], center[2] - eye[2]]);
  const s = norm(cross(f, up)), u = cross(s, f);
  return new Float32Array([s[0], u[0], -f[0], 0, s[1], u[1], -f[1], 0, s[2], u[2], -f[2], 0, -dot(s, eye), -dot(u, eye), dot(f, eye), 1]);
}
function mul4(a: Float32Array, b: Float32Array): Float32Array {
  const r = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let rw = 0; rw < 4; rw++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += (a[k * 4 + rw] ?? 0) * (b[c * 4 + k] ?? 0);
    r[c * 4 + rw] = s;
  }
  return r;
}
function model4(m: M3, t: V3): Float32Array {
  return new Float32Array([m[0], m[3], m[6], 0, m[1], m[4], m[7], 0, m[2], m[5], m[8], 0, t[0], t[1], t[2], 1]);
}

const VS = `
attribute vec3 a_pos; attribute vec3 a_nrm; attribute vec2 a_meta; // meta: department index, 1 = top face
uniform mat4 u_mvp; uniform mat3 u_rot; uniform float u_t; uniform mediump float u_hover; // mediump: same as the fragment shader, or linking fails
varying vec3 v_nrm; varying vec2 v_meta; varying float v_rise;
void main() {
  float r = clamp((u_t - a_meta.x * 0.07) / 0.9, 0.0, 1.0); r = 1.0 - pow(1.0 - r, 3.0);
  float hov = step(abs(a_meta.x - u_hover), 0.5);
  vec3 p = a_pos; p.z = p.z * r + hov * 0.035 * r;
  gl_Position = u_mvp * vec4(p, 1.0);
  v_nrm = u_rot * a_nrm; v_meta = a_meta; v_rise = r;
}`;
const FS = `
precision mediump float;
varying vec3 v_nrm; varying vec2 v_meta; varying float v_rise;
uniform vec3 u_light; uniform float u_hover;
void main() {
  float d = max(dot(normalize(v_nrm), u_light), 0.0);
  vec3 top = vec3(0.22, 0.38, 0.92); vec3 side = vec3(0.16, 0.26, 0.66);
  vec3 base = mix(side, top, v_meta.y);
  base *= 0.88 + 0.2 * fract(sin(v_meta.x * 12.9898) * 43758.5453);
  float hov = step(abs(v_meta.x - u_hover), 0.5);
  base = mix(base, vec3(0.5, 0.63, 1.0), hov * 0.55);
  vec3 col = base * (0.45 + 0.7 * d) + vec3(0.1, 0.12, 0.18) * pow(d, 6.0);
  gl_FragColor = vec4(col * v_rise, v_rise);
}`;
const LVS = `
attribute vec3 a_pos; attribute float a_dept;
uniform mat4 u_mvp; uniform float u_t; uniform float u_hover;
varying float v_a;
void main() {
  float r = clamp((u_t - a_dept * 0.07) / 0.9, 0.0, 1.0); r = 1.0 - pow(1.0 - r, 3.0);
  float hov = step(abs(a_dept - u_hover), 0.5);
  float top = step(0.01, a_pos.z);
  vec3 p = a_pos; p.z = p.z * r + hov * 0.035 * r + 0.002 * top - 0.001 * (1.0 - top);
  gl_Position = u_mvp * vec4(p, 1.0);
  v_a = r * (0.55 + 0.45 * hov) * mix(0.3, 1.0, top);
}`;
const LFS = `
precision mediump float; varying float v_a;
void main() { gl_FragColor = vec4(0.73, 0.78, 0.93, 1.0) * v_a; }`;

function compile(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram | null {
  const mk = (type: number, src: string) => {
    const s = gl.createShader(type); if (!s) return null;
    gl.shaderSource(s, src); gl.compileShader(s);
    if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s;
    console.warn('haiti3d shader', gl.getShaderInfoLog(s)); return null;
  };
  const v = mk(gl.VERTEX_SHADER, vs), f = mk(gl.FRAGMENT_SHADER, fs), p = gl.createProgram();
  if (!v || !f || !p) return null;
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  if (gl.getProgramParameter(p, gl.LINK_STATUS)) return p;
  console.warn('haiti3d program', gl.getProgramInfoLog(p)); return null;
}

interface Mesh { tri: Float32Array; triCount: number; line: Float32Array; lineCount: number }

/** Extrudes every polygon: top and bottom caps (earcut) plus one quad per edge; outlines at the top. */
function buildMesh(): Mesh {
  const tri: number[] = [], line: number[] = [];
  const push = (p: V3, n: V3, dept: number, top: number) => { tri.push(p[0], p[1], p[2], n[0], n[1], n[2], dept, top); };
  HAITI_GEO.forEach((dep, di) => {
    for (const rings of dep.polys) {
      const flat: number[] = [], holes: number[] = [];
      for (const [ri, ring] of rings.entries()) { if (ri > 0) holes.push(flat.length / 2); flat.push(...ring); }
      const idx = earcut(flat, holes.length ? holes : null, 2);
      for (let i = 0; i < idx.length; i += 3) {
        const a = idx[i] ?? 0, b = idx[i + 1] ?? 0, c = idx[i + 2] ?? 0;
        const P = (k: number) => [flat[k * 2] ?? 0, flat[k * 2 + 1] ?? 0] as const;
        const p0 = P(a), p1 = P(b), p2 = P(c);
        for (const [x, y] of [p0, p1, p2]) push([x, y, H], [0, 0, 1], di, 1);
        for (const [x, y] of [p2, p1, p0]) push([x, y, 0], [0, 0, -1], di, 0);
      }
      for (const ring of rings) {
        const n = ring.length / 2;
        for (let i = 0; i < n; i++) {
          const x1 = ring[i * 2] ?? 0, y1 = ring[i * 2 + 1] ?? 0, x2 = ring[((i + 1) % n) * 2] ?? 0, y2 = ring[((i + 1) % n) * 2 + 1] ?? 0;
          const nrm = norm([y2 - y1, -(x2 - x1), 0]);
          push([x1, y1, 0], nrm, di, 0); push([x2, y2, 0], nrm, di, 0); push([x2, y2, H], nrm, di, 0);
          push([x1, y1, 0], nrm, di, 0); push([x2, y2, H], nrm, di, 0); push([x1, y1, H], nrm, di, 0);
          line.push(x1, y1, H, di, x2, y2, H, di, x1, y1, 0, di, x2, y2, 0, di); // top outline, then the base contour
        }
      }
    }
  });
  return { tri: new Float32Array(tri), triCount: tri.length / 8, line: new Float32Array(line), lineCount: line.length / 4 };
}

function inRing(ring: number[], x: number, y: number): boolean {
  let inside = false;
  const n = ring.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i * 2] ?? 0, yi = ring[i * 2 + 1] ?? 0, xj = ring[j * 2] ?? 0, yj = ring[j * 2 + 1] ?? 0;
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function pick(x: number, y: number): number {
  for (let i = 0; i < HAITI_GEO.length; i++) {
    for (const rings of HAITI_GEO[i]?.polys ?? []) {
      const outer = rings[0];
      if (outer && inRing(outer, x, y) && !rings.slice(1).some((h) => inRing(h, x, y))) return i;
    }
  }
  return -1;
}

/** Flat map for browsers without WebGL. */
function svgFallback(): SVGSVGElement {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '-1.05 -0.85 2.1 1.7');
  svg.setAttribute('class', 'map-flat');
  for (const dep of HAITI_GEO) {
    let d = '';
    for (const rings of dep.polys) for (const ring of rings) {
      for (let i = 0; i < ring.length; i += 2) d += `${i ? 'L' : 'M'}${ring[i]} ${-(ring[i + 1] ?? 0)}`;
      d += 'Z';
    }
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}

export function mountHaiti3D(host: HTMLElement, opts: Haiti3DOptions): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  const prog = gl && compile(gl, VS, FS), lprog = gl && compile(gl, LVS, LFS);
  if (!gl || !prog || !lprog) { host.append(svgFallback()); return () => {}; }

  const mesh = buildMesh();
  const vbo = gl.createBuffer(), lbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, mesh.tri, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, lbo); gl.bufferData(gl.ARRAY_BUFFER, mesh.line, gl.STATIC_DRAW);
  const A = { pos: gl.getAttribLocation(prog, 'a_pos'), nrm: gl.getAttribLocation(prog, 'a_nrm'), meta: gl.getAttribLocation(prog, 'a_meta') };
  const U = { mvp: gl.getUniformLocation(prog, 'u_mvp'), rot: gl.getUniformLocation(prog, 'u_rot'), t: gl.getUniformLocation(prog, 'u_t'), hover: gl.getUniformLocation(prog, 'u_hover'), light: gl.getUniformLocation(prog, 'u_light') };
  const LA = { pos: gl.getAttribLocation(lprog, 'a_pos'), dept: gl.getAttribLocation(lprog, 'a_dept') };
  const LU = { mvp: gl.getUniformLocation(lprog, 'u_mvp'), t: gl.getUniformLocation(lprog, 'u_t'), hover: gl.getUniformLocation(lprog, 'u_hover') };
  gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);

  const label = document.createElement('div');
  label.className = 'map3d-label';
  host.append(canvas, label);

  let w = 1, hgt = 1, aspect = 1, dpr = 1;
  let proj = perspective(1, 0.5, 10);
  const view = lookAt(EYE, CENTER, [0, 0, 1]);
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, host.clientWidth); hgt = Math.max(1, host.clientHeight);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr);
    aspect = w / hgt;
    proj = perspective(aspect, 0.5, 10);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  // Pointer state: parallax target, hovered department, label position.
  let px = 0, py = 0, tx = 0, ty = 0, hover = -1, labelX = 0, labelY = 0;
  let rot: M3 = rotZ(0);
  const t0 = performance.now();
  let dirty = true;
  const fit = () => Math.min(1, aspect / 1.3); // narrower hosts pull the camera back a little

  const draw = (now: number) => {
    const t = (now - t0) / 1000;
    tx += (px - tx) * 0.08; ty += (py - ty) * 0.08;
    const spin = reduced ? 0 : Math.sin(t * 0.35) * 0.16;
    const bob = reduced ? 0 : Math.sin(t * 0.9) * 0.02;
    rot = mul3(rotZ(spin + tx * 0.28), mul3(rotX(-ty * 0.22), rotY(tx * 0.12)));
    const eye: V3 = [EYE[0], EYE[1] / fit(), EYE[2] / fit()];
    const mvp = mul4(proj, mul4(lookAt(eye, CENTER, [0, 0, 1]), model4(rot, [0, 0, bob])));
    const rise = reduced ? 10 : t;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(A.pos); gl.vertexAttribPointer(A.pos, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(A.nrm); gl.vertexAttribPointer(A.nrm, 3, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(A.meta); gl.vertexAttribPointer(A.meta, 2, gl.FLOAT, false, 32, 24);
    // WebGL 1 refuses transpose=true, so hand the row-major rotation over as column-major by hand.
    gl.uniformMatrix4fv(U.mvp, false, mvp);
    gl.uniformMatrix3fv(U.rot, false, [rot[0], rot[3], rot[6], rot[1], rot[4], rot[7], rot[2], rot[5], rot[8]]);
    gl.uniform1f(U.t, rise); gl.uniform1f(U.hover, hover); gl.uniform3fv(U.light, LIGHT);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.triCount);

    gl.useProgram(lprog);
    gl.bindBuffer(gl.ARRAY_BUFFER, lbo);
    gl.enableVertexAttribArray(LA.pos); gl.vertexAttribPointer(LA.pos, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(LA.dept); gl.vertexAttribPointer(LA.dept, 1, gl.FLOAT, false, 16, 12);
    gl.uniformMatrix4fv(LU.mvp, false, mvp); gl.uniform1f(LU.t, rise); gl.uniform1f(LU.hover, hover);
    gl.drawArrays(gl.LINES, 0, mesh.lineCount);
    void view;
  };

  /** Ray from the pointer through the camera, into model space, onto the top plane; then point-in-polygon. */
  const pickAt = (cx: number, cy: number): number => {
    const xn = (cx / w) * 2 - 1, yn = 1 - (cy / hgt) * 2;
    const eye: V3 = [EYE[0], EYE[1] / fit(), EYE[2] / fit()];
    const f = norm([CENTER[0] - eye[0], CENTER[1] - eye[1], CENTER[2] - eye[2]]);
    const s = norm(cross(f, [0, 0, 1])), u = cross(s, f);
    const th = Math.tan(FOV / 2);
    const dir = norm([s[0] * xn * th * aspect + u[0] * yn * th + f[0], s[1] * xn * th * aspect + u[1] * yn * th + f[1], s[2] * xn * th * aspect + u[2] * yn * th + f[2]]);
    const dm = applyT3(rot, dir), om = applyT3(rot, eye);
    if (Math.abs(dm[2]) < 1e-6) return -1;
    const k = (H - om[2]) / dm[2];
    if (k < 0) return -1;
    return pick(om[0] + dm[0] * k, om[1] + dm[1] * k);
  };

  let raf = 0, running = false, visible = true;
  const loop = (now: number) => {
    raf = 0;
    draw(now);
    if (!reduced && visible && running) raf = requestAnimationFrame(loop);
    else if (dirty) { dirty = false; }
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const start = () => { running = true; kick(); };
  const stop = () => { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    px = (cx / r.width) * 2 - 1; py = (cy / r.height) * 2 - 1;
    const id = pickAt(cx, cy);
    if (id !== hover) { hover = id; const dep = HAITI_GEO[id]; if (dep) label.textContent = opts.label(dep.id); label.classList.toggle('on', id >= 0); }
    labelX = cx; labelY = cy;
    label.style.transform = `translate(${labelX}px, ${labelY}px) translate(-50%, -150%)`;
    canvas.style.cursor = id >= 0 ? 'pointer' : '';
    if (reduced) kick();
  };
  const onLeave = () => { px = 0; py = 0; hover = -1; label.classList.remove('on'); canvas.style.cursor = ''; if (reduced) kick(); };
  const onTap = (e: PointerEvent) => { if (e.pointerType === 'touch') { onMove(e); window.setTimeout(onLeave, 1800); } };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onTap);

  const ro = new ResizeObserver(() => { resize(); if (reduced) kick(); });
  ro.observe(host);
  const io = new IntersectionObserver((es) => { visible = es.some((x) => x.isIntersecting); if (visible) start(); else stop(); }, { rootMargin: '80px' });
  io.observe(host);
  const onVis = () => { if (document.visibilityState === 'visible') start(); else stop(); };
  document.addEventListener('visibilitychange', onVis);
  start();

  return () => {
    stop(); ro.disconnect(); io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('pointerdown', onTap);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove(); label.remove();
  };
}
