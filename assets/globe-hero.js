import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

const canvas = document.getElementById("globeCanvas");
if (!canvas) throw new Error("globeCanvas not found");

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Renderer =====
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();

// ===== Camera =====
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 0.2, 3.2);

// ===== Resize =====
function resize() {
  const parent = canvas.parentElement;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

// ===== Lights =====
scene.add(new THREE.AmbientLight(0xffffff, 0.55));

const key = new THREE.DirectionalLight(0xffffff, 1.25);
key.position.set(4, 3, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0x66ffdd, 0.55);
rim.position.set(-5, 2, -4);
scene.add(rim);

// ===== Group (for intro animation) =====
const world = new THREE.Group();
scene.add(world);

// ===== Globe =====
const texLoader = new THREE.TextureLoader();

const earthDay = texLoader.load("/assets/earth_day.jpg");
earthDay.colorSpace = THREE.SRGBColorSpace;

let earthNight = null;
let hasNight = true;
try {
  earthNight = texLoader.load("/assets/earth_night.jpg");
  earthNight.colorSpace = THREE.SRGBColorSpace;
} catch {
  hasNight = false;
}

const globeGeo = new THREE.SphereGeometry(1, 64, 64);
const globeMat = new THREE.MeshStandardMaterial({
  map: earthDay,
  metalness: 0.25,
  roughness: 0.85,
});

const globe = new THREE.Mesh(globeGeo, globeMat);
world.add(globe);

// Atmosphere glow (فخامة)
const atmoGeo = new THREE.SphereGeometry(1.02, 64, 64);
const atmoMat = new THREE.MeshBasicMaterial({
  color: 0x9b78ff,
  transparent: true,
  opacity: 0.10,
});
const atmo = new THREE.Mesh(atmoGeo, atmoMat);
world.add(atmo);

// Night lights overlay (اختياري)
let nightMesh = null;
if (earthNight) {
  const nightMat = new THREE.MeshBasicMaterial({
    map: earthNight,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  nightMesh = new THREE.Mesh(globeGeo, nightMat);
  world.add(nightMesh);
}

// subtle grid (خطوط طول/عرض خفيفة)
const wire = new THREE.WireframeGeometry(new THREE.SphereGeometry(1.001, 24, 18));
const wireMat = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.05,
});
const wireframe = new THREE.LineSegments(wire, wireMat);
world.add(wireframe);

// ===== Cities & Routes =====
// مواقع المدن (Lat, Lon)
const cities = [
  { name: "Berlin", lat: 52.5200, lon: 13.4050, color: 0x66ffdd },
  { name: "Dubai",  lat: 25.2048, lon: 55.2708, color: 0xffc15a },
  { name: "Cairo",  lat: 30.0444, lon: 31.2357, color: 0x9b78ff },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753, color: 0xffffff },
];

// مركز “الفكرة” (ممكن تغييره حسب هويتكم)
const origin = { lat: 33.5138, lon: 36.2765 }; // مثال: دمشق/منطقة — غيّرها بحرّية

function latLonToVec3(lat, lon, radius = 1.01) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
}

function makeDot(position, color = 0xffffff) {
  const g = new THREE.SphereGeometry(0.012, 12, 12);
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.0 });
  const dot = new THREE.Mesh(g, m);
  dot.position.copy(position);
  return dot;
}

function makeArc(start, end, height = 0.35, segments = 80) {
  // منحنى (Quadratic Bezier) فوق سطح الكرة
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1 + height);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

  const points = curve.getPoints(segments);
  const geo = new THREE.BufferGeometry().setFromPoints(points);

  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
  });

  const line = new THREE.Line(geo, mat);
  return { line, points };
}

// origin dot
const originPos = latLonToVec3(origin.lat, origin.lon, 1.012);
const originDot = makeDot(originPos, 0x66ffdd);
world.add(originDot);

const cityDots = [];
const routes = [];

