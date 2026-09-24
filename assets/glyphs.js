// Deskside: small frosted 3D objects ("glyphs"), each standing for the item beside it.
// One offscreen WebGL renderer draws every glyph, then copies the frame into a 2D canvas
// that lives inside the glyph's own box, so the objects scroll exactly with the page.
// Purely visual: without WebGL the boxes are hidden and the page reads the same.
import * as THREE from "./vendor/three.module.min.js";

const els = [...document.querySelectorAll("[data-glyph]")];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MAX = 520; // largest glyph, in device pixels

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

/* ---------- Geometry helpers ---------- */

// Box with rounded edges and smooth normals: w (x) by h (y) by d (z), centred.
function roundedBox(w, h, d, r) {
  const seg = 16, g = new THREE.BoxGeometry(1, 1, 1, seg, seg, seg);
  const pos = g.attributes.position, nor = g.attributes.normal;
  const inner = [w / 2 - r, h / 2 - r, d / 2 - r], v = [0, 0, 0], c = [0, 0, 0], n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const u = [pos.getX(i), pos.getY(i), pos.getZ(i)];
    for (let k = 0; k < 3; k++) {
      const a = Math.min(1, Math.abs(u[k]) / 0.5), sg = Math.sign(u[k]);
      v[k] = sg * (a < 0.6 ? (a / 0.6) * inner[k] : inner[k] + ((a - 0.6) / 0.4) * r);
      c[k] = Math.max(-inner[k], Math.min(inner[k], v[k]));
    }
    n.set(v[0] - c[0], v[1] - c[1], v[2] - c[2]);
    if (n.lengthSq() < 1e-12) n.set(nor.getX(i), nor.getY(i), nor.getZ(i));
    n.normalize();
    pos.setXYZ(i, c[0] + n.x * r, c[1] + n.y * r, c[2] + n.z * r);
    nor.setXYZ(i, n.x, n.y, n.z);
  }
  return g;
}

const SPHERE = new THREE.SphereGeometry(1, 64, 32);
const DOT = new THREE.SphereGeometry(1, 12, 8);

function mesh(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; }
function ball(r, mat, x = 0, y = 0, z = 0) { const m = mesh(SPHERE, mat, x, y, z); m.scale.setScalar(r); return m; }
function slab(w, h, d, mat, y = 0) { return mesh(roundedBox(w, h, d, Math.min(0.08, h / 2.2)), mat, 0, y, 0); }
function rod(a, b, r, mat) {
  const dir = new THREE.Vector3().subVectors(b, a), len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}
function dots(points, r, mat) {
  const im = new THREE.InstancedMesh(DOT, mat, points.length), m4 = new THREE.Matrix4();
  points.forEach((p, i) => { m4.makeScale(r, r, r).setPosition(p); im.setMatrixAt(i, m4); });
  return im;
}
// Column that grows from its base (so it can scale in height).
function column(w, h, mat, x, z, fromY) {
  const g = roundedBox(w, 1, w, Math.min(0.07, w / 4));
  g.translate(0, 0.5, 0);
  const m = mesh(g, mat, x, fromY, z);
  m.scale.y = h;
  return m;
}

// Soft contact shadow, shared texture.
let shadowTex = null;
function shadow(size, y) {
  if (!shadowTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d"), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(15,23,32,0.32)");
    gr.addColorStop(0.55, "rgba(15,23,32,0.12)");
    gr.addColorStop(1, "rgba(15,23,32,0)");
    x.fillStyle = gr;
    x.fillRect(0, 0, 128, 128);
    shadowTex = new THREE.CanvasTexture(c);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size * 0.8), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  m.renderOrder = -1;
  return m;
}

