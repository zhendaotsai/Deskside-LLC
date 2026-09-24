// Deskside: small frosted 3D objects ("glyphs") placed next to content.
// Every [data-glyph] element gets its own little scene, all drawn by ONE shared WebGL
// canvas (scissored into each element's box), so a page can have many without many contexts.
// Purely visual: without WebGL the glyph boxes are hidden and the page reads the same.
import * as THREE from "./vendor/three.module.min.js";

const els = [...document.querySelectorAll("[data-glyph]")];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

/* ---------- Shapes ---------- */

// Box with softly rounded edges and smooth normals: w (x) by h (y) by d (z), centred.
// Grid vertices are packed towards the edges so the rounding stays smooth.
function roundedBox(w, h, d, r) {
  const seg = 16, g = new THREE.BoxGeometry(1, 1, 1, seg, seg, seg);
  const pos = g.attributes.position, nor = g.attributes.normal;
  const inner = [w / 2 - r, h / 2 - r, d / 2 - r], v = [0, 0, 0], c = [0, 0, 0];
  const n = new THREE.Vector3();
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

const SPHERE = new THREE.SphereGeometry(1, 48, 24);
const DOT = new THREE.SphereGeometry(1, 10, 8);

function materials(tone) {
  const dark = tone === "dark";
  const glassish = {
    color: new THREE.Color(dark ? "#d9eee6" : "#dfe8e4"), roughness: 0.3, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.16, sheen: 0.6, sheenColor: new THREE.Color("#9fdcc6"),
    envMapIntensity: dark ? 1.15 : 0.95,
  };
  return {
    glass: new THREE.MeshPhysicalMaterial(glassish),
    clear: new THREE.MeshPhysicalMaterial({ ...glassish, transparent: true, opacity: 0.3, depthWrite: false }),
    ink: new THREE.MeshStandardMaterial({ color: "#16212a", roughness: 0.45, metalness: 0.1 }),
    accent: new THREE.MeshStandardMaterial({ color: dark ? "#6fd3a7" : "#1f6f5c", roughness: 0.35, emissive: dark ? "#1f6f5c" : "#000000", emissiveIntensity: 0.4 }),
    dot: new THREE.MeshBasicMaterial({ color: dark ? "#cdeee1" : "#1f6f5c" }),
    line: new THREE.MeshBasicMaterial({ color: dark ? "#9fdcc6" : "#1f6f5c", transparent: true, opacity: dark ? 0.55 : 0.45 }),
  };
}

function ball(r, mat) { const m = new THREE.Mesh(SPHERE, mat); m.scale.setScalar(r); return m; }
function ring(r, tube, mat) { return new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 160), mat); }
function stick(a, b, r, mat) {
  const dir = new THREE.Vector3().subVectors(b, a), len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}
function dotsMesh(points, r, mat) {
  const im = new THREE.InstancedMesh(DOT, mat, points.length);
  const m4 = new THREE.Matrix4();
  points.forEach((p, i) => { m4.makeScale(r, r, r).setPosition(p); im.setMatrixAt(i, m4); });
  return im;
}

/* ---------- Glyphs: each returns { group, tick(t) } ---------- */

