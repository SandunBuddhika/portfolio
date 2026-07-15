/**
 * three-scene.js — Volumetric Colorful Particle Nebula & twining Highlight Stars background
 * Sandun Rathnayake Portfolio
 */

(function () {
  "use strict";

  // ── Global Settings for Control Panel ────────────────────
  window.__nebulaSettings = {
    // Nebula Clouds
    rotationSpeed: 0.015, // Base rotation on Y-axis
    swirlSpeed: 0.03, // Vortex spiral speed factor
    turbulenceSpeed: 0.2, // Breathing wave speed
    turbulenceStrength: 1.5, // Breathing wave amplitude
    mouseParallax: 7.5, // Parallax shift intensity
    scrollPull: 0.04, // Distance shift per scrolled pixel

    // Twinkling Stars
    starRotationSpeed: 0.008, // Base star-field rotation on Y-axis
    twinkleSpeed: 2.2, // Speed of twinkling/blinking
    driftSpeed: 0.08, // Speed of minor drifting path
    starParallax: 2.5, // Parallax shift for stars
  };

  // ── Scene Setup ──────────────────────────────────────────
  const canvas = document.getElementById("three-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const isLightTheme = document.body.getAttribute("data-theme") === "light";
  const initialBgColor = isLightTheme ? "#f5f4f0" : "#080808";

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false, // Opaque renderer is highly performant and supports beautiful full background fluid rendering
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(initialBgColor, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 80;

  // ── Post Processing & Fluid Setup ────────────────────────
  let fluidEffect = null;
  if (window.MouseFluidEffect) {
    fluidEffect = new window.MouseFluidEffect(renderer, scene, camera);
    if (isLightTheme) {
      fluidEffect.setLiquidColor("#000000"); // set darker liquid tint for light mode
    }
  }

  // ── Resize Handler ───────────────────────────────────────
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (fluidEffect) {
      fluidEffect.resize();
    }
  }
  onResize();
  window.addEventListener("resize", onResize);

  // ── Volumetric Colorful Nebula Cloud Particles ────────────────
  const NEBULA_COUNT = 18000;
  const positions = new Float32Array(NEBULA_COUNT * 3);
  const colors = new Float32Array(NEBULA_COUNT * 3);
  const sizes = new Float32Array(NEBULA_COUNT);
  const alphas = new Float32Array(NEBULA_COUNT);

  // Define 10 color centers distributed all around the 3D space
  const centers = [
    { pos: new THREE.Vector3(30, 10, -10), color: new THREE.Color("#ff00aa") }, // Hot Magenta
    { pos: new THREE.Vector3(-35, -5, 5), color: new THREE.Color("#00f0ff") }, // Stellar Cyan
    { pos: new THREE.Vector3(5, -25, -20), color: new THREE.Color("#ffaa00") }, // Glowing Gold
    { pos: new THREE.Vector3(-10, 20, -15), color: new THREE.Color("#8a00ff") }, // Cosmic Purple
    { pos: new THREE.Vector3(45, -30, -5), color: new THREE.Color("#ff003c") }, // Crimson Red
    { pos: new THREE.Vector3(-45, 30, -25), color: new THREE.Color("#00ff66") }, // Emerald Green
    { pos: new THREE.Vector3(-15, -45, 20), color: new THREE.Color("#ff5a00") }, // Vivid Orange
    { pos: new THREE.Vector3(25, 35, -30), color: new THREE.Color("#003cff") }, // Deep Cobalt Blue
    { pos: new THREE.Vector3(0, 5, 30), color: new THREE.Color("#4b00ff") }, // Electric Indigo
    {
      pos: new THREE.Vector3(-55, -15, -35),
      color: new THREE.Color("#00ffd8"),
    }, // Neon Teal
  ];

  for (let i = 0; i < NEBULA_COUNT; i++) {
    const centerIdx = i % centers.length;
    const center = centers[centerIdx];

    // Radial distribution with exponential decay
    const distFactor = Math.pow(Math.random(), 2.2);
    const radius = distFactor * 54;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const offsetX = radius * Math.sin(phi) * Math.cos(theta);
    const offsetY = radius * Math.sin(phi) * Math.sin(theta);
    const offsetZ = radius * Math.cos(phi);

    positions[i * 3] = center.pos.x + offsetX;
    positions[i * 3 + 1] = center.pos.y + offsetY;
    positions[i * 3 + 2] = center.pos.z + offsetZ;

    // Colorful variations
    const mixedColor = center.color.clone();
    if (Math.random() > 0.6) {
      const blendCenter = centers[(centerIdx + 1) % centers.length];
      mixedColor.lerp(blendCenter.color, Math.random() * 0.45);
    }
    mixedColor.addScalar((Math.random() - 0.5) * 0.08);

    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;

    sizes[i] = 0.4 + Math.random() * 1.5;
    alphas[i] = 0.15 + Math.random() * 0.7;
  }

  const nebulaGeo = new THREE.BufferGeometry();
  nebulaGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  nebulaGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  nebulaGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  nebulaGeo.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

  const nebulaMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uSwirlSpeed: { value: window.__nebulaSettings.swirlSpeed },
      uTurbulenceSpeed: { value: window.__nebulaSettings.turbulenceSpeed },
      uTurbulenceStrength: {
        value: window.__nebulaSettings.turbulenceStrength,
      },
      uMouseParallax: { value: window.__nebulaSettings.mouseParallax },
      uScrollPull: { value: window.__nebulaSettings.scrollPull },
    },
    vertexShader: `
      attribute float size;
      attribute float alpha;
      attribute vec3 color;

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

        // Swirling vortex spiral motion
        float distFromCenter = length(pos.xy);
        float angle = uTime * (20.0 / (distFromCenter + 35.0)) * uSwirlSpeed;
        float cosA = cos(angle);
        float sinA = sin(angle);

        // Rotation matrix
        float rx = pos.x * cosA - pos.y * sinA;
        float ry = pos.x * sinA + pos.y * cosA;
        pos.x = rx;
        pos.y = ry;

        // Undulating cosmic dust wind
        pos.x += sin(uTime * uTurbulenceSpeed + pos.y * 0.02) * uTurbulenceStrength;
        pos.y += cos(uTime * (uTurbulenceSpeed * 1.25) + pos.x * 0.02) * uTurbulenceStrength;
        pos.z += sin(uTime * (uTurbulenceSpeed * 0.75) + pos.z * 0.015) * (uTurbulenceStrength * 0.66);

        // Mouse parallax depth shifting
        pos.x += uMouse.x * uMouseParallax;
        pos.y += uMouse.y * uMouseParallax;

        // Scroll pull
        pos.z -= uScroll * uScrollPull;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (230.0 / -mvPosition.z);
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
        strength = pow(strength, 2.5);
        gl_FragColor = vec4(vColor, vAlpha * strength * 0.85);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const nebulaClouds = new THREE.Points(nebulaGeo, nebulaMat);
  scene.add(nebulaClouds);

  // ── Highlight Twinkling Stars (Twinkling space lights) ──────
  const STAR_COUNT = 900;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  const starSizes = new Float32Array(STAR_COUNT);
  const starOffsets = new Float32Array(STAR_COUNT);
  const starColors = new Float32Array(STAR_COUNT * 3);

  const starPalette = [
    new THREE.Color("#ffffff"), // Pure white
    new THREE.Color("#aae6ff"), // Soft hot blue
    new THREE.Color("#fff0b2"), // Soft hot yellow
    new THREE.Color("#ffc1f0"), // Soft pink highlight
  ];

  for (let i = 0; i < STAR_COUNT; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 170;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 170;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 110;

    starSizes[i] = 0.5 + Math.random() * 1.5;
    starOffsets[i] = Math.random() * 100.0;

    const starColor =
      starPalette[Math.floor(Math.random() * starPalette.length)];
    starColors[i * 3] = starColor.r;
    starColors[i * 3 + 1] = starColor.g;
    starColors[i * 3 + 2] = starColor.b;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));
  starGeo.setAttribute("offset", new THREE.BufferAttribute(starOffsets, 1));
  starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTwinkleSpeed: { value: window.__nebulaSettings.twinkleSpeed },
      uStarDrift: { value: window.__nebulaSettings.driftSpeed },
      uStarParallax: { value: window.__nebulaSettings.starParallax },
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

  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // ── Highlight Warp-Speed Starfield Line Segments (Movie Speed-of-Light Effect) ──────
  const WARP_COUNT = 600;
  const warpVertexCount = WARP_COUNT * 2;
  const warpPositions = new Float32Array(warpVertexCount * 3);
  const warpColors = new Float32Array(warpVertexCount * 3);
  const warpOffsets = new Float32Array(warpVertexCount);
  const warpTypes = new Float32Array(warpVertexCount); // 0.0 = front, 1.0 = back

  const warpGeo = new THREE.BufferGeometry();
  warpGeo.setAttribute("position", new THREE.BufferAttribute(warpPositions, 3));
  warpGeo.setAttribute("color", new THREE.BufferAttribute(warpColors, 3));
  warpGeo.setAttribute("offset", new THREE.BufferAttribute(warpOffsets, 1));
  warpGeo.setAttribute("aVertexType", new THREE.BufferAttribute(warpTypes, 1));

  const warpMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScrollVelocity: { value: 0 },
      uWarpAlpha: { value: 0 },
      uStarDrift: { value: window.__nebulaSettings.driftSpeed },
      uStarParallax: { value: window.__nebulaSettings.starParallax },
    },
    vertexShader: `
      attribute float offset;
      attribute float aVertexType;
      attribute vec3 color;

      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uStarDrift;
      uniform float uStarParallax;
      uniform float uScrollVelocity;

      varying float vTwinkle;
      varying vec3 vColor;
      varying float vVertexType;

      void main() {
        vColor = color;
        vVertexType = aVertexType;
        vec3 pos = position;

        // Slow drifting movement (shared with point stars)
        pos.x += sin(uTime * uStarDrift + offset) * 0.5;
        pos.y += cos(uTime * (uStarDrift * 0.62) + offset) * 0.5;

        // Mouse parallax
        pos.x += uMouse.x * uStarParallax;
        pos.y += uMouse.y * uStarParallax;

        // SPEED-OF-LIGHT WARP STRETCH EFFECT:
        // Stretch the back vertex along the Z axis as velocity increases!
        pos.z -= uScrollVelocity * aVertexType * 75.0;

        // Star twinkle
        vTwinkle = 0.3 + (sin(uTime * 2.2 + offset) * 0.5 + 0.5) * 0.7;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vTwinkle;
      varying vec3 vColor;
      varying float vVertexType;

      uniform float uWarpAlpha;

      void main() {
        // Smoothly fade out the line towards the back (tail) of the warp streak
        float opacity = vTwinkle * (1.0 - vVertexType * 0.75) * uWarpAlpha;
        gl_FragColor = vec4(vColor, opacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const warpField = new THREE.LineSegments(warpGeo, warpMat);
  scene.add(warpField);

  // ── Mouse & Touch Trail Tracking ─────────────────────────
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  window.addEventListener("mousemove", (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      mouse.targetX = (clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(clientY / window.innerHeight - 0.5) * 2;
    }
  });

  // ── Scroll Tracking & Velocity (For Movie Speed-of-Light Stretch) ──────────────────────
  let scrollY = 0;
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let targetScrollVelocity = 0;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    scrollY = currentScrollY;

    // Calculate displacement
    const diff = Math.abs(currentScrollY - lastScrollY);

    // Accumulate velocity rather than resetting it, building inertia (momentum)
    targetScrollVelocity += diff * 0.03;
    targetScrollVelocity = Math.min(targetScrollVelocity, 5.0); // capped at 5.0 for dramatic stretch

    lastScrollY = currentScrollY;
  });

  // ── Nebula Control Panel (lil-gui) ───────────────────────
  function initNebulaGUI() {
    const GUI = window.lil?.GUI;
    if (!GUI) return;

    const gui = new GUI({ title: "Nebula Controls" });

    // Render left to Fluid and Pincushion controls
    gui.domElement.style.position = "fixed";
    gui.domElement.style.top = "80px";
    gui.domElement.style.right = "540px";
    gui.domElement.style.zIndex = "9999";

    const s = window.__nebulaSettings;

    // Nebula Cloud Settings Group
    const folderClouds = gui.addFolder("Nebula Gas");
    folderClouds.add(s, "rotationSpeed", 0.0, 0.08, 0.001).name("Spin Speed");
    folderClouds.add(s, "swirlSpeed", 0.0, 0.15, 0.005).name("Swirl Vortex");
    folderClouds
      .add(s, "turbulenceSpeed", 0.0, 1.5, 0.05)
      .name("Breathing Speed");
    folderClouds
      .add(s, "turbulenceStrength", 0.0, 5.0, 0.1)
      .name("Wave Amplitude");
    folderClouds.add(s, "mouseParallax", 0.0, 20.0, 0.5).name("Mouse Shift");
    folderClouds.add(s, "scrollPull", 0.0, 0.15, 0.005).name("Scroll Pull");

    // Twinkling Star Settings Group
    const folderStars = gui.addFolder("Stars Field");
    folderStars
      .add(s, "starRotationSpeed", 0.0, 0.05, 0.001)
      .name("Stars Spin");
    folderStars.add(s, "twinkleSpeed", 0.1, 8.0, 0.1).name("Twinkle Speed");
    folderStars.add(s, "driftSpeed", 0.0, 0.5, 0.01).name("Drift Speed");
    folderStars.add(s, "starParallax", 0.0, 10.0, 0.2).name("Stars Shift");

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

    // Smooth scroll velocity lerping with momentum preservation
    scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.06;
    targetScrollVelocity *= 0.96; // decay rate decreased from 0.88 to 0.96 (preserves stretch longer!)

    // Map velocity to warp line opacity (invisible when static, glows on scroll)
    const warpAlpha = Math.min(scrollVelocity * 0.8, 1.0);

    // Update nebula cloud uniforms
    nebulaMat.uniforms.uTime.value = elapsed;
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

    // Update warp field uniforms
    warpMat.uniforms.uTime.value = elapsed;
    warpMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
    warpMat.uniforms.uScrollVelocity.value = scrollVelocity;
    warpMat.uniforms.uWarpAlpha.value = warpAlpha;
    warpMat.uniforms.uStarDrift.value = s.driftSpeed;
    warpMat.uniforms.uStarParallax.value = s.starParallax;

    // Apply slow rotations
    nebulaClouds.rotation.y = elapsed * s.rotationSpeed;
    starField.rotation.y = elapsed * s.starRotationSpeed;
    warpField.rotation.y = elapsed * s.starRotationSpeed;

    // Camera subtle sway from mouse
    camera.position.x += (mouse.x * 4 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 4 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    // Scroll-based camera pull (removed the scrollVelocity camera push for flat, stable reading)
    camera.position.z = 80 + scrollY * 0.008;

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
    },
  };
})();