function materials(dark) {
  const frost = {
    color: new THREE.Color(dark ? "#d8ece5" : "#e4ece9"), roughness: 0.26, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.35, sheenRoughness: 0.5, sheenColor: new THREE.Color("#a9dcca"),
    envMapIntensity: dark ? 1.2 : 1,
  };
  return {
    frost: new THREE.MeshPhysicalMaterial(frost),
    clear: new THREE.MeshPhysicalMaterial({ ...frost, transparent: true, opacity: 0.2, depthWrite: false }),
    green: new THREE.MeshPhysicalMaterial({ color: dark ? "#5cc79a" : "#1f6f5c", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 1 }),
    ink: new THREE.MeshPhysicalMaterial({ color: dark ? "#2a3845" : "#1b2530", roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2, envMapIntensity: 0.8 }),
    dot: new THREE.MeshBasicMaterial({ color: dark ? "#cdeee1" : "#1f6f5c" }),
    line: new THREE.MeshBasicMaterial({ color: dark ? "#9fdcc6" : "#4f7f72", transparent: true, opacity: 0.7 }),
  };
}

/* ---------- Glyphs. Each one is a picture of the item it sits next to. ----------
   Every builder returns { group, tick(t) }; the object is framed to fit a ~2.4 unit box. */

const BUILDERS = {
  // Long/short: one position above the line (long, green), one hanging below it (short).
  longshort(m) {
    const g = new THREE.Group();
    g.add(slab(2.0, 0.06, 1.1, m.frost, 0));
    const long = column(0.46, 1.0, m.green, -0.45, 0, 0.03);
    const short = column(0.46, 0.72, m.ink, 0.45, 0, -0.03);
    short.rotation.x = Math.PI; // hangs down from the line
    g.add(long, short, shadow(2.6, -0.95));
    g.position.y = 0.05;
    return { group: g, tick: (t) => {
      long.scale.y = 1.0 + Math.sin(t * 0.7) * 0.06;
      short.scale.y = 0.72 + Math.sin(t * 0.7 + 1.3) * 0.05;
      g.rotation.y = -0.45 + Math.sin(t * 0.25) * 0.2;
    } };
  },

  // Market neutral: a long (green) and a short (ink) of equal weight, balanced on a pivot.
  pairs(m) {
    const g = new THREE.Group(), beam = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.08, 48), m.frost, 0, -0.78, 0));
    g.add(mesh(new THREE.ConeGeometry(0.2, 0.5, 48), m.frost, 0, -0.5, 0));
    beam.add(slab(2.2, 0.06, 0.18, m.frost, 0));
    beam.add(ball(0.3, m.green, -0.88, 0.33, 0), ball(0.3, m.ink, 0.88, 0.33, 0));
    beam.position.y = -0.22;
    g.add(beam, shadow(2.4, -0.83));
    return { group: g, tick: (t) => { beam.rotation.z = Math.sin(t * 0.6) * 0.05; g.rotation.y = -0.3 + Math.sin(t * 0.2) * 0.25; } };
  },

  // Credit: the capital stack. Thick senior layer at the bottom, thin equity on top.
  stack(m) {
    const g = new THREE.Group();
    g.add(slab(1.8, 0.46, 1.25, m.frost, -0.5));
    g.add(slab(1.8, 0.28, 1.25, m.frost, -0.08));
    g.add(slab(1.8, 0.14, 1.25, m.green, 0.2));
    g.add(shadow(2.8, -0.75));
    g.position.y = 0.15;
    return { group: g, tick: (t) => { g.rotation.y = -0.6 + Math.sin(t * 0.22) * 0.25; } };
  },

  // Distressed: the same stack under stress. Equity cracked and sliding off, the middle out of line.
  stackBroken(m) {
    const g = new THREE.Group();
    g.add(slab(1.8, 0.46, 1.25, m.frost, -0.5));
    const mid = slab(1.8, 0.28, 1.25, m.frost, -0.1);
    mid.position.x = 0.14; mid.rotation.z = -0.05;
    const a = slab(0.86, 0.14, 1.25, m.ink, 0.17), b = slab(0.86, 0.14, 1.25, m.ink, 0.12);
    a.position.x = -0.5; a.rotation.z = 0.06;
    b.position.x = 0.62; b.rotation.z = -0.22;
    g.add(mid, a, b, shadow(2.8, -0.75));
    g.position.y = 0.15;
    return { group: g, tick: (t) => {
      g.rotation.y = -0.6 + Math.sin(t * 0.22) * 0.25;
      b.position.x = 0.62 + Math.sin(t * 0.5) * 0.03;
    } };
  },

  // Event-driven / merger arb: two companies drawing together, a thin ring around the deal.
  merge(m) {
    const g = new THREE.Group();
    const a = ball(0.52, m.frost), b = ball(0.44, m.green);
    const ringM = mesh(new THREE.TorusGeometry(0.62, 0.012, 12, 160), m.line);
    ringM.rotation.y = Math.PI / 2;
    g.add(a, b, ringM, shadow(2.6, -0.72));
    return { group: g, tick: (t) => {
      const gap = 0.5 + Math.sin(t * 0.6) * 0.07;
      a.position.x = -gap; b.position.x = gap - 0.06;
      g.rotation.y = -0.35 + Math.sin(t * 0.2) * 0.2;
    } };
  },

  // Quant / systematic: a signal surface of point-in-time dots over a clear base.
  wave(m) {
    const g = new THREE.Group(), N = 22, im = new THREE.InstancedMesh(DOT, m.dot, N * N), m4 = new THREE.Matrix4();
    g.add(slab(1.8, 0.04, 1.8, m.clear, -0.42), im, shadow(2.6, -0.46));
    return { group: g, tick: (t) => {
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x = (i / (N - 1) - 0.5) * 1.6, z = (j / (N - 1) - 0.5) * 1.6;
        const y = 0.16 * Math.sin(x * 2.3 + t * 0.7) + 0.12 * Math.cos(z * 2.7 + t * 0.5);
        m4.makeScale(0.026, 0.026, 0.026).setPosition(x, y, z);
        im.setMatrixAt(i * N + j, m4);
      }
      im.instanceMatrix.needsUpdate = true;
      g.rotation.y = -0.6 + Math.sin(t * 0.15) * 0.15;
    } };
  },

  // Global macro: a dotted globe with an equator ring.
  globe(m) {
    const g = new THREE.Group(), pts = [], n = 520, gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * gold;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(0.9));
    }
    const d = dots(pts, 0.022, m.dot), core = ball(0.86, m.clear);
    const eq = mesh(new THREE.TorusGeometry(1.12, 0.01, 12, 180), m.line);
    eq.rotation.x = Math.PI / 2 - 0.25;
    g.add(core, d, eq, shadow(2.2, -1.05));
    return { group: g, tick: (t) => { d.rotation.y = t * 0.15; } };
  },

  // Triangulation: three vendor reads converging on one blended read.
  triad(m) {
    const g = new THREE.Group(), c = new THREE.Vector3(0, 0.05, 0), pts = [];
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3 + 0.4;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.95, -0.15, Math.sin(a) * 0.95));
    }
    pts.forEach((p, i) => { g.add(ball(0.26, m.frost, p.x, p.y, p.z), rod(p, pts[(i + 1) % 3], 0.008, m.line), rod(p, c, 0.012, m.line)); });
    g.add(ball(0.17, m.green, c.x, c.y, c.z), shadow(2.8, -0.55));
    return { group: g, tick: (t) => { g.rotation.y = t * 0.18; } };
  },

  // Panel health: a panel of members on a base, one dropped out (an empty, marked slot).
  panel(m) {
    const g = new THREE.Group(), cells = [];
    g.add(slab(1.75, 0.06, 1.75, m.frost, -0.66));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const k = i * 3 + j, x = (i - 1) * 0.52, z = (j - 1) * 0.52;
      if (k === 5) { g.add(mesh(roundedBox(0.4, 0.02, 0.4, 0.01), m.ink, x, -0.62, z)); continue; }
      const h = 0.45 + ((k * 37) % 11) / 16, c = column(0.4, h, m.frost, x, z, -0.63);
      g.add(c); cells.push({ c, h, k });
    }
    g.add(shadow(2.8, -0.7));
    return { group: g, tick: (t) => {
      cells.forEach(({ c, h, k }) => { c.scale.y = h * (1 + Math.sin(t * 0.6 + k) * 0.05); });
      g.rotation.y = -0.65 + Math.sin(t * 0.2) * 0.2;
    } };
  },

  // Point-in-time: dated snapshots stacked in order; the top one is "as known today".
  layers(m) {
    const g = new THREE.Group(), dotsAt = [[-0.4, 0.2], [0.1, -0.3], [0.35, 0.25], [-0.1, 0.05]];
    for (let i = 0; i < 4; i++) {
      const y = -0.55 + i * 0.34, top = i === 3;
      const sheet = slab(1.6, 0.04, 1.1, top ? m.frost : m.clear, y);
      sheet.position.x = (i - 1.5) * 0.08;
      g.add(sheet, ball(0.06, top ? m.green : m.ink, sheet.position.x + dotsAt[i][0], y + 0.07, dotsAt[i][1]));
    }
    g.add(shadow(2.6, -0.62));
    return { group: g, tick: (t) => { g.rotation.y = -0.55 + Math.sin(t * 0.22) * 0.25; } };
  },

  // Dataset trials: a vendor's estimates (columns) checked against reported numbers (dark markers).
  trial(m) {
    const g = new THREE.Group(), est = [0.7, 1.05, 0.85, 1.25], rep = [0.78, 1.0, 0.95, 1.2];
    g.add(slab(2.1, 0.06, 0.9, m.frost, -0.66));
    est.forEach((h, i) => {
      const x = (i - 1.5) * 0.48;
      g.add(column(0.3, h, m.frost, x, 0, -0.63));
      g.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 32), m.ink, x, -0.63 + rep[i], 0));
    });
    g.add(shadow(2.8, -0.7));
    return { group: g, tick: (t) => { g.rotation.y = -0.5 + Math.sin(t * 0.22) * 0.25; } };
  },

  // Your environment: a clear box holding the core; nothing leaves it.
  enclave(m) {
    const g = new THREE.Group(), pts = [];
    for (let i = 0; i < 30; i++) pts.push(new THREE.Vector3(((i * 53) % 13) / 13 - 0.5, ((i * 29) % 11) / 11 - 0.5, ((i * 71) % 17) / 17 - 0.5).multiplyScalar(1.05));
    const specks = dots(pts, 0.028, m.dot);
    const box = mesh(roundedBox(1.6, 1.6, 1.6, 0.2), m.clear);
    box.renderOrder = 1;
    g.add(ball(0.32, m.green), specks, box, shadow(2.6, -0.95));
    return { group: g, tick: (t) => { g.rotation.y = -0.5 + t * 0.15; specks.rotation.y = -t * 0.25; } };
  },

  // The Enclave mark in 3D: the D outline, the ring and the core.
  logo(m) {
    const g = new THREE.Group(), pts = [], s = 1 / 16;
    const push = (x, y) => pts.push(new THREE.Vector3((x - 30) * s, (32 - y) * s, 0));
    for (let x = 18.5; x < 30; x += 1.5) push(x, 15.5);
    for (let a = -Math.PI / 2; a <= Math.PI / 2; a += Math.PI / 24) push(30 + Math.cos(a) * 16.5, 32 + Math.sin(a) * 16.5);
    for (let x = 30; x > 18.5; x -= 1.5) push(x, 48.5);
    for (let y = 48.5; y > 15.5; y -= 2) push(18.5, y);
    const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal", 0.2);
    const mark = new THREE.Group();
    mark.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 260, 0.17, 20, true), m.frost));
    const r = mesh(new THREE.TorusGeometry(0.59, 0.045, 16, 120), m.line, 0.03, 0, 0);
    mark.add(r, ball(0.3, m.green, 0.03, 0, 0));
    mark.scale.setScalar(0.8);
    g.add(mark, shadow(2.2, -1.0));
    return { group: g, tick: (t) => { mark.rotation.y = Math.sin(t * 0.4) * 0.35; } };
  },
};

