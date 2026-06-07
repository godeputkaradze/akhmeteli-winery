// Interactive 3D wine/chacha bottle viewer for Akhmeteli Winery.
// Procedural bottles (LatheGeometry) with real catalogue labels, physical glass,
// and drag-to-rotate controls — the Sketchfab-style experience in plain HTML.
//
// Usage: <div class="bottle3d" data-bottle="saperavi"></div>
// Loaded as an ES module; three.js comes from the importmap on the page.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const ASSET = 'assets/3d objects/';
const viewers = [];
// Lets tooling/headless capture freeze all viewers so the page can go idle.
window.__bottlesPause = (v) => viewers.forEach((x) => x.pause(v));
window.__bottlesCapture = () => viewers.map((x) => x.capture());

// ---- Per-product configuration ------------------------------------------
const BOTTLES = {
  saperavi: {
    type: 'wine',
    glassColor: 0x16291d,      // dark olive-green glass (reads near-black, like the photo)
    liquidColor: 0x3a070f,     // deep Saperavi red
    capsuleColor: 0x141414,    // black foil capsule
    capsuleAccent: 0xd9b15c,   // gold ring
    label: ASSET + 'label_saperavi_catalogue.png',
    labelY: 7.2, labelH: 6.4, labelArc: 1.15,
  },
  chacha_classic: {
    type: 'chacha',
    glassColor: 0xeef4f3,      // clear glass
    liquidColor: 0xf4f8f7,     // clear chacha
    cork: true,
    label: ASSET + 'label_chacha_classic_catalogue.png',
    labelY: 11.5, labelH: 10.0, labelArc: 1.0,
  },
};

// ---- Bottle silhouettes (radius, height) --------------------------------
function wineProfile() {
  return [
    [0.0, 0.0], [3.9, 0.0], [4.25, 0.6], [4.3, 2.0], [4.3, 12.8],
    [4.18, 14.0], [3.4, 15.8], [2.1, 17.6], [1.55, 18.8], [1.5, 27.2],
    [1.72, 27.7], [1.8, 28.3], [1.5, 28.5], [1.42, 28.5], [0.0, 28.5],
  ];
}
function chachaProfile() {
  return [
    [0.0, 0.0], [3.5, 0.0], [3.7, 0.5], [3.72, 2.0], [3.72, 19.5],
    [3.6, 20.6], [2.4, 22.0], [1.75, 23.3], [1.7, 27.0],
    [1.9, 27.5], [1.7, 27.8], [1.4, 27.9], [0.0, 27.9],
  ];
}

function latheFromProfile(profile, segments = 96) {
  const pts = profile.map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, segments);
}

