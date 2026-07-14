/**
 * three-scene.js — Volumetric Colorful Particle Nebula & twining Highlight Stars background
 * Perfect color matching to the user's high-contrast, luminous cinematic cosmic screenshot.
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // ── Global Settings for Control Panel ────────────────────
  window.__nebulaSettings = {
    // Counts
    nebulaCount: 8500,        // Dynamic count of nebula particles
    starCount: 900,           // Dynamic count of twinkling stars

    // Nebula Clouds
    rotationSpeed: 0.015,     // Base rotation on Y-axis
    swirlSpeed: 0.035,        // Vortex spiral speed factor
    turbulenceSpeed: 0.25,    // Wave movement speed
    turbulenceStrength: 2.0,  // Traveling wave ripple intensity
    mouseParallax: 7.5,       // Parallax shift intensity
    scrollPull: 0.04,         // Distance shift per scrolled pixel

    // Twinkling Stars
    starRotationSpeed: 0.008, // Base star-field rotation on Y-axis
    twinkleSpeed: 2.2,        // Speed of twinkling/blinking
    driftSpeed: 0.08,         // Speed of minor drifting path
    starParallax: 2.5         // Parallax shift for stars
  };

  // ── Scene Setup ──────────────────────────────────────────
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isLightTheme = document.body.getAttribute('data-theme') === 'light';
  const initialBgColor = isLightTheme ? '#f5f4f0' : '#080808';

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false, // Opaque renderer is highly performant and supports beautiful full background fluid rendering
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(initialBgColor, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 75;

  // ── Colors Configuration (From Reference Screenshot) ──────
  // Deep-space, high-contrast palette: Cyans, Pinks, Magentas, Purples, and White highlights (No Yellow/Gold)
  const starPalette = [
    new THREE.Color('#ffffff'), // Pure stellar white
    new THREE.Color('#00f0ff'), // Electric cyan glow
    new THREE.Color('#ff00aa'), // Intense hot magenta
    new THREE.Color('#bb55ff')  // Cosmic violet highlight
  ];

  // ── Build Geometries (Initial allocation) ────────────────
  const nebulaGeo = new THREE.BufferGeometry();
  const starGeo = new THREE.BufferGeometry();

  // Rebuild function for Nebula Clouds (Continuous, winding, multi-planar stardust orbits)
  function rebuildNebula() {
    nebulaGeo.dispose();

    const count = window.__nebulaSettings.nebulaCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 1. Distribute particles across 4 distinct crossing/intersecting 3D filament paths
      const orbitIndex = i % 4;
      const pct = Math.random();

      // Radius extends outwards from a core (r: 6) to the outer galaxy rim (r: 52)
      const r = 6.0 + pct * 46.0;

      // Spiral winding angle (making 3.25 full loops around the center)
      const windings = 3.25;
      const angle = pct * Math.PI * 2 * windings;

      // Base 3D helical coordinates with vertical sinusoidal waving
      let x = Math.sin(angle) * r;
      let z = Math.cos(angle) * r;
      let y = Math.sin(angle * 1.5) * (r * 0.35); // vertical weaving

      // 2. Rotate each of the 4 paths to crossing, multi-planar orbits (Spline 3D style)
      let inclination = 0.0;
      let azimuth = 0.0;
      if (orbitIndex === 0) {
        inclination = 0.25; // tilted slightly around X-axis
        azimuth = 0.6;      // rotated slightly around Y-axis
      } else if (orbitIndex === 1) {
        inclination = -0.35;
        azimuth = -0.8;
      } else if (orbitIndex === 2) {
        inclination = 0.55;
        azimuth = 1.25;
      } else {
        inclination = -0.45;
        azimuth = -1.4;
      }

      // X-Axis Rotation (Inclination)
      const cosI = Math.cos(inclination);
      const sinI = Math.sin(inclination);
      const tempY = y * cosI - z * sinI;
      const tempZ = y * sinI + z * cosI;
      y = tempY; z = tempZ;

      // Y-Axis Rotation (Azimuth)
      const cosA = Math.cos(azimuth);
      const sinA = Math.sin(azimuth);
      const tempX = x * cosA - z * sinA;
      z = x * sinA + z * cosA;
      x = tempX;

      // 3. Volumetric puff/noise overlay to form 3D star streams
      const noise = 4.0 * Math.pow(Math.random(), 1.6);
      const thetaNoise = Math.random() * Math.PI * 2;
      const phiNoise = Math.acos(2 * Math.random() - 1);

      x += noise * Math.sin(phiNoise) * Math.cos(thetaNoise);
      y += noise * Math.sin(phiNoise) * Math.sin(thetaNoise);
      z += noise * Math.cos(phiNoise);

      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 4. COLOR MAPPING (Perfect match to the user's reference screenshot)
      // Highly-saturated blending: Core Luminous White -> Vibrant Magenta -> Royal Violet -> Electric Cyan (No gold/yellow)
      const colorPct = r / 52.0;
      let mixedColor;

      if (colorPct < 0.20) {
        // Glowing Stellar Core: Crisp white blending into intense hot pink
        mixedColor = new THREE.Color('#ffffff').lerp(new THREE.Color('#ff0088'), colorPct * 5.0);
      } else if (colorPct < 0.55) {
        // Mid Arms: Intense Neon Pink/Magenta transitioning to deep space Purple
        mixedColor = new THREE.Color('#ff0088').lerp(new THREE.Color('#7a00ff'), (colorPct - 0.20) * 2.85);
      } else {
        // Outer Gaseous Mist: Royal Purple blending into vivid Electric Turquoise/Cyan
        mixedColor = new THREE.Color('#7a00ff').lerp(new THREE.Color('#00f0ff'), (colorPct - 0.55) * 2.22);
      }

      // Add subtle noise for realistic dust variance
      mixedColor.addScalar((Math.random() - 0.5) * 0.04);

      colors[i * 3]     = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      // 5. Crisp, high-frequency particle parameters
      sizes[i]  = 1.5 + Math.random() * 3.5;    // Crisp stardust particle sizes (1.5-5.0)
      alphas[i] = 0.40 + Math.random() * 0.60;  // High, saturated contrast for luminous glow
      phases[i] = Math.random() * 100.0;        // Random starting wave phase
    }

    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    nebulaGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    nebulaGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    nebulaGeo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    nebulaGeo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    nebulaGeo.attributes.position.needsUpdate = true;
    nebulaGeo.attributes.color.needsUpdate = true;
    nebulaGeo.attributes.size.needsUpdate = true;
    nebulaGeo.attributes.alpha.needsUpdate = true;
    nebulaGeo.attributes.phase.needsUpdate = true;
  }

  // Rebuild function for Twinkling Stars
  function rebuildStars() {
    starGeo.dispose();

    const count = window.__nebulaSettings.starCount;
    const starPositions = new Float32Array(count * 3);
    const starSizes = new Float32Array(count);
    const starOffsets = new Float32Array(count);
    const starColors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      starPositions[i * 3]     = (Math.random() - 0.5) * 170;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 170;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 110;

      starSizes[i] = 0.5 + Math.random() * 1.5;
      starOffsets[i] = Math.random() * 100.0;

      const starColor = starPalette[Math.floor(Math.random() * starPalette.length)];
      starColors[i * 3]     = starColor.r;
      starColors[i * 3 + 1] = starColor.g;
      starColors[i * 3 + 2] = starColor.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeo.setAttribute('offset', new THREE.BufferAttribute(starOffsets, 1));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    starGeo.attributes.position.needsUpdate = true;
    starGeo.attributes.size.needsUpdate = true;
    starGeo.attributes.offset.needsUpdate = true;
    starGeo.attributes.color.needsUpdate = true;
  }

  rebuildNebula();
  rebuildStars();

  // ── Materials Setup ──────────────────────────────────────
  const nebulaMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:               { value: 0 },
      uMouse:              { value: new THREE.Vector2(0, 0) },
      uScroll:             { value: 0 },
      uSwirlSpeed:         { value: window.__nebulaSettings.swirlSpeed },
      uTurbulenceSpeed:    { value: window.__nebulaSettings.turbulenceSpeed },
      uTurbulenceStrength: { value: window.__nebulaSettings.turbulenceStrength },
      uMouseParallax:      { value: window.__nebulaSettings.mouseParallax },
      uScrollPull:         { value: window.__nebulaSettings.scrollPull }
    },
    vertexShader: `
      attribute float size;
      attribute float alpha;
      attribute vec3 color;
      attribute float phase;

      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uScroll;

      uniform float uSwirlSpeed;
      uniform float uTurbulenceSpeed;
      uniform float uTurbulenceStrength;
      uniform float uMouseParallax;
      uniform float uScrollPull;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = color;
        vAlpha = alpha;
        vec3 pos = position;

        // 1. Base Swirling Vortex Rotation
        float distFromCenter = length(pos.xy);
        float angle = uTime * (20.0 / (distFromCenter + 35.0)) * uSwirlSpeed;
        float cosA = cos(angle);
        float sinA = sin(angle);

        float rx = pos.x * cosA - pos.y * sinA;
        float ry = pos.x * sinA + pos.y * cosA;
        pos.x = rx;
        pos.y = ry;

        // 2. High-Frequency Spline-style flowing wave along curves
        float flowWave = sin(distFromCenter * 0.15 - uTime * (uTurbulenceSpeed * 10.0) + phase) * uTurbulenceStrength;
        pos.x += cos(angle) * flowWave;
        pos.y += flowWave * 0.5;
        pos.z += sin(angle) * flowWave;

        // 3. Mouse parallax depth shifting
        pos.x += uMouse.x * uMouseParallax;
        pos.y += uMouse.y * uMouseParallax;

        // 4. Scroll pull
        pos.z -= uScroll * uScrollPull;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

        // Crisp stardust size scaling factor
        gl_PointSize = size * (250.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float strength = 1.0 - (d * 2.0);

        // High-contrast stardust glow falloff (exponent of 2.2) to create glowing solid star grains
        strength = pow(strength, 2.2);

        gl_FragColor = vec4(vColor, vAlpha * strength * 0.9);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:         { value: 0 },
      uMouse:        { value: new THREE.Vector2(0, 0) },
      uTwinkleSpeed: { value: window.__nebulaSettings.twinkleSpeed },
      uStarDrift:    { value: window.__nebulaSettings.driftSpeed },
      uStarParallax: { value: window.__nebulaSettings.starParallax }
    },
    vertexShader: `
      attribute float size;
      attribute float offset;
      attribute vec3 color;

      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uTwinkleSpeed;
      uniform float uStarDrift;
      uniform float uStarParallax;

      varying float vTwinkle;
      varying vec3 vColor;

      void main() {
        vColor = color;
        vec3 pos = position;

        // Subtle drifting movement
        pos.x += sin(uTime * uStarDrift + offset) * 0.5;
        pos.y += cos(uTime * (uStarDrift * 0.62) + offset) * 0.5;
        pos.x += uMouse.x * uStarParallax;
        pos.y += uMouse.y * uStarParallax;

        // Star twinkling/blinking math
        vTwinkle = 0.2 + (sin(uTime * uTwinkleSpeed + offset) * 0.5 + 0.5) * 0.8;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (170.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vTwinkle;
      varying vec3 vColor;

      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float s = 1.0 - d * 2.0;
        gl_FragColor = vec4(vColor, s * vTwinkle * 0.8);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const nebulaClouds = new THREE.Points(nebulaGeo, nebulaMat);
  scene.add(nebulaClouds);

  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // ── Mouse & Touch Trail Tracking ─────────────────────────
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      mouse.targetX = (clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(clientY / window.innerHeight - 0.5) * 2;
    }
  });

  // ── Scroll Tracking ─────────────────────────────────────
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // ── Nebula Control Panel (lil-gui) ───────────────────────
  function initNebulaGUI() {
    const GUI = window.lil?.GUI;
    if (!GUI) return;

    const gui = new GUI({ title: 'Nebula Controls' });

    // Render left to Fluid and Pincushion controls
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '80px';
    gui.domElement.style.right = '540px';
    gui.domElement.style.zIndex = '9999';

    const s = window.__nebulaSettings;

    // Nebula Cloud Settings Group
    const folderClouds = gui.addFolder('Nebula Gas');
    folderClouds.add(s, 'nebulaCount', 500, 25000, 100).name('Gas Particles').onChange(rebuildNebula);
    folderClouds.add(s, 'rotationSpeed', 0.0, 0.08, 0.001).name('Spin Speed');
    folderClouds.add(s, 'swirlSpeed', 0.0, 0.15, 0.005).name('Swirl Vortex');
    folderClouds.add(s, 'turbulenceSpeed', 0.0, 1.5, 0.05).name('Breathing Speed');
    folderClouds.add(s, 'turbulenceStrength', 0.0, 10.0, 0.1).name('Wave Amplitude');
    folderClouds.add(s, 'mouseParallax', 0.0, 20.0, 0.5).name('Mouse Shift');
    folderClouds.add(s, 'scrollPull', 0.0, 0.15, 0.005).name('Scroll Pull');

    // Twinkling Star Settings Group
    const folderStars = gui.addFolder('Stars Field');
    folderStars.add(s, 'starCount', 50, 4000, 50).name('Stars Count').onChange(rebuildStars);
    folderStars.add(s, 'starRotationSpeed', 0.0, 0.05, 0.001).name('Stars Spin');
    folderStars.add(s, 'twinkleSpeed', 0.1, 8.0, 0.1).name('Twinkle Speed');
    folderStars.add(s, 'driftSpeed', 0.0, 0.5, 0.01).name('Drift Speed');
    folderStars.add(s, 'starParallax', 0.0, 10.0, 0.2).name('Stars Shift');

    gui.close();
  }

  // ── Animation Loop ───────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const s = window.__nebulaSettings;

    // Lerp mouse target
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Update nebula cloud uniforms
    nebulaMat.uniforms.uTime.value  = elapsed;
    nebulaMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
    nebulaMat.uniforms.uScroll.value = scrollY;
    nebulaMat.uniforms.uSwirlSpeed.value = s.swirlSpeed;
    nebulaMat.uniforms.uTurbulenceSpeed.value = s.turbulenceSpeed;
    nebulaMat.uniforms.uTurbulenceStrength.value = s.turbulenceStrength;
    nebulaMat.uniforms.uMouseParallax.value = s.mouseParallax;
    nebulaMat.uniforms.uScrollPull.value = s.scrollPull;

    // Update twinkle star uniforms
    starMat.uniforms.uTime.value = elapsed;
    starMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
    starMat.uniforms.uTwinkleSpeed.value = s.twinkleSpeed;
    starMat.uniforms.uStarDrift.value = s.driftSpeed;
    starMat.uniforms.uStarParallax.value = s.starParallax;

    // Apply slow rotations to background systems
    nebulaClouds.rotation.y = elapsed * s.rotationSpeed;
    starField.rotation.y    = elapsed * s.starRotationSpeed;

    // Camera subtle sway from mouse
    camera.position.x += (mouse.x * 4 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 4 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    // Scroll-based camera pull
    camera.position.z = 75 + scrollY * 0.008;

    // Render post-processing or fall back to standard rendering
    if (fluidEffect) {
      fluidEffect.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  // Initialize and run
  initNebulaGUI();
  animate();

  // ── Expose for theme changes ─────────────────────────────
  window.__threeScene = {
    setAccentColor(hex) {
      // Supporting accent transitions if needed in the future
    },
    setBackgroundColor(hex) {
      renderer.setClearColor(hex, 1);
    },
    setLiquidColor(hex) {
      if (fluidEffect) {
        fluidEffect.setLiquidColor(hex);
      }
    }
  };
})();