const BUILDERS = {
  // Research you license: a frosted cube with a dot lattice on its faces.
  lattice(m) {
    const g = new THREE.Group(), cube = new THREE.Mesh(roundedBox(1.5, 1.5, 1.5, 0.2), m.glass);
    g.add(cube);
    const pts = [], k = [-0.42, 0, 0.42], f = 0.77;
    for (const a of k) for (const b of k) {
      pts.push(new THREE.Vector3(a, b, f), new THREE.Vector3(a, b, -f), new THREE.Vector3(f, a, b),
        new THREE.Vector3(-f, a, b), new THREE.Vector3(a, f, b), new THREE.Vector3(a, -f, b));
    }
    g.add(dotsMesh(pts, 0.03, m.ink));
    [[0, 6], [6, 24], [24, 42], [42, 48], [2, 20], [20, 38], [5, 23], [23, 41]].forEach(([i, j]) => {
      if (pts[i] && pts[j]) g.add(stick(pts[i], pts[j], 0.011, m.line));
    });
    g.rotation.x = 0.45;
    return { group: g, tick: (t) => { g.rotation.y = t * 0.22; } };
  },

  // Your book: a sphere with a slow satellite on a thin orbit.
  orbit(m) {
    const g = new THREE.Group();
    g.add(ball(0.78, m.glass));
    const orbitG = new THREE.Group(), o = ring(1.2, 0.01, m.line), sat = ball(0.085, m.accent);
    orbitG.add(o, sat);
    orbitG.rotation.set(Math.PI / 2 - 0.4, 0.3, 0);
    g.add(orbitG);
    return { group: g, tick: (t) => { const a = t * 0.5; sat.position.set(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0); } };
  },

  // What changed: six petals around a centre, with thin spokes.
  bloom(m) {
    const g = new THREE.Group(), petals = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3, p = ball(0.34, m.glass);
      p.scale.set(0.34, 0.34, 0.2);
      p.position.set(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0);
      petals.add(p);
      const tip = new THREE.Vector3(Math.cos(a + 0.52) * 1.2, Math.sin(a + 0.52) * 1.2, 0.05);
      petals.add(stick(new THREE.Vector3(0, 0, 0.05), tip, 0.007, m.line), dotsMesh([tip], 0.05, m.ink));
    }
    petals.add(ball(0.2, m.accent));
    g.add(petals);
    g.rotation.x = -0.5;
    return { group: g, tick: (t) => { petals.rotation.z = t * 0.15; } };
  },

  // Delivered where you work: a tray with a sheet settling onto it.
  tray(m) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(roundedBox(1.9, 0.16, 1.3, 0.06), m.glass);
    base.position.y = -0.35;
    const sheet = new THREE.Mesh(roundedBox(1.25, 0.05, 0.85, 0.02), m.glass);
    const mark = ball(0.07, m.accent);
    mark.position.set(0.42, 0.05, -0.25);
    const sheetG = new THREE.Group();
    sheetG.add(sheet, mark);
    g.add(base, sheetG);
    g.rotation.set(0.5, -0.65, 0);
    return { group: g, tick: (t) => { sheetG.position.y = 0.12 + Math.sin(t * 0.9) * 0.06; } };
  },

  // Estimates: three columns on a base, gently breathing.
  bars(m) {
    const g = new THREE.Group(), cols = [];
    const base = new THREE.Mesh(roundedBox(1.9, 0.1, 0.8, 0.04), m.glass);
    base.position.y = -0.75;
    g.add(base);
    [0.8, 1.35, 1.05].forEach((h, i) => {
      const geo = roundedBox(0.42, h, 0.42, 0.07);
      geo.translate(0, h / 2, 0);
      const c = new THREE.Mesh(geo, i === 1 ? m.accent : m.glass);
      c.position.set((i - 1) * 0.6, -0.7, 0);
      g.add(c); cols.push(c);
    });
    g.rotation.x = 0.25;
    return { group: g, tick: (t) => {
      g.rotation.y = -0.5 + Math.sin(t * 0.3) * 0.25;
      cols.forEach((c, i) => { c.scale.y = 1 + Math.sin(t * 0.8 + i * 1.7) * 0.05; });
    } };
  },

  // Market neutral: a balanced beam with a sphere at each end.
  pairs(m) {
    const g = new THREE.Group(), beamG = new THREE.Group();
    const pivot = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.34, 32), m.glass);
    pivot.position.y = -0.55;
    beamG.add(new THREE.Mesh(roundedBox(2.1, 0.06, 0.16, 0.02), m.glass));
    const l = ball(0.3, m.glass), r = ball(0.3, m.glass);
    l.position.set(-0.88, 0.33, 0); r.position.set(0.88, 0.33, 0);
    beamG.add(l, r);
    beamG.position.y = -0.34;
    g.add(pivot, beamG);
    g.rotation.x = 0.15;
    return { group: g, tick: (t) => { beamG.rotation.z = Math.sin(t * 0.7) * 0.07; g.rotation.y = Math.sin(t * 0.2) * 0.35; } };
  },

  // Credit: a capital stack of three slabs.
  stack(m) { return slabs(m, false); },
  // Distressed: the same stack with the middle layer knocked out of line.
  stackBroken(m) { return slabs(m, true); },

  // Event-driven: two interlinked rings.
  links(m) {
    const g = new THREE.Group();
    const a = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.13, 32, 96), m.glass);
    const b = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.13, 32, 96), m.glass);
    a.position.x = -0.28; b.position.x = 0.28; b.rotation.x = Math.PI / 2;
    g.add(a, b);
    return { group: g, tick: (t) => { g.rotation.set(0.35, t * 0.3, 0.15); } };
  },

  // Quant / point-in-time: a dotted surface.
  wave(m) {
    const g = new THREE.Group(), N = 20, im = new THREE.InstancedMesh(DOT, m.dot, N * N), m4 = new THREE.Matrix4();
    g.add(im);
    g.rotation.set(0.55, -0.6, 0);
    return { group: g, tick: (t) => {
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x = (i / (N - 1) - 0.5) * 1.9, z = (j / (N - 1) - 0.5) * 1.9;
        const y = 0.18 * Math.sin(x * 2.2 + t * 0.8) + 0.14 * Math.cos(z * 2.6 + t * 0.6);
        m4.makeScale(0.028, 0.028, 0.028).setPosition(x, y, z);
        im.setMatrixAt(i * N + j, m4);
      }
      im.instanceMatrix.needsUpdate = true;
    } };
  },

  // Macro: a dotted globe with a thin ring.
  globe(m) {
    const g = new THREE.Group(), pts = [], n = 420, gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * gold;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(0.95));
    }
    const dots = dotsMesh(pts, 0.024, m.dot);
    const inner = ball(0.9, m.clear);
    const o = ring(1.22, 0.008, m.line);
    o.rotation.x = Math.PI / 2 - 0.3;
    g.add(inner, dots, o);
    g.rotation.x = 0.3;
    return { group: g, tick: (t) => { dots.rotation.y = t * 0.15; } };
  },

  // Alt-data panel: a grid of cells, one of them dropping out.
  panel(m) {
    const g = new THREE.Group(), cells = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const k = i * 4 + j, h = 0.3 + ((k * 37) % 11) / 16;
      const geo = roundedBox(0.34, 1, 0.34, 0.06);
      geo.translate(0, 0.5, 0);
      const c = new THREE.Mesh(geo, k === 6 ? m.ink : m.glass);
      c.position.set((i - 1.5) * 0.44, -0.55, (j - 1.5) * 0.44);
      g.add(c); cells.push({ c, h: k === 6 ? 0.08 : h, k });
    }
    g.rotation.set(0.6, -0.75, 0);
    return { group: g, tick: (t) => { cells.forEach(({ c, h, k }) => { c.scale.y = h * (1 + Math.sin(t * 0.7 + k) * 0.06); }); } };
  },

  // Triangulation: three sources pointing to one read.
  triad(m) {
    const g = new THREE.Group(), centre = new THREE.Vector3(0, 0, 0);
    g.add(ball(0.18, m.accent));
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3 + 0.3, p = new THREE.Vector3(Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95);
      const s = ball(0.28, m.glass);
      s.position.copy(p);
      g.add(s, stick(p, centre, 0.01, m.line));
    }
    g.rotation.x = 0.6;
    return { group: g, tick: (t) => { g.rotation.y = t * 0.25; } };
  },

  // Your environment: a clear box holding a core that never leaves it.
  enclave(m) {
    const g = new THREE.Group();
    const core = ball(0.34, m.accent);
    const pts = [];
    for (let i = 0; i < 26; i++) pts.push(new THREE.Vector3(((i * 53) % 13) / 13 - 0.5, ((i * 29) % 11) / 11 - 0.5, ((i * 71) % 17) / 17 - 0.5).multiplyScalar(1.1));
    const specks = dotsMesh(pts, 0.03, m.dot);
    const box = new THREE.Mesh(roundedBox(1.6, 1.6, 1.6, 0.18), m.clear);
    box.renderOrder = 1;
    g.add(core, specks, box);
    g.rotation.x = 0.4;
    return { group: g, tick: (t) => { g.rotation.y = t * 0.2; specks.rotation.y = -t * 0.3; } };
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
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 240, 0.17, 16, true), m.glass));
    const r = ring(0.59, 0.05, m.line);
    r.position.x = 0.03;
    const c = ball(0.3, m.accent);
    c.position.x = 0.03;
    g.add(r, c);
    g.scale.setScalar(0.85);
    return { group: g, tick: (t) => { g.rotation.y = Math.sin(t * 0.4) * 0.35; } };
  },
};