/* ---------- Studio environment for the frosted look ---------- */

function makeEnvironment(renderer) {
  const s = new THREE.Scene(), geo = new THREE.SphereGeometry(10, 32, 16), col = [];
  const top = new THREE.Color("#ffffff"), mid = new THREE.Color("#9db3ad"), low = new THREE.Color("#1a2624"), c = new THREE.Color();
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 10;
    if (y > 0) c.copy(mid).lerp(top, y); else c.copy(mid).lerp(low, -y);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  s.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const soft = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.5), new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide }));
  soft.position.set(-4, 6, 4); soft.lookAt(0, 0, 0);
  const rim = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshBasicMaterial({ color: "#c3f2df", side: THREE.DoubleSide }));
  rim.position.set(6, 1.5, -5); rim.lookAt(0, 0, 0);
  s.add(soft, rim);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(s, 0.04).texture;
  pmrem.dispose();
  return tex;
}

/* ---------- Render: one offscreen renderer, copied into each glyph's own canvas ---------- */

function init() {
  document.documentElement.classList.add("has-glyphs");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.setSize(MAX, MAX, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setScissorTest(true);
  const gl = renderer.domElement, env = makeEnvironment(renderer);
  const mats = { dark: materials(true), light: materials(false) };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const views = els.map((el, i) => {
    const build = BUILDERS[el.dataset.glyph];
    if (!build) return null;
    const dark = !!el.closest(".band, .site-footer");
    const scene = new THREE.Scene();
    scene.environment = env;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a2422, 0.45));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(-3, 6, 4);
    scene.add(key);
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
    camera.position.set(0, 1.9, 6.4);
    camera.lookAt(0, -0.05, 0);
    const obj = build(dark ? mats.dark : mats.light);
    scene.add(obj.group);
    const canvas = document.createElement("canvas");
    el.appendChild(canvas);
    return { el, scene, camera, obj, canvas, ctx: canvas.getContext("2d"), on: false, drawn: false, phase: i * 1.7 };
  }).filter(Boolean);

  const drawView = (v, t) => {
    const w = Math.min(MAX, Math.round(v.el.clientWidth * dpr)), h = Math.min(MAX, Math.round(v.el.clientHeight * dpr));
    if (w < 2 || h < 2) return;
    if (v.canvas.width !== w || v.canvas.height !== h) { v.canvas.width = w; v.canvas.height = h; }
    renderer.setViewport(0, 0, w, h);
    renderer.setScissor(0, 0, w, h);
    v.camera.aspect = w / h;
    v.camera.updateProjectionMatrix();
    v.obj.tick(t + v.phase);
    renderer.clear();
    renderer.render(v.scene, v.camera);
    v.ctx.clearRect(0, 0, w, h);
    v.ctx.drawImage(gl, 0, MAX - h, w, h, 0, 0, w, h);
    v.drawn = true;
  };

  let raf = 0;
  const t0 = performance.now();
  const loop = (now) => {
    raf = 0;
    const t = reduced ? 1 : (now - t0) / 1000;
    let any = false;
    for (const v of views) {
      if (!v.on) continue;
      any = true;
      if (!reduced || !v.drawn) drawView(v, t);
    }
    if (any && !reduced) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  const byEl = new Map(views.map((v) => [v.el, v]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { byEl.get(e.target).on = e.isIntersecting; });
    kick();
  }, { rootMargin: "120px 0px" });
  views.forEach((v) => io.observe(v.el));
  window.addEventListener("resize", () => { views.forEach((v) => { v.drawn = false; }); kick(); });
}

if (els.length && webglOK()) init();
