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

/* ---------- Hero: research engine (sources flow in, insights flow out) ---------- */
function researchEngine(canvas) {
  const host = canvas.parentElement;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.2, 13);
  camera.lookAt(0, 0, 0);

  // Core: wireframe icosahedron + inner glow + orbit rings
  const core = new THREE.Group();
  scene.add(core);
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.35, 1)),
    new THREE.LineBasicMaterial({ color: 0x6fd3a7, transparent: true, opacity: 0.75 })
  );
  core.add(shell);
  const glow = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.8, 2),
    new THREE.MeshBasicMaterial({ color: 0x1f6f5c, transparent: true, opacity: 0.55 })
  );
  core.add(glow);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x6fd3a7, transparent: true, opacity: 0.05, depthWrite: false })
  );
  core.add(halo);
  const rings = [];
  [[2.2, 0.35, 0xc8a24a], [2.6, -0.6, 0x6fd3a7]].forEach(([r, tilt, c]) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.012, 8, 120),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 })
    );
    ring.rotation.x = Math.PI / 2 + tilt;
    core.add(ring);
    rings.push(ring);
  });

  // Incoming documents: small thin cards on curved paths
  const SRC = [0xc8a24a, 0x7fb6ff, 0x6fd3a7, 0xd7a6ff, 0x9aa5b1];
  const docGeo = new THREE.PlaneGeometry(0.42, 0.56);
  const docs = [];
  for (let i = 0; i < 34; i++) {
    const m = new THREE.Mesh(docGeo, new THREE.MeshBasicMaterial({ color: SRC[i % SRC.length], transparent: true, opacity: 0, side: THREE.DoubleSide }));
    scene.add(m);
    docs.push({ m, t: Math.random(), speed: 0.1 + Math.random() * 0.08, lane: (i % 5) - 2, jitter: Math.random() * Math.PI * 2, z: (Math.random() - 0.5) * 3 });
  }
  // Outgoing insights: brighter, larger cards heading right
  const outGeo = new THREE.PlaneGeometry(0.9, 0.34);
  const outs = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(outGeo, new THREE.MeshBasicMaterial({ color: i % 3 === 1 ? 0xc8a24a : 0x6fd3a7, transparent: true, opacity: 0, side: THREE.DoubleSide }));
    scene.add(m);
    outs.push({ m, t: i / 6, lane: (i % 3) - 1 });
  }
  // Faint particle dust around everything
  const dustN = 380, dust = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    dust[i * 3] = (Math.random() - 0.5) * 18;
    dust[i * 3 + 1] = (Math.random() - 0.5) * 8;
    dust[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0x8a97a3, size: 0.035, transparent: true, opacity: 0.6 })));

  let mx = 0, tx = 0;
  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
  });

  let spanX = 6.2;
  const frame = (t, dt) => {
    // incoming: from far left, curving into the core
    docs.forEach((d) => {
      d.t += (dt || 0) * d.speed;
      if (d.t > 1) { d.t -= 1; d.z = (Math.random() - 0.5) * 3; }
      const u = d.t, e = u * u * (3 - 2 * u);
      const x = -spanX + e * spanX;
      const y = d.lane * 0.75 * (1 - e) + Math.sin(t * 1.2 + d.jitter) * 0.12 * (1 - e);
      d.m.position.set(x, y, d.z * (1 - e));
      d.m.rotation.set(0.25 * Math.sin(t + d.jitter), 0.5 * (1 - e) + 0.3 * Math.sin(t * 0.7 + d.jitter), 0.1 * d.lane);
      const s = 1 - e * 0.85;
      d.m.scale.set(s, s, s);
      d.m.material.opacity = Math.min(1, u * 6) * (1 - Math.max(0, (e - 0.8) / 0.2)) * 0.95;
    });
    // outgoing: from core to the right
    outs.forEach((o) => {
      o.t += (dt || 0) * 0.16;
      if (o.t > 1) o.t -= 1;
      const u = o.t, e = 1 - Math.pow(1 - u, 2);
      o.m.position.set(1.4 + e * (spanX - 1.4), o.lane * 0.9 * e + 0.1, 0.6);
      o.m.rotation.set(0, -0.35 * (1 - e), 0);
      o.m.scale.setScalar(0.3 + 0.7 * Math.min(1, e * 2));
      o.m.material.opacity = Math.min(1, u * 5) * (1 - Math.max(0, (u - 0.75) / 0.25)) * 0.9;
    });
    shell.rotation.y = t * 0.25; shell.rotation.x = t * 0.12;
    glow.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06);
    halo.material.opacity = 0.05 + (Math.sin(t * 2.2) + 1) * 0.02;
    rings[0].rotation.z = t * 0.4; rings[1].rotation.z = -t * 0.3;
    mx += (tx - mx) * 0.05;
    scene.rotation.y = mx * 0.18;
    renderer.render(scene, camera);
  };

  const onResize = () => {
    fit(renderer, camera, canvas);
    spanX = camera.aspect < 1 ? 4.2 : 6.2;
    camera.position.z = camera.aspect < 1 ? 15 : 13;
    scene.position.x = camera.aspect > 1 ? -1.6 : 0; // leave room for insight cards on the right
    frame(0, 0);
  };
  window.addEventListener("resize", onResize);
  onResize();
  runWhenVisible(host, frame);
}