function slabs(m, broken) {
  const g = new THREE.Group(), layers = [];
  [-0.38, 0, 0.38].forEach((y, i) => {
    const s = new THREE.Mesh(roundedBox(1.6, 0.24, 1.15, 0.07), m.glass);
    s.position.y = y;
    if (broken && i === 1) { s.position.x = 0.3; s.rotation.y = 0.14; }
    g.add(s); layers.push(s);
  });
  const mark = ball(0.07, broken ? m.ink : m.accent);
  mark.position.set(0.45, 0.54, 0.3);
  g.add(mark);
  return { group: g, tick: (t) => { g.rotation.set(0.5, -0.7 + Math.sin(t * 0.25) * 0.2, 0); } };
}

/* ---------- Shared environment (soft studio light for the frosted look) ---------- */

function makeEnvironment(renderer) {
  const s = new THREE.Scene(), geo = new THREE.SphereGeometry(10, 32, 16), col = [];
  const top = new THREE.Color("#ffffff"), mid = new THREE.Color("#8fa9a2"), low = new THREE.Color("#14201f"), c = new THREE.Color();
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 10;
    if (y > 0) c.copy(mid).lerp(top, y); else c.copy(mid).lerp(low, -y);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  s.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const soft = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide }));
  soft.position.set(-4, 6, 4); soft.lookAt(0, 0, 0);
  const rim = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshBasicMaterial({ color: "#b8f0da", side: THREE.DoubleSide }));
  rim.position.set(6, 1, -5); rim.lookAt(0, 0, 0);
  s.add(soft, rim);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(s, 0.04).texture;
  pmrem.dispose();
  return tex;
}

