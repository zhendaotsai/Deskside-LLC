// Deskside: 3D coverage bars in the hero brief. The page reads fine without WebGL or JS
// (main.js draws a flat version of the same bars).
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

/* ---------- Hero brief: one bar per covered name, flagged names rise ---------- */
function coverageBars(canvas, data) {
  const host = canvas.parentElement;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(-6, 10, 8);
  scene.add(key);

  const N = data.scores.length, GAP = 0.5;
  let H = 2.2;
  const geo = new THREE.BoxGeometry(0.34, 1, 0.34);
  geo.translate(0, 0.5, 0);
  const base = new THREE.Color("#c9ccd1");
  const bars = data.scores.map((v, k) => {
    const f = data.flagged.indexOf(k);
    const color = f >= 0 ? new THREE.Color(data.colors[f]) : base;
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0 }));
    m.position.x = (k - (N - 1) / 2) * GAP;
    scene.add(m);
    return { m, v, f, h: v };
  });

  let active = data.active || 0;
  window.addEventListener("deskside:focus", (e) => { active = e.detail; if (reduced) frame(0, 1); });

  const frame = (t, dt) => {
    const ease = reduced ? 1 : Math.min(1, (dt || 0) * 5);
    bars.forEach((b) => {
      // the flagged name currently highlighted in the brief stands tallest
      const target = b.f < 0 ? b.v : b.f === active ? 1 : 0.45;
      b.h += (target - b.h) * ease;
      b.m.scale.y = Math.max(0.03, b.h * H);
    });
    renderer.render(scene, camera);
  };

  const onResize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    // frame the whole row; leave the top strip for the label
    const halfW = (N * GAP + 0.8) / 2, halfH = halfW * (h / w);
    Object.assign(camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH });
    camera.position.set(-1.2, 2.4, 10);
    camera.lookAt(0, halfH * 0.8, 0);
    camera.updateProjectionMatrix();
    H = halfH * 1.1;
    frame(0, 1);
  };
  window.addEventListener("resize", onResize);
  onResize();
  runWhenVisible(host, frame);
}

if (webglOK() && window.desksideCoverage) {
  const c = document.getElementById("coverage-3d");
  if (c) {
    document.documentElement.classList.add("has-3d");
    coverageBars(c, window.desksideCoverage);
  }
}