/* ---------- Trust strip: sealed enclave (data moves inside, never leaves) ---------- */
function enclave(canvas) {
  const host = canvas.parentElement;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(5.5, 4, 7.5);
  camera.lookAt(0, 0, 0);

  const box = new THREE.Group();
  scene.add(box);
  const B = 1.6;
  box.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(B * 2, B * 2, B * 2)),
    new THREE.LineBasicMaterial({ color: 0x6fd3a7, transparent: true, opacity: 0.9 })
  ));
  box.add(new THREE.Mesh(
    new THREE.BoxGeometry(B * 2, B * 2, B * 2),
    new THREE.MeshBasicMaterial({ color: 0x6fd3a7, transparent: true, opacity: 0.06, depthWrite: false })
  ));
  // Inner data points bouncing off the walls
  const N = 140, pos = new Float32Array(N * 3), vel = [];
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < 3; k++) pos[i * 3 + k] = (Math.random() * 2 - 1) * (B - 0.1);
    vel.push([(Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  box.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xc8a24a, size: 0.09, transparent: true, opacity: 0.95 })));
  // Wall pulses where points hit
  const pulses = [];
  const pulseGeo = new THREE.RingGeometry(0.05, 0.12, 24);
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: 0x6fd3a7, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    box.add(m); pulses.push({ m, life: 0 });
  }
  let pi = 0;
  const hit = (x, y, z, axis) => {
    const p = pulses[pi++ % pulses.length];
    p.m.position.set(x, y, z);
    p.m.rotation.set(axis === 1 ? Math.PI / 2 : 0, axis === 0 ? Math.PI / 2 : 0, 0);
    p.life = 1;
  };

  const frame = (t, dt) => {
    const d = dt || 0;
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < 3; k++) {
        let v = pos[i * 3 + k] + vel[i][k] * d;
        if (v > B - 0.05 || v < -(B - 0.05)) {
          vel[i][k] *= -1;
          v = Math.max(-(B - 0.05), Math.min(B - 0.05, v));
          if (Math.random() < 0.25) hit(k === 0 ? Math.sign(v) * B : pos[i * 3], k === 1 ? Math.sign(v) * B : pos[i * 3 + 1], k === 2 ? Math.sign(v) * B : pos[i * 3 + 2], k);
        }
        pos[i * 3 + k] = v;
      }
    }
    g.attributes.position.needsUpdate = true;
    pulses.forEach((p) => {
      if (p.life > 0) { p.life -= d * 1.6; p.m.material.opacity = Math.max(0, p.life) * 0.8; p.m.scale.setScalar(1 + (1 - p.life) * 2.5); }
    });
    box.rotation.y = t * 0.25;
    box.rotation.x = Math.sin(t * 0.3) * 0.12;
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
  const engine = document.getElementById("engine-3d");
  if (engine) researchEngine(engine);
  const vault = document.getElementById("enclave-3d");
  if (vault) enclave(vault);
}
