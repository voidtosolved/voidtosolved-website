/* ============================
   VOIDTOSOLVED — HERO 3D SCENE
   Three.js powered
   ============================ */

(function () {
  if (typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function setSize() {
    const W = canvas.parentElement.offsetWidth;
    const H = canvas.parentElement.offsetHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  // ── Camera ──
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 7;

  // ── Scene ──
  const scene = new THREE.Scene();

  // ── Main group (mouse rotates this) ──
  const group = new THREE.Group();
  scene.add(group);

  const blue = new THREE.Color(0x1a6bff);
  const lightBlue = new THREE.Color(0x60a5fa);

  // ── Central icosahedron ──
  const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: blue,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // ── Outer icosahedron shell ──
  const shellGeo = new THREE.IcosahedronGeometry(2.7, 1);
  const shellMat = new THREE.MeshBasicMaterial({
    color: lightBlue,
    wireframe: true,
    transparent: true,
    opacity: 0.10,
  });
  const shellMesh = new THREE.Mesh(shellGeo, shellMat);
  group.add(shellMesh);

  // ── Equatorial ring (torus) ──
  const ringGeo = new THREE.TorusGeometry(2.1, 0.008, 3, 80);
  const ringMat = new THREE.MeshBasicMaterial({
    color: blue,
    transparent: true,
    opacity: 0.45,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  group.add(ringMesh);

  // Second tilted ring
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.005, 3, 80),
    new THREE.MeshBasicMaterial({ color: lightBlue, transparent: true, opacity: 0.25 })
  );
  ring2.rotation.x = Math.PI / 4;
  ring2.rotation.z = Math.PI / 6;
  group.add(ring2);

  // ── Satellite shapes orbiting ──
  const satellites = [];
  const satData = [
    { geo: new THREE.OctahedronGeometry(0.18), r: 3.2, speed: 0.4,  tilt: 0.4,  phase: 0    },
    { geo: new THREE.TetrahedronGeometry(0.14), r: 2.9, speed: -0.6, tilt: -0.6, phase: 2.1  },
    { geo: new THREE.OctahedronGeometry(0.13), r: 3.5, speed: 0.35, tilt: 0.9,  phase: 1.0  },
    { geo: new THREE.IcosahedronGeometry(0.12, 0), r: 2.7, speed: -0.5, tilt: -0.3, phase: 3.7 },
    { geo: new THREE.TetrahedronGeometry(0.16), r: 3.8, speed: 0.55, tilt: 0.6,  phase: 5.0  },
    { geo: new THREE.OctahedronGeometry(0.10), r: 3.0, speed: -0.45, tilt: -0.8, phase: 4.2  },
  ];

  satData.forEach(s => {
    const mat = new THREE.MeshBasicMaterial({
      color: blue,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const mesh = new THREE.Mesh(s.geo, mat);
    mesh.userData = s;
    group.add(mesh);
    satellites.push(mesh);
  });

  // ── 3D particle cloud ──
  const particleCount = 220;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    // Distribute on a sphere with some scatter
    const r = 4 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const ptMat = new THREE.PointsMaterial({
    color: blue,
    size: 0.04,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(ptGeo, ptMat);
  group.add(points);

  // ── Connection lines between nearby particles ──
  // Pre-compute a few fixed connection lines for performance
  const linePositions = [];
  const ptArr = [];
  for (let i = 0; i < particleCount; i++) {
    ptArr.push(new THREE.Vector3(positions[i*3], positions[i*3+1], positions[i*3+2]));
  }
  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      if (ptArr[i].distanceTo(ptArr[j]) < 2.2) {
        linePositions.push(ptArr[i].x, ptArr[i].y, ptArr[i].z);
        linePositions.push(ptArr[j].x, ptArr[j].y, ptArr[j].z);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: blue,
    transparent: true,
    opacity: 0.10,
  });
  const lineSegs = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lineSegs);

  // ── Mouse tracking ──
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  const isTouch = window.matchMedia('(hover: none)').matches;

  if (!isTouch) {
    document.addEventListener('mousemove', e => {
      targetX =  (e.clientY / window.innerHeight - 0.5) * 0.6;
      targetY = -(e.clientX / window.innerWidth  - 0.5) * 0.9;
    }, { passive: true });
  }

  // ── Animation loop ──
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    // Smooth mouse follow for group
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;
    group.rotation.x = currentX;
    group.rotation.y = currentY + t * 0.08;

    // Core spins independently
    coreMesh.rotation.y  = t * 0.5;
    coreMesh.rotation.x  = t * 0.25;

    // Shell counter-rotates
    shellMesh.rotation.y = -t * 0.3;
    shellMesh.rotation.z =  t * 0.18;

    // Rings spin
    ringMesh.rotation.z  = t * 0.4;
    ring2.rotation.y     = t * 0.35;

    // Satellites orbit
    satellites.forEach(s => {
      const d = s.userData;
      const angle = t * d.speed + d.phase;
      s.position.set(
        d.r * Math.cos(angle),
        d.r * Math.sin(angle) * Math.sin(d.tilt),
        d.r * Math.sin(angle) * Math.cos(d.tilt) * 0.4
      );
      s.rotation.x += 0.02;
      s.rotation.y += 0.025;
    });

    // Particle cloud drifts
    points.rotation.y = t * 0.03;
    lineSegs.rotation.y = t * 0.03;

    renderer.render(scene, camera);
  }

  setSize();
  window.addEventListener('resize', setSize, { passive: true });
  animate();
})();
