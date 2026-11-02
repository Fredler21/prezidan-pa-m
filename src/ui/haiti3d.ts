import earcut from 'earcut';
import type { DepartmentId } from '../types';
import { HAITI_GEO } from '../data/haiti-geo';
import { toMap } from '../data/haiti-proj';

/*
 * The 3D map of Haiti behind the home page: the ten departments extruded from
 * src/data/haiti-geo.ts, drawn with plain WebGL (no library, about 10 KB with earcut).
 * The page drives it: setView() moves the camera to a department (the home page tour),
 * focuses it (the others dim) and drops a pin on its chef-lieu. On its own it sways gently,
 * tilts toward the pointer, and lifts and names the department under the cursor.
 * Without WebGL it falls back to a flat SVG map; with reduced motion nothing sways and
 * camera moves snap instead of gliding.
 */

export interface MapView {
  /** Point of the map (map units) placed at the centre of the view. */
  cx: number; cy: number;
  /** 1 = the whole country; larger = closer. */
  zoom: number;
  /** Department to light up (the others dim), or null. */
  focus: DepartmentId | null;
  /** Pin: [longitude, latitude] of a place to mark, or null. */
  pin: [number, number] | null;
  pinText: string;
}
export interface Haiti3D {
  setView(v: Partial<MapView>): void;
  /** Centre and zoom that frame one department. */
  frame(id: DepartmentId): { cx: number; cy: number; zoom: number };
  destroy(): void;
}
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
const HOME = { cx: 0, cy: 0.04, zoom: 1 };

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
/** World point to normalised device coordinates; null when behind the camera. */
function project(mvp: Float32Array, p: V3): [number, number] | null {
  const v = [0, 0, 0, 0];
  for (let r = 0; r < 4; r++) v[r] = (mvp[r] ?? 0) * p[0] + (mvp[4 + r] ?? 0) * p[1] + (mvp[8 + r] ?? 0) * p[2] + (mvp[12 + r] ?? 0);
  const w = v[3] ?? 0;
  if (w <= 0) return null;
  return [(v[0] ?? 0) / w, (v[1] ?? 0) / w];
}