for (const c of cities) {
  const p = latLonToVec3(c.lat, c.lon, 1.012);
  const dot = makeDot(p, c.color);
  world.add(dot);
  cityDots.push({ dot, color: c.color });

  const arc = makeArc(originPos, p, 0.34, 90);
  world.add(arc.line);
  routes.push({ ...arc, color: c.color, progress: 0 });
}

// traveling pulses (نقطة تتحرك على الخط)
function makePulse(color) {
  const g = new THREE.SphereGeometry(0.014, 14, 14);
  const m = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
  });
  const s = new THREE.Mesh(g, m);
  return s;
}
const pulses = routes.map(r => {
  const p = makePulse(r.color);
  world.add(p);
  return { mesh: p, t: 0, speed: 0.004 + Math.random() * 0.003 };
});

// ===== Pointer interaction (luxury subtle) =====
let targetRotX = 0;
let targetRotY = 0;

canvas.addEventListener("pointermove", (ev) => {
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) / rect.width;  // 0..1
  const y = (ev.clientY - rect.top) / rect.height;  // 0..1
  targetRotY = (x - 0.5) * 0.35;
  targetRotX = (y - 0.5) * 0.22;
});

// ===== Intro timeline =====
let startTime = performance.now();
world.scale.setScalar(0.6);
world.position.y = -0.08;

// ===== Animation loop =====
function animate(now) {
  requestAnimationFrame(animate);
  const t = (now - startTime) / 1000;

  // 0–1.2s: ظهور “الفكرة” والنقاط
  const intro = Math.min(1, t / 1.2);
  const ease = intro * intro * (3 - 2 * intro);

  world.scale.setScalar(0.6 + 0.4 * ease);
  world.position.y = -0.08 + 0.08 * ease;

  // dots fade
  originDot.material.opacity = prefersReduced ? 1 : ease;
  cityDots.forEach(({ dot }) => dot.material.opacity = prefersReduced ? 1 : ease);

  // 1.2–3.0s: ظهور الخطوط
  const linesPhase = Math.min(1, Math.max(0, (t - 1.2) / 1.8));
  const linesEase = linesPhase * linesPhase * (3 - 2 * linesPhase);

  routes.forEach((r, i) => {
    // line opacity
    r.line.material.opacity = prefersReduced ? 0.55 : (0.55 * linesEase);

    // لون فخم مختلف قليلًا
    r.line.material.color.setHex(r.color);
  });

  // 3.0–6.0s: نبضات تتحرك على الخطوط
  const travelPhase = Math.min(1, Math.max(0, (t - 3.0) / 3.0));
  const travelEase = travelPhase * travelPhase * (3 - 2 * travelPhase);

  pulses.forEach((p, idx) => {
    const r = routes[idx];
    if (!r) return;

    if (prefersReduced) {
      // بدون حركة كثيفة
      p.mesh.material.opacity = 0.0;
      return;
    }

    // حركة تدريجية بعد 3 ثواني
    p.mesh.material.opacity = 0.85 * travelEase;

    p.t += p.speed;
    if (p.t > 1) p.t = 0;

    const pointIndex = Math.floor(p.t * (r.points.length - 1));
    const pos = r.points[pointIndex];
    p.mesh.position.copy(pos);

    // pulse breathing
    const s = 0.9 + 0.25 * Math.sin((t * 3) + idx);
    p.mesh.scale.setScalar(s);
  });

  // globe rotation (slow luxury)
  const baseSpin = prefersReduced ? 0.0006 : 0.0013;
  globe.rotation.y += baseSpin;
  wireframe.rotation.y += baseSpin * 0.9;
  atmo.rotation.y += baseSpin * 0.8;
  if (nightMesh) nightMesh.rotation.y += baseSpin;

  // subtle pointer follow
  const follow = prefersReduced ? 0.02 : 0.04;
  world.rotation.y += (targetRotY - world.rotation.y) * follow;
  world.rotation.x += (targetRotX - world.rotation.x) * follow;

  renderer.render(scene, camera);
}

resize();
animate(performance.now());