// Curved front label as a slice of a cylinder hugging the glass.
function makeLabel(texture, radius, y, height, arc) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const geo = new THREE.CylinderGeometry(
    radius, radius, height, 64, 1, true,
    -arc / 2, arc,                       // centered arc
  );
  const mat = new THREE.MeshStandardMaterial({
    map: texture, roughness: 0.55, metalness: 0.0,
    side: THREE.FrontSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = y;
  // CylinderGeometry centres theta=0 at +Z, so the arc already faces the camera.
  return mesh;
}

function buildBottle(cfg, onReady) {
  const group = new THREE.Group();
  const isWine = cfg.type === 'wine';
  const profile = isWine ? wineProfile() : chachaProfile();
  const topY = profile[profile.length - 1][1];

  // Glass — physical transmission
  const glass = new THREE.Mesh(
    latheFromProfile(profile),
    new THREE.MeshPhysicalMaterial({
      color: cfg.glassColor, metalness: 0, roughness: isWine ? 0.12 : 0.05,
      transmission: 1, thickness: isWine ? 7 : 2, ior: 1.5,
      transparent: true, envMapIntensity: 1.1,
      clearcoat: 0.3, clearcoatRoughness: 0.2,
    }),
  );
  glass.renderOrder = 2;
  group.add(glass);

  // Liquid — inner cylinder filling the lower body
  const bodyTop = isWine ? 12.0 : 18.5;
  const bodyR = isWine ? 4.0 : 3.5;
  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyR, bodyR, bodyTop, 64),
    new THREE.MeshPhysicalMaterial({
      color: cfg.liquidColor,
      roughness: 0.25, metalness: 0,
      transmission: isWine ? 0.0 : 0.94, thickness: isWine ? 4 : 1.5, ior: 1.34,
      transparent: !isWine,
    }),
  );
  liquid.position.y = bodyTop / 2 + 0.6;
  liquid.renderOrder = 1;
  group.add(liquid);

  // Cap: cork (chacha) or foil capsule (wine)
  if (cfg.cork) {
    const cork = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 1.7, 3.2, 32),
      new THREE.MeshStandardMaterial({ color: 0xc09255, roughness: 0.9, metalness: 0 }),
    );
    cork.position.y = topY + 1.2;
    group.add(cork);
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(1.78, 1.78, 0.4, 32),
      new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.6 }),
    );
    top.position.y = topY + 2.8;
    group.add(top);
  } else {
    const capH = 5.2;
    const capsule = new THREE.Mesh(
      new THREE.CylinderGeometry(1.62, 1.78, capH, 48),
      new THREE.MeshStandardMaterial({
        color: cfg.capsuleColor, roughness: 0.35, metalness: 0.6,
      }),
    );
    capsule.position.y = topY - capH / 2 + 0.3;
    group.add(capsule);
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(1.66, 1.66, 0.35, 48),
      new THREE.MeshStandardMaterial({ color: cfg.capsuleAccent, roughness: 0.3, metalness: 0.8 }),
    );
    ring.position.y = topY - capH + 0.9;
    group.add(ring);
  }

  // Label
  new THREE.TextureLoader().load(cfg.label, (tex) => {
    const labelR = (isWine ? 4.3 : 3.72) + 0.05;   // hug the OUTER glass surface
    group.add(makeLabel(tex, labelR, cfg.labelY, cfg.labelH, cfg.labelArc));
    if (onReady) onReady();
  });

  // Centre the group vertically on the origin
  group.position.y = -topY / 2;
  return group;
}

// ---- Viewer ---------------------------------------------------------------
function mountViewer(container) {
  const key = container.dataset.bottle;
  const cfg = BOTTLES[key];
  if (!cfg) { console.warn('Unknown bottle:', key); return; }

  const w = container.clientWidth, h = container.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(w, h);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 200);
  camera.position.set(0, 2, 52);

  // Lighting
  const key1 = new THREE.DirectionalLight(0xffffff, 2.2);
  key1.position.set(8, 18, 16); scene.add(key1);
  const rim = new THREE.DirectionalLight(0xffe6c0, 1.4);
  rim.position.set(-12, 8, -10); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const bottle = buildBottle(cfg, () => render());
  scene.add(bottle);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 32;
  controls.maxDistance = 75;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.82;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.1;
  controls.target.set(0, 0, 0);
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  container.classList.add('is-ready');

  // On-demand rendering: only draw while auto-rotating, settling (damping),
  // or interacting. Keeps software-GL contexts (and laptop fans) calm.
  let paused = false;
  function render() { renderer.render(scene, camera); }
  function frame() {
    requestAnimationFrame(frame);
    if (paused) return;
    if (controls.autoRotate) { controls.update(); render(); }
    else if (controls.update()) { render(); }   // returns true while damping
  }
  controls.addEventListener('change', render);
  render();      // first paint once geometry/label settle
  frame();

  // Pause hook for headless capture / off-screen tabs.
  viewers.push({
    container,
    pause(v) { paused = v; if (!v) render(); },
    capture() { paused = true; render(); return renderer.domElement.toDataURL('image/png'); },
  });
  document.addEventListener('visibilitychange', () => { paused = document.hidden; if (!paused) render(); });

  // Resize
  const ro = new ResizeObserver(() => {
    const nw = container.clientWidth, nh = container.clientHeight;
    if (!nw || !nh) return;
    camera.aspect = nw / nh; camera.updateProjectionMatrix();
    renderer.setSize(nw, nh); render();
  });
  ro.observe(container);
}

function init() {
  document.querySelectorAll('.bottle3d[data-bottle]').forEach(mountViewer);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else { init(); }
