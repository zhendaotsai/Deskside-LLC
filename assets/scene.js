// Deskside — 3D accents. Pure decoration: the page reads fine without WebGL or JS.
import * as THREE from "./vendor/three.module.min.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

// Drive a render loop only while the element is on screen.
function runWhenVisible(el, frame) {
  let visible = false, raf = 0, last = performance.now(), t = 0;
  const tick = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    frame(t, dt);
    if (visible && !reduced) raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) { last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    else cancelAnimationFrame(raf);
  }, { threshold: 0.01 });
  io.observe(el);
}

function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.setClearColor(0x000000, 0);
  return r;
}

function fit(renderer, camera, el) {
  const w = el.clientWidth, h = el.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* ---------- Hero: a slow-moving field of data points ---------- */
function heroTerrain(canvas) {
  const host = canvas.parentElement;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(0, 9, 26);
  camera.lookAt(0, 0, 0);

  const COLS = 150, ROWS = 64, SX = 0.42, SZ = 0.42;
  const count = COLS * ROWS;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const base = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const k = j * COLS + i;
      const x = (i - COLS / 2) * SX, z = (j - ROWS / 2) * SZ;
      base.push(x, z);
      pos[k * 3] = x; pos[k * 3 + 2] = z;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.075, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  const low = new THREE.Color("#9fb3ad"), mid = new THREE.Color("#1f6f5c"), high = new THREE.Color("#c8a24a");
  const tmp = new THREE.Color();
  let mx = 0, my = 0, tx = 0, ty = 0;
  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });

  const frame = (t) => {
    for (let k = 0; k < count; k++) {
      const x = base[k * 2], z = base[k * 2 + 1];
      const y =
        Math.sin(x * 0.28 + t * 0.55) * 0.9 +
        Math.cos(z * 0.35 - t * 0.4) * 0.7 +
        Math.sin((x + z) * 0.12 + t * 0.25) * 1.1;
      pos[k * 3 + 1] = y;
      const h = (y + 2.7) / 5.4;
      if (h < 0.55) tmp.copy(low).lerp(mid, h / 0.55);
      else tmp.copy(mid).lerp(high, (h - 0.55) / 0.45);
      col[k * 3] = tmp.r; col[k * 3 + 1] = tmp.g; col[k * 3 + 2] = tmp.b;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
    points.rotation.y = mx * 0.12 + Math.sin(t * 0.05) * 0.05;
    camera.position.y = 9 - my * 1.2;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };

  const onResize = () => { fit(renderer, camera, canvas); frame(0); };
  window.addEventListener("resize", onResize);
  onResize();
  runWhenVisible(host, frame);
}

/* ---------- Alt-data: cohort retention surface (synthetic) ---------- */
function cohortSurface(canvas) {
  const host = canvas.parentElement;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
  camera.position.set(13.5, 11.5, 15);
  camera.lookAt(0, 3.1, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(8, 16, 10);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fd3a7, 0.5);
  rim.position.set(-10, 6, -8);
  scene.add(rim);

  const N = 12, GAP = 0.86, H = 8;
  const group = new THREE.Group();
  scene.add(group);

  // Synthetic retention: newer cohorts retain slightly better; triangle of observed months.
  const cells = [];
  for (let c = 0; c < N; c++) {
    const quality = 0.9 + c * 0.012;
    for (let m = 0; m < N - c; m++) {
      // m = 0 is month 1 after acquisition
      const r = quality * Math.pow(m + 2, -0.55) * (1 + 0.04 * Math.sin(c * 1.7 + m));
      cells.push({ c, m, r: Math.min(r, 1) });
    }
  }
  const geo = new THREE.BoxGeometry(0.72, 1, 0.72);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.08 });
  const mesh = new THREE.InstancedMesh(geo, mat, cells.length);
  const hiC = new THREE.Color("#6fd3a7"), loC = new THREE.Color("#1a4d42"), newC = new THREE.Color("#c8a24a");
  const tmpC = new THREE.Color();
  cells.forEach((cell, i) => {
    tmpC.copy(loC).lerp(hiC, Math.min(1, cell.r / 0.62));
    if (cell.c + cell.m === N - 1) tmpC.lerp(newC, 0.55); // latest month observed for each cohort
    mesh.setColorAt(i, tmpC);
  });
  group.add(mesh);

  // Floor grid
  const grid = new THREE.GridHelper(N * GAP + 0.6, N, 0x2c3a47, 0x1c2731);
  grid.position.y = -0.01;
  group.add(grid);

  const off = ((N - 1) * GAP) / 2;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const place = (grow) => {
    cells.forEach((cell, i) => {
      const delay = (cell.c + cell.m) * 0.035;
      const g = Math.max(0, Math.min(1, (grow - delay) / 0.6));
      const e = 1 - Math.pow(1 - g, 3);
      p.set(cell.m * GAP - off, 0, cell.c * GAP - off);
      s.set(1, Math.max(0.001, cell.r * H * e), 1);
      m4.compose(p, q, s);
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  let grow = reduced ? 10 : 0;
  const frame = (t, dt) => {
    if (grow < 3) grow += dt;
    place(grow);
    group.rotation.y = reduced ? -0.35 : -0.35 + Math.sin(t * 0.18) * 0.35;
    renderer.render(scene, camera);
  };

  const onResize = () => { fit(renderer, camera, canvas); frame(0, 0); };
  window.addEventListener("resize", onResize);
  onResize();
  runWhenVisible(host, frame);
}

if (webglOK()) {
  document.documentElement.classList.add("has-3d");
  const hero = document.getElementById("hero-3d");
  const cohort = document.getElementById("cohort-3d");
  if (hero) heroTerrain(hero);
  if (cohort) cohortSurface(cohort);
}