/* ---------- One canvas, many views ---------- */

function init() {
  document.documentElement.classList.add("has-glyphs");
  const canvas = document.createElement("canvas");
  canvas.className = "glyph-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  const env = makeEnvironment(renderer);
  const mats = { dark: materials("dark"), light: materials("light") };

  const views = els.map((el, i) => {
    const build = BUILDERS[el.dataset.glyph];
    if (!build) return null;
    const tone = el.closest(".band, .site-footer") ? "dark" : "light";
    const scene = new THREE.Scene();
    scene.environment = env;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a2422, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(-3, 5, 4);
    scene.add(key);
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0.3, 6.2);
    camera.lookAt(0, 0, 0);
    const obj = build(mats[tone]);
    scene.add(obj.group);
    return { el, scene, camera, obj, on: false, phase: i * 1.7 };
  }).filter(Boolean);

  let raf = 0;
  const t0 = performance.now();
  const draw = (now) => {
    raf = 0;
    const W = document.documentElement.clientWidth, H = document.documentElement.clientHeight;
    const size = renderer.getSize(new THREE.Vector2());
    if (size.x !== W || size.y !== H) renderer.setSize(W, H, false);
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);
    const t = reduced ? 1 : (now - t0) / 1000;
    let any = false;
    for (const v of views) {
      if (!v.on) continue;
      const r = v.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || r.width < 2) continue;
      any = true;
      const y = H - r.bottom;
      renderer.setViewport(r.left, y, r.width, r.height);
      renderer.setScissor(r.left, y, r.width, r.height);
      v.camera.aspect = r.width / r.height;
      v.camera.updateProjectionMatrix();
      v.obj.tick(t + v.phase);
      renderer.render(v.scene, v.camera);
    }
    if (any && !reduced) raf = requestAnimationFrame(draw);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

  const byEl = new Map(views.map((v) => [v.el, v]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { byEl.get(e.target).on = e.isIntersecting; });
    kick();
  }, { rootMargin: "80px 0px" });
  views.forEach((v) => io.observe(v.el));
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  kick();
}

if (els.length && webglOK()) init();