const VS = `
attribute vec3 a_pos; attribute vec3 a_nrm; attribute vec2 a_meta; // meta: department index, 1 = top face
uniform mat4 u_mvp; uniform mat3 u_rot; uniform float u_t;
uniform mediump float u_hover; uniform mediump float u_focus; // mediump: same as the fragment shader, or linking fails
varying vec3 v_nrm; varying vec2 v_meta; varying float v_rise;
void main() {
  float r = clamp((u_t - a_meta.x * 0.07) / 0.9, 0.0, 1.0); r = 1.0 - pow(1.0 - r, 3.0);
  float lift = max(step(abs(a_meta.x - u_hover), 0.5), step(abs(a_meta.x - u_focus), 0.5));
  vec3 p = a_pos; p.z = p.z * r + lift * 0.04 * r;
  gl_Position = u_mvp * vec4(p, 1.0);
  v_nrm = u_rot * a_nrm; v_meta = a_meta; v_rise = r;
}`;
const FS = `
precision mediump float;
varying vec3 v_nrm; varying vec2 v_meta; varying float v_rise;
uniform vec3 u_light; uniform float u_hover; uniform float u_focus;
void main() {
  float d = max(dot(normalize(v_nrm), u_light), 0.0);
  vec3 top = vec3(0.22, 0.38, 0.92); vec3 side = vec3(0.16, 0.26, 0.66);
  vec3 base = mix(side, top, v_meta.y);
  base *= 0.88 + 0.2 * fract(sin(v_meta.x * 12.9898) * 43758.5453);
  float hov = step(abs(v_meta.x - u_hover), 0.5);
  float isF = step(abs(v_meta.x - u_focus), 0.5);
  float focusing = step(0.0, u_focus);
  base = mix(base, vec3(0.5, 0.63, 1.0), max(hov, isF) * 0.5);
  vec3 col = base * (0.45 + 0.7 * d) + vec3(0.1, 0.12, 0.18) * pow(d, 6.0);
  col *= mix(1.0, mix(0.42, 1.08, isF), focusing);
  gl_FragColor = vec4(col * v_rise, v_rise);
}`;
const LVS = `
attribute vec3 a_pos; attribute float a_dept;
uniform mat4 u_mvp; uniform float u_t; uniform mediump float u_hover; uniform mediump float u_focus;
varying float v_a;
void main() {
  float r = clamp((u_t - a_dept * 0.07) / 0.9, 0.0, 1.0); r = 1.0 - pow(1.0 - r, 3.0);
  float lift = max(step(abs(a_dept - u_hover), 0.5), step(abs(a_dept - u_focus), 0.5));
  float top = step(0.01, a_pos.z);
  vec3 p = a_pos; p.z = p.z * r + lift * 0.04 * r + 0.002 * top - 0.001 * (1.0 - top);
  gl_Position = u_mvp * vec4(p, 1.0);
  float dim = mix(1.0, mix(0.45, 1.0, lift), step(0.0, u_focus));
  v_a = r * (0.55 + 0.45 * lift) * mix(0.3, 1.0, top) * dim;
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

/** Extrudes every polygon: top and bottom caps (earcut) plus one quad per edge; outlines at the top and the base. */
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
          line.push(x1, y1, H, di, x2, y2, H, di, x1, y1, 0, di, x2, y2, 0, di);
        }
      }
    }
  });
  return { tri: new Float32Array(tri), triCount: tri.length / 8, line: new Float32Array(line), lineCount: line.length / 4 };
}

interface Frame { cx: number; cy: number; w: number; h: number }
/** Centroid of the largest polygon and the bounding box of the whole department. */
function frames(): Frame[] {
  return HAITI_GEO.map((dep) => {
    let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    let best: number[] | null = null, bestArea = -1;
    for (const rings of dep.polys) {
      const ring = rings[0]; if (!ring) continue;
      let area = 0;
      for (let i = 0; i < ring.length; i += 2) {
        const x = ring[i] ?? 0, y = ring[i + 1] ?? 0, x2 = ring[(i + 2) % ring.length] ?? 0, y2 = ring[(i + 3) % ring.length] ?? 0;
        area += x * y2 - x2 * y;
        minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y);
      }
      if (Math.abs(area) > bestArea) { bestArea = Math.abs(area); best = ring; }
    }
    let cx = 0, cy = 0, a = 0;
    if (best) for (let i = 0; i < best.length; i += 2) {
      const x = best[i] ?? 0, y = best[i + 1] ?? 0, x2 = best[(i + 2) % best.length] ?? 0, y2 = best[(i + 3) % best.length] ?? 0;
      const f = x * y2 - x2 * y; a += f; cx += (x + x2) * f; cy += (y + y2) * f;
    }
    if (a !== 0) { cx /= 3 * a; cy /= 3 * a; } else { cx = (minx + maxx) / 2; cy = (miny + maxy) / 2; }
    return { cx, cy, w: maxx - minx, h: maxy - miny };
  });
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
const indexOf = (id: DepartmentId | null) => (id ? HAITI_GEO.findIndex((d) => d.id === id) : -1);

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

const NOOP: Haiti3D = { setView: () => {}, frame: () => HOME, destroy: () => {} };

export function mountHaiti3D(host: HTMLElement, opts: Haiti3DOptions): Haiti3D {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  const prog = gl && compile(gl, VS, FS), lprog = gl && compile(gl, LVS, LFS);
  if (!gl || !prog || !lprog) { host.append(svgFallback()); return { ...NOOP, destroy: () => { host.querySelector('.map-flat')?.remove(); } }; }

  const mesh = buildMesh();
  const FR = frames();
  const vbo = gl.createBuffer(), lbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, mesh.tri, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, lbo); gl.bufferData(gl.ARRAY_BUFFER, mesh.line, gl.STATIC_DRAW);
  const A = { pos: gl.getAttribLocation(prog, 'a_pos'), nrm: gl.getAttribLocation(prog, 'a_nrm'), meta: gl.getAttribLocation(prog, 'a_meta') };
  const U = { mvp: gl.getUniformLocation(prog, 'u_mvp'), rot: gl.getUniformLocation(prog, 'u_rot'), t: gl.getUniformLocation(prog, 'u_t'), hover: gl.getUniformLocation(prog, 'u_hover'), focus: gl.getUniformLocation(prog, 'u_focus'), light: gl.getUniformLocation(prog, 'u_light') };
  const LA = { pos: gl.getAttribLocation(lprog, 'a_pos'), dept: gl.getAttribLocation(lprog, 'a_dept') };
  const LU = { mvp: gl.getUniformLocation(lprog, 'u_mvp'), t: gl.getUniformLocation(lprog, 'u_t'), hover: gl.getUniformLocation(lprog, 'u_hover'), focus: gl.getUniformLocation(lprog, 'u_focus') };
  gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);

  const label = document.createElement('div');
  label.className = 'map3d-label';
  const pinEl = document.createElement('div');
  pinEl.className = 'map-pin';
  pinEl.innerHTML = '<i></i><span></span>';
  const pinText = pinEl.querySelector('span') as HTMLSpanElement;
  host.append(canvas, label, pinEl);

  let w = 1, hgt = 1, aspect = 1, dpr = 1;
  let proj = perspective(1, 0.3, 12);
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, host.clientWidth); hgt = Math.max(1, host.clientHeight);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr);
    aspect = w / hgt;
    proj = perspective(aspect, 0.3, 12);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  // View: where the page wants the camera (target) and where it is now (cur), eased per frame.
  const target = { ...HOME }, cur = { ...HOME };
  let focus = -1, hover = -1;
  let pin: [number, number] | null = null;
  // Pointer parallax.
  let px = 0, py = 0, tx = 0, ty = 0;
  let rot: M3 = rotZ(0);
  let trans: V3 = [0, 0, 0];
  let eye: V3 = EYE;
  const t0 = performance.now();
  const fit = () => Math.min(1, aspect / 1.3); // narrower hosts pull the camera back a little

  const draw = (now: number) => {
    const t = (now - t0) / 1000;
    const k = reduced ? 1 : 0.085;
    tx += (px - tx) * 0.08; ty += (py - ty) * 0.08;
    cur.cx += (target.cx - cur.cx) * k; cur.cy += (target.cy - cur.cy) * k; cur.zoom += (target.zoom - cur.zoom) * k;
    const sway = reduced ? 0 : (Math.sin(t * 0.35) * 0.16) / cur.zoom;
    const bob = reduced ? 0 : Math.sin(t * 0.9) * 0.02;
    rot = mul3(rotZ(sway + tx * 0.28), mul3(rotX(-ty * 0.22), rotY(tx * 0.12)));
    const d = 1 / (cur.zoom * fit());
    eye = [EYE[0] * d, EYE[1] * d, EYE[2] * d];
    trans = [-cur.cx, -cur.cy, bob];
    // Rotate about the focused point, then slide it to the origin the camera looks at.
    const tr = applyT3([rot[0], rot[3], rot[6], rot[1], rot[4], rot[7], rot[2], rot[5], rot[8]], trans); // rot * trans
    const mvp = mul4(proj, mul4(lookAt(eye, CENTER, [0, 0, 1]), model4(rot, tr)));
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
    gl.uniform1f(U.t, rise); gl.uniform1f(U.hover, hover); gl.uniform1f(U.focus, focus); gl.uniform3fv(U.light, LIGHT);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.triCount);

    gl.useProgram(lprog);
    gl.bindBuffer(gl.ARRAY_BUFFER, lbo);
    gl.enableVertexAttribArray(LA.pos); gl.vertexAttribPointer(LA.pos, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(LA.dept); gl.vertexAttribPointer(LA.dept, 1, gl.FLOAT, false, 16, 12);
    gl.uniformMatrix4fv(LU.mvp, false, mvp); gl.uniform1f(LU.t, rise); gl.uniform1f(LU.hover, hover); gl.uniform1f(LU.focus, focus);
    gl.drawArrays(gl.LINES, 0, mesh.lineCount);

    // The pin follows its place on the map.
    if (pin && focus >= 0) {
      const [mx, my] = toMap(pin[0], pin[1]);
      const ndc = project(mvp, [mx, my, H + 0.05]);
      if (ndc) {
        pinEl.style.transform = `translate(${((ndc[0] + 1) / 2) * w}px, ${((1 - ndc[1]) / 2) * hgt}px)`;
        pinEl.classList.add('on');
      } else pinEl.classList.remove('on');
    } else pinEl.classList.remove('on');
  };

  /** Ray from the pointer through the camera, into model space, onto the top plane; then point-in-polygon. */
  const pickAt = (cx: number, cy: number): number => {
    const xn = (cx / w) * 2 - 1, yn = 1 - (cy / hgt) * 2;
    const f = norm([CENTER[0] - eye[0], CENTER[1] - eye[1], CENTER[2] - eye[2]]);
    const s = norm(cross(f, [0, 0, 1])), u = cross(s, f);
    const th = Math.tan(FOV / 2);
    const dir = norm([s[0] * xn * th * aspect + u[0] * yn * th + f[0], s[1] * xn * th * aspect + u[1] * yn * th + f[1], s[2] * xn * th * aspect + u[2] * yn * th + f[2]]);
    const dm = applyT3(rot, dir), om = applyT3(rot, eye);
    om[0] -= trans[0]; om[1] -= trans[1]; om[2] -= trans[2];
    if (Math.abs(dm[2]) < 1e-6) return -1;
    const k = (H - om[2]) / dm[2];
    if (k < 0) return -1;
    return pick(om[0] + dm[0] * k, om[1] + dm[1] * k);
  };

  let raf = 0, running = false, visible = true;
  const loop = (now: number) => { raf = 0; draw(now); if (visible && running) raf = requestAnimationFrame(loop); };
  const start = () => { running = true; if (!raf) raf = requestAnimationFrame(loop); };
  const stop = () => { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    px = (cx / r.width) * 2 - 1; py = (cy / r.height) * 2 - 1;
    const id = pickAt(cx, cy);
    if (id !== hover) { hover = id; const dep = HAITI_GEO[id]; if (dep) label.textContent = opts.label(dep.id); label.classList.toggle('on', id >= 0); }
    label.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -150%)`;
    canvas.style.cursor = id >= 0 ? 'pointer' : '';
  };
  const onLeave = () => { px = 0; py = 0; hover = -1; label.classList.remove('on'); canvas.style.cursor = ''; };
  const onTap = (e: PointerEvent) => { if (e.pointerType === 'touch') { onMove(e); window.setTimeout(onLeave, 1800); } };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onTap);

  const ro = new ResizeObserver(() => resize());
  ro.observe(host);
  const io = new IntersectionObserver((es) => { visible = es.some((x) => x.isIntersecting); if (visible) start(); else stop(); }, { rootMargin: '80px' });
  io.observe(host);
  const onVis = () => { if (document.visibilityState === 'visible') start(); else stop(); };
  document.addEventListener('visibilitychange', onVis);
  start();

  return {
    setView(v) {
      if (v.cx !== undefined) target.cx = v.cx;
      if (v.cy !== undefined) target.cy = v.cy;
      if (v.zoom !== undefined) target.zoom = v.zoom;
      if (v.focus !== undefined) focus = indexOf(v.focus);
      if (v.pin !== undefined) pin = v.pin;
      if (v.pinText !== undefined) pinText.textContent = v.pinText;
    },
    frame(id) {
      const f = FR[indexOf(id)];
      if (!f) return HOME;
      return { cx: f.cx, cy: f.cy, zoom: Math.min(3, Math.max(1.6, 0.95 / Math.max(f.w, f.h * 1.5))) };
    },
    destroy() {
      stop(); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('pointerdown', onTap);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove(); label.remove(); pinEl.remove();
    },
  };
}
