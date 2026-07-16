/**
 * three-scene.js — Scene Orchestrator
 *
 * Boots the WebGL renderer, wires up mouse-fluid.js and
 * nebula-particles.js, then runs the animation loop.
 *
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // ── Global settings (shared with nebula-particles.js) ────────
  window.__nebulaSettings = {
    // Nebula Clouds
    rotationSpeed:       0.015,
    swirlSpeed:          0.03,
    turbulenceSpeed:     0.2,
    turbulenceStrength:  1.5,
    mouseParallax:       7.5,
    scrollPull:          0.04,

    // Twinkling Stars
    starRotationSpeed:   0.008,
    twinkleSpeed:        2.2,
    driftSpeed:          0.08,
    starParallax:        2.5,
  };

  // ── Canvas guard ─────────────────────────────────────────────
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isLightTheme   = document.body.getAttribute('data-theme') === 'light';
  const initialBgColor = isLightTheme ? '#f5f4f0' : '#080808';

  // ── Renderer ─────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false, // Opaque — lets fluid post-processing own the full background
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(initialBgColor, 1);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 80;

  // ── Mouse-Fluid Post-Processing (mouse-fluid.js) ─────────────
  let fluidEffect = null;
  if (window.MouseFluidEffect) {
    fluidEffect = new window.MouseFluidEffect(renderer, scene, camera);
    if (isLightTheme && fluidEffect.setLiquidColor) {
      fluidEffect.setLiquidColor('#000000');
    }
  }

  // ── Nebula Particles (nebula-particles.js) ───────────────────
  let nebula = null;
  if (window.NebulaParticles) {
    nebula = new window.NebulaParticles(scene, window.__nebulaSettings);
    // Apply correct initial theme (nebula defaults to dark)
    if (isLightTheme) nebula.setTheme(false);
  }

  // ── Resize Handler ───────────────────────────────────────────
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (fluidEffect) fluidEffect.resize();
  }
  onResize();
  window.addEventListener('resize', onResize);

  // ── Mouse Tracking ───────────────────────────────────────────
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.targetX =  (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.targetX =  (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
      mouse.targetY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  });

  // ── Scroll Tracking ──────────────────────────────────────────
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // ── Control Panel (lil-gui) ──────────────────────────────────
  function initGUI() {
    const GUI = window.lil && window.lil.GUI;
    if (!GUI) return;

    const gui = new GUI({ title: 'Nebula Controls' });
    gui.domElement.style.cssText = 'position:fixed;top:80px;right:540px;z-index:9999;';

    const s = window.__nebulaSettings;

    const clouds = gui.addFolder('Nebula Gas');
    clouds.add(s, 'rotationSpeed',      0.0, 0.08, 0.001).name('Spin Speed');
    clouds.add(s, 'swirlSpeed',         0.0, 0.15, 0.005).name('Swirl Vortex');
    clouds.add(s, 'turbulenceSpeed',    0.0, 1.5,  0.05 ).name('Breathing Speed');
    clouds.add(s, 'turbulenceStrength', 0.0, 5.0,  0.1  ).name('Wave Amplitude');
    clouds.add(s, 'mouseParallax',      0.0, 20.0, 0.5  ).name('Mouse Shift');
    clouds.add(s, 'scrollPull',         0.0, 0.15, 0.005).name('Scroll Pull');

    const stars = gui.addFolder('Stars Field');
    stars.add(s, 'starRotationSpeed', 0.0, 0.05, 0.001).name('Stars Spin');
    stars.add(s, 'twinkleSpeed',      0.1, 8.0,  0.1  ).name('Twinkle Speed');
    stars.add(s, 'driftSpeed',        0.0, 0.5,  0.01 ).name('Drift Speed');
    stars.add(s, 'starParallax',      0.0, 10.0, 0.2  ).name('Stars Shift');

    gui.close();
  }

  // ── Animation Loop ───────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth mouse
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Update nebula particles
    if (nebula) {
      nebula.update(elapsed, mouse, scrollY);
    }

    // Camera sway
    camera.position.x += (mouse.x * 4 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 4 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);
    camera.position.z = 80 + scrollY * 0.008;

    // Render (fluid post-process or plain)
    if (fluidEffect) {
      fluidEffect.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  // Boot
  initGUI();
  animate();

  // ── Public API for theme-switching ───────────────────────────
  window.__threeScene = {
    setBackgroundColor(hex) {
      renderer.setClearColor(hex, 1);
    },
    setLiquidColor(hex) {
      if (fluidEffect && fluidEffect.setLiquidColor) {
        fluidEffect.setLiquidColor(hex);
      }
    },
    setNebulaTheme(isDark) {
      if (nebula) nebula.setTheme(isDark);
    },
  };
})();
