// ============================================================
// MASTER 3D ENGINE (THREE.JS + GSAP)
// Tema: Midnight Ruby, Champagne Gold & Cascading Planes
// ============================================================
const World3D = {
  canvas: document.getElementById('webgl-canvas'),
  renderer: null,
  scene: null,
  camera: null,
  
  // Groups
  embersGroup: new THREE.Group(),
  crystalGroup: new THREE.Group(),
  galleryGroup: new THREE.Group(),
  cakeGroup: new THREE.Group(),

  // Komponen
  candleFlameMesh: null,
  candleLight: null,
  cardsMeshes: [],
  
  // State Interaksi
  activeStage: 'crystal',
  isDragging: false,
  isModalOpen: false, // Flag agar raycast tidak aktif saat modal terbuka
  previousMousePosition: { x: 0, y: 0 },
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),
  onCardClickCallback: null,

  init(onCardClick) {
    this.onCardClickCallback = onCardClick;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070506, 0.05);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // Pencahayaan
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xd4af37, 1.4);
    dirLight.position.set(5, 8, 5);
    this.scene.add(dirLight);

    const wineRimLight = new THREE.DirectionalLight(0xa4161a, 2.0);
    wineRimLight.position.set(-6, -4, -4);
    this.scene.add(wineRimLight);

    // Bangun Objek 3D
    this.buildEmbers();
    this.buildRubyHeartCrystal();
    this.buildCascadingGallery();
    this.buildTieredCake();

    this.scene.add(this.embersGroup);
    this.scene.add(this.crystalGroup);
    this.scene.add(this.galleryGroup);
    this.scene.add(this.cakeGroup);

    this.galleryGroup.visible = false;
    this.cakeGroup.visible = false;

    this.setupEvents();
    this.animate();
  },

  // 1. PARTIKEL DEBU EMAS & MERAH MAWAR
  buildEmbers() {
    const count = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const gold = new THREE.Color(0xd4af37);
    const ruby = new THREE.Color(0xa4161a);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;

      const chosen = Math.random() > 0.4 ? gold : ruby;
      colors[i * 3] = chosen.r;
      colors[i * 3 + 1] = chosen.g;
      colors[i * 3 + 2] = chosen.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.embersGroup.add(points);
  },

  // 2. PERMATA RUBY MERAH DELIMA & CINCIN EMAS (Bukan batu obsidian dingin)
  buildRubyHeartCrystal() {
    // Permata Icosahedron Merah Anggur
    const gemGeom = new THREE.IcosahedronGeometry(1.25, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x5a0914,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x800e13,
      emissiveIntensity: 0.45
    });
    const gem = new THREE.Mesh(gemGeom, gemMat);
    gem.name = "rubyGem";
    this.crystalGroup.add(gem);

    // Cincin Emas Champagne Mengorbit
    const ringGeom = new THREE.TorusGeometry(1.95, 0.025, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.1
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 3;
    ring.name = "goldOrbit";
    this.crystalGroup.add(ring);
  },

  // 3. GALERI KACA CASCADING
  buildCascadingGallery() {
    const textureLoader = new THREE.TextureLoader();

    this.galleryGroup.rotation.x = 0.25;
    this.galleryGroup.rotation.y = -0.45;
    this.galleryGroup.rotation.z = 0.15;

    CONFIG.memories.forEach((item, index) => {
      const cardGroup = new THREE.Group();

      const slabGeom = new THREE.BoxGeometry(2.1, 2.7, 0.08);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x14080c,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x220509,
        emissiveIntensity: 0.2
      });
      const slab = new THREE.Mesh(slabGeom, slabMat);
      cardGroup.add(slab);

      const planeGeom = new THREE.PlaneGeometry(1.9, 2.4);
      const texture = textureLoader.load(item.image);
      const planeMat = new THREE.MeshBasicMaterial({ map: texture });
      const plane = new THREE.Mesh(planeGeom, planeMat);
      plane.position.z = 0.045;
      cardGroup.add(plane);

      const borderGeom = new THREE.EdgesGeometry(slabGeom);
      const borderMat = new THREE.LineBasicMaterial({ color: 0xd4af37, opacity: 0.4, transparent: true });
      const borderLines = new THREE.LineSegments(borderGeom, borderMat);
      cardGroup.add(borderLines);

      const spacingX = 2.4;
      const spacingZ = -1.6;
      const spacingY = 0.7;
      cardGroup.position.set(
        (index - (CONFIG.memories.length - 1) / 2) * spacingX,
        (index % 2 === 0 ? 0.3 : -0.3) * spacingY,
        index * spacingZ
      );

      cardGroup.userData = { index: index, data: item };
      this.cardsMeshes.push(cardGroup);
      this.galleryGroup.add(cardGroup);
    });
  },

  // 4. KUE TINGKAT BELUDRU 3D
  buildTieredCake() {
    this.cakeGroup.position.set(0, -0.6, 0);

    const trayGeom = new THREE.CylinderGeometry(2.5, 2.6, 0.12, 64);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });
    const tray = new THREE.Mesh(trayGeom, trayMat);
    tray.position.y = -1.0;
    this.cakeGroup.add(tray);

    const tier1Geom = new THREE.CylinderGeometry(2.0, 2.0, 1.0, 64);
    const velvetMat = new THREE.MeshStandardMaterial({ color: 0x3d050d, roughness: 0.7, metalness: 0.2 });
    const tier1 = new THREE.Mesh(tier1Geom, velvetMat);
    tier1.position.y = -0.45;
    this.cakeGroup.add(tier1);

    const ribbon1Geom = new THREE.TorusGeometry(2.02, 0.04, 16, 64);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    const ribbon1 = new THREE.Mesh(ribbon1Geom, ribbonMat);
    ribbon1.rotation.x = Math.PI / 2;
    ribbon1.position.y = -0.92;
    this.cakeGroup.add(ribbon1);

    const tier2Geom = new THREE.CylinderGeometry(1.3, 1.3, 0.9, 64);
    const chocoMat = new THREE.MeshStandardMaterial({ color: 0x1a060a, roughness: 0.5, metalness: 0.3 });
    const tier2 = new THREE.Mesh(tier2Geom, chocoMat);
    tier2.position.y = 0.45;
    this.cakeGroup.add(tier2);

    const candleGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 32);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xfffcf2, roughness: 0.3 });
    const candle = new THREE.Mesh(candleGeom, candleMat);
    candle.position.y = 1.25;
    this.cakeGroup.add(candle);

    const flameGeom = new THREE.SphereGeometry(0.12, 16, 16);
    flameGeom.scale(0.8, 1.8, 0.8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.95 });
    this.candleFlameMesh = new THREE.Mesh(flameGeom, flameMat);
    this.candleFlameMesh.position.y = 1.7;
    this.candleFlameMesh.visible = false;
    this.cakeGroup.add(this.candleFlameMesh);

    this.candleLight = new THREE.PointLight(0xffaa33, 0, 7);
    this.candleLight.position.set(0, 1.75, 0);
    this.cakeGroup.add(this.candleLight);
  },

  // TRANSISI GSAP
  transitionToGallery() {
    this.activeStage = 'gallery';
    gsap.to(this.crystalGroup.scale, { x: 3.5, y: 3.5, z: 3.5, duration: 1.2, ease: "power2.in" });
    gsap.to(this.crystalGroup.position, { z: 4, duration: 1.2, ease: "power2.in", onComplete: () => {
      this.crystalGroup.visible = false;
      this.galleryGroup.visible = true;
      gsap.from(this.galleryGroup.position, { y: -4, z: -5, duration: 1.8, ease: "power3.out" });
    }});
  },

  transitionToCake() {
    this.activeStage = 'cake';
    gsap.to(this.galleryGroup.position, { y: 6, opacity: 0, duration: 1.2, ease: "power2.in", onComplete: () => {
      this.galleryGroup.visible = false;
      this.cakeGroup.visible = true;
      gsap.from(this.cakeGroup.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 1.4, ease: "back.out(1.5)" });
    }});
  },

  igniteCandle() {
    this.candleFlameMesh.visible = true;
    gsap.to(this.candleLight, { intensity: 2.2, duration: 0.8 });
    gsap.from(this.candleFlameMesh.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: "back.out(2)" });
  },

  extinguishCandle() {
    gsap.to(this.candleFlameMesh.scale, { x: 0, y: 0, z: 0, duration: 0.3, onComplete: () => {
      this.candleFlameMesh.visible = false;
    }});
    gsap.to(this.candleLight, { intensity: 0, duration: 0.4 });
  },

  transitionToLetter() {
    this.activeStage = 'letter';
    gsap.to(this.cakeGroup.position, { y: -5, duration: 1.2, ease: "power2.in" });
    gsap.to(this.camera.position, { z: 9, duration: 2, ease: "power2.out" });
  },

  setupEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const onPointerDown = (e) => {
      this.isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || this.isModalOpen) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - this.previousMousePosition.x;

      if (this.activeStage === 'gallery') {
        this.galleryGroup.rotation.y += deltaX * 0.004;
        this.galleryGroup.position.x += deltaX * 0.005;
      } else if (this.activeStage === 'cake') {
        this.cakeGroup.rotation.y += deltaX * 0.008;
      }

      this.previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    const onClick = (e) => {
      // Jika modal sedang terbuka, abaikan klik 3D
      if (this.activeStage !== 'gallery' || this.isModalOpen) return;
      const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
      const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
      if (!clientX || !clientY) return;

      this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.cardsMeshes, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.data) {
          obj = obj.parent;
        }
        if (obj.userData && obj.userData.data && this.onCardClickCallback) {
          this.onCardClickCallback(obj.userData.data);
        }
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('click', onClick);

    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = performance.now() * 0.001;

    this.embersGroup.rotation.y = time * 0.02;

    if (this.activeStage === 'crystal') {
      const gem = this.crystalGroup.getObjectByName('rubyGem');
      const orbit = this.crystalGroup.getObjectByName('goldOrbit');
      if (gem) {
        gem.rotation.y += 0.008;
        gem.rotation.x = Math.sin(time) * 0.2;
      }
      if (orbit) {
        orbit.rotation.z += 0.012;
      }
    }

    if (this.activeStage === 'gallery' && !this.isDragging) {
      this.cardsMeshes.forEach((card, idx) => {
        card.position.y += Math.sin(time * 2 + idx) * 0.0012;
      });
    }

    if (this.candleFlameMesh && this.candleFlameMesh.visible) {
      const flicker = Math.sin(time * 15) * 0.08 + Math.cos(time * 25) * 0.05;
      this.candleFlameMesh.scale.x = 0.8 + flicker;
      this.candleFlameMesh.scale.z = 0.8 + flicker;
      this.candleLight.intensity = 2.0 + flicker * 2;
    }

    this.renderer.render(this.scene, this.camera);
  }
};