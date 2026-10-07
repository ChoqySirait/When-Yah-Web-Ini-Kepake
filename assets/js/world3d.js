// ============================================================
// MASTER 3D ENGINE (SPLIT 3D SHOWCASE & 3D VORTEX PORTAL)
// ============================================================
const World3D = {
  canvas: document.getElementById('webgl-canvas'),
  renderer: null,
  scene: null,
  camera: null,

  // 3D Groups
  embersGroup: new THREE.Group(),
  crystalGroup: new THREE.Group(),
  galleryGroup: new THREE.Group(),
  portalGroup: new THREE.Group(),
  cakeGroup: new THREE.Group(),

  // Komponen
  candleFlameMesh: null,
  candleLight: null,
  portalVortexMesh: null,
  portalLight: null,
  cardsMeshes: [],

  // State
  activeStage: 'crystal', // 'crystal' | 'gallery' | 'portal' | 'cake' | 'letter'
  currentCardIndex: 0,
  targetGalleryAngle: 0,
  currentGalleryAngle: 0,
  isSplitActive: false,
  isDragging: false,
  pointerDownPos: { x: 0, y: 0 },
  previousPointerPos: { x: 0, y: 0 },

  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),
  onCardFocusCallback: null,

  init(onCardFocus) {
    this.onCardFocusCallback = onCardFocus;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050304, 0.04);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // Pencahayaan Sinematik
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xd4af37, 1.8);
    goldKeyLight.position.set(6, 8, 6);
    this.scene.add(goldKeyLight);

    const wineRimLight = new THREE.DirectionalLight(0xa4161a, 2.2);
    wineRimLight.position.set(-6, -4, -4);
    this.scene.add(wineRimLight);

    // Bangun Seluruh Aset Prosedural 3D
    this.buildEmbers();
    this.buildRubyHeartCrystal();
    this.buildCurvedGallery();
    this.buildCosmicPortal();
    this.buildTieredCake();

    this.scene.add(this.embersGroup);
    this.scene.add(this.crystalGroup);
    this.scene.add(this.galleryGroup);
    this.scene.add(this.portalGroup);
    this.scene.add(this.cakeGroup);

    // Default visibility
    this.galleryGroup.visible = false;
    this.portalGroup.visible = false;
    this.cakeGroup.visible = false;

    this.setupEvents();
    this.animate();
  },

  // 1. DEBU EMAS & MERAH GELAP
  buildEmbers() {
    const count = 550;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const gold = new THREE.Color(0xd4af37);
    const ruby = new THREE.Color(0xa4161a);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 26;

      const chosen = Math.random() > 0.4 ? gold : ruby;
      colors[i * 3] = chosen.r;
      colors[i * 3 + 1] = chosen.g;
      colors[i * 3 + 2] = chosen.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.embersGroup.add(points);
  },

  // 2. PERMATA RUBY MERAH DELIMA (PROLOG)
  buildRubyHeartCrystal() {
    const gemGeom = new THREE.IcosahedronGeometry(1.3, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x6a040f,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x800e13,
      emissiveIntensity: 0.5
    });
    const gem = new THREE.Mesh(gemGeom, gemMat);
    gem.name = "rubyGem";
    this.crystalGroup.add(gem);

    const ringGeom = new THREE.TorusGeometry(2.0, 0.03, 16, 100);
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

  // 3. GALERI 3D PANGGUNG MELENGKUNG (CURVED CAROUSEL)
  buildCurvedGallery() {
    const textureLoader = new THREE.TextureLoader();
    const count = CONFIG.memories.length;
    const radius = 4.8;

    CONFIG.memories.forEach((item, index) => {
      const cardGroup = new THREE.Group();

      const slabGeom = new THREE.BoxGeometry(2.2, 3.0, 0.08);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x14080d,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x220509,
        emissiveIntensity: 0.3
      });
      const slab = new THREE.Mesh(slabGeom, slabMat);
      cardGroup.add(slab);

      const planeGeom = new THREE.PlaneGeometry(2.0, 2.7);
      const texture = textureLoader.load(item.image);
      const planeMat = new THREE.MeshBasicMaterial({ map: texture });
      const plane = new THREE.Mesh(planeGeom, planeMat);
      plane.position.z = 0.045;
      cardGroup.add(plane);

      const borderGeom = new THREE.EdgesGeometry(slabGeom);
      const borderMat = new THREE.LineBasicMaterial({ color: 0xd4af37, opacity: 0.55, transparent: true });
      const borderLines = new THREE.LineSegments(borderGeom, borderMat);
      cardGroup.add(borderLines);

      const angle = (index / count) * Math.PI * 2;
      cardGroup.position.set(
        Math.sin(angle) * radius,
        0,
        Math.cos(angle) * radius - radius
      );
      cardGroup.rotation.y = angle;

      cardGroup.userData = {
        index: index,
        data: item,
        originalPos: cardGroup.position.clone(),
        originalRot: cardGroup.rotation.clone()
      };

      this.cardsMeshes.push(cardGroup);
      this.galleryGroup.add(cardGroup);
    });

    this.updateCardFocus();
  },

  // 4. PORTAL KOSMIK 3D (VORTEX STARGATE MENUJU KUE)
  buildCosmicPortal() {
    this.portalGroup.position.set(0, 0, 0);

    // Cincin Luar Emas
    const outerRingGeom = new THREE.TorusGeometry(1.9, 0.06, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1 });
    const outerRing = new THREE.Mesh(outerRingGeom, ringMat);
    this.portalGroup.add(outerRing);

    // Cincin Dalam Crimson
    const innerRingGeom = new THREE.TorusGeometry(1.65, 0.04, 16, 100);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xa4161a, metalness: 0.9, roughness: 0.2 });
    const innerRing = new THREE.Mesh(innerRingGeom, innerMat);
    innerRing.name = "portalInnerRing";
    this.portalGroup.add(innerRing);

    // Vortex Cahaya di Tengah
    const vortexGeom = new THREE.CircleGeometry(1.6, 48);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x660708,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    this.portalVortexMesh = new THREE.Mesh(vortexGeom, vortexMat);
    this.portalGroup.add(this.portalVortexMesh);

    // Cahaya Pendar Pusat Portal
    this.portalLight = new THREE.PointLight(0xd4af37, 2.5, 8);
    this.portalGroup.add(this.portalLight);
  },

  // 5. KUE TINGKAT BELUDRU 3D
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

  // ==========================================================
  // LOGIKA SPLIT 3D: KARTU DI KIRI & TEKS DI KANAN
  // ==========================================================
  activateSplitView(cardIndex) {
    this.isSplitActive = true;
    this.currentCardIndex = cardIndex;
    const isMobile = window.innerWidth < 640;

    this.cardsMeshes.forEach((card, idx) => {
      if (idx === cardIndex) {
        // Pindahkan kartu ke posisi KIRI dengan kemiringan 3D elegan
        gsap.to(card.position, {
          x: isMobile ? 0 : -1.8,
          y: isMobile ? 1.3 : 0,
          z: 2.2,
          duration: 0.8,
          ease: "power3.out"
        });
        gsap.to(card.rotation, {
          x: 0,
          y: isMobile ? 0 : 0.32, // Kemiringan 3D menghadap kanan
          z: 0,
          duration: 0.8,
          ease: "power3.out"
        });
        gsap.to(card.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.5 });
      } else {
        // Redupkan dan sembunyikan kartu lainnya
        gsap.to(card.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.4 });
      }
    });

    if (this.onCardFocusCallback) {
      this.onCardFocusCallback(CONFIG.memories[cardIndex]);
    }
  },

  deactivateSplitView() {
    this.isSplitActive = false;

    this.cardsMeshes.forEach((card) => {
      // Kembalikan posisi awal kartu dalam lingkaran carousel
      gsap.to(card.position, {
        x: card.userData.originalPos.x,
        y: card.userData.originalPos.y,
        z: card.userData.originalPos.z,
        duration: 0.8,
        ease: "power3.out"
      });
      gsap.to(card.rotation, {
        x: card.userData.originalRot.x,
        y: card.userData.originalRot.y,
        z: card.userData.originalRot.z,
        duration: 0.8,
        ease: "power3.out"
      });
    });

    this.updateCardFocus();
  },

  // NAVIGASI KARTU NORMAL
  nextCard() {
    if (this.isSplitActive) return;
    this.currentCardIndex = (this.currentCardIndex + 1) % CONFIG.memories.length;
    this.rotateToCurrentCard();
  },

  prevCard() {
    if (this.isSplitActive) return;
    this.currentCardIndex = (this.currentCardIndex - 1 + CONFIG.memories.length) % CONFIG.memories.length;
    this.rotateToCurrentCard();
  },

  rotateToCurrentCard() {
    const count = CONFIG.memories.length;
    this.targetGalleryAngle = -(this.currentCardIndex / count) * Math.PI * 2;
    this.updateCardFocus();
  },

  updateCardFocus() {
    this.cardsMeshes.forEach((card, idx) => {
      const isFocused = idx === this.currentCardIndex;
      gsap.to(card.scale, {
        x: isFocused ? 1.08 : 0.88,
        y: isFocused ? 1.08 : 0.88,
        z: isFocused ? 1.08 : 0.88,
        duration: 0.4
      });
    });
  },

  getCurrentCardData() {
    return CONFIG.memories[this.currentCardIndex];
  },

  // TRANSISI BABAK
  transitionToGallery() {
    this.activeStage = 'gallery';
    gsap.to(this.crystalGroup.scale, { x: 3.5, y: 3.5, z: 3.5, duration: 1.2, ease: "power2.in" });
    gsap.to(this.crystalGroup.position, { z: 4, duration: 1.2, ease: "power2.in", onComplete: () => {
      this.crystalGroup.visible = false;
      this.galleryGroup.visible = true;
      gsap.from(this.galleryGroup.position, { y: -3, z: -4, duration: 1.5, ease: "power3.out" });
    }});
  },

  // TRANSISI PORTAL: MUNCULKAN PORTAL & WARP CAMERA MENEMBUS RUANG
  transitionToPortal(onPortalPassed) {
    this.activeStage = 'portal';
    if (this.isSplitActive) this.deactivateSplitView();

    // Sembunyikan galeri dengan cepat
    gsap.to(this.galleryGroup.position, { y: -10, duration: 0.8, onComplete: () => {
      this.galleryGroup.visible = false;
    }});

    // Munculkan portal 3D berputar di tengah layar
    this.portalGroup.visible = true;
    gsap.from(this.portalGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.2, ease: "back.out(1.7)" });

    // Efek Warp: Kamera melesat menembus pusat portal setelah 1.5 detik
    setTimeout(() => {
      gsap.to(this.camera.position, {
        z: 0,
        duration: 1.4,
        ease: "power3.in",
        onComplete: () => {
          this.portalGroup.visible = false;
          this.camera.position.set(0, 0, 7.5); // Reset kamera ke posisi depan kue
          this.transitionToCake();
          if (onPortalPassed) onPortalPassed();
        }
      });
    }, 1400);
  },

  transitionToCake() {
    this.activeStage = 'cake';
    this.cakeGroup.visible = true;
    gsap.from(this.cakeGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.4, ease: "back.out(1.5)" });
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
    gsap.to(this.cakeGroup.position, { y: -20, duration: 1.0, onComplete: () => {
      this.cakeGroup.visible = false;
    }});
    gsap.to(this.camera.position, { z: 8, duration: 2, ease: "power2.out" });
  },

  setupEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const onPointerDown = (e) => {
      this.isDragging = true;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      this.pointerDownPos = { x, y };
      this.previousPointerPos = { x, y };
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || this.isSplitActive) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = x - this.previousPointerPos.x;

      if (this.activeStage === 'gallery') {
        this.targetGalleryAngle += deltaX * 0.005;
      } else if (this.activeStage === 'cake') {
        this.cakeGroup.rotation.y += deltaX * 0.008;
      }

      this.previousPointerPos = { x, y };
    };

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) || this.previousPointerPos.x;
      const y = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) || this.previousPointerPos.y;

      const dist = Math.hypot(x - this.pointerDownPos.x, y - this.pointerDownPos.y);
      if (dist < 10 && this.activeStage === 'gallery' && !this.isSplitActive) {
        this.handleRaycastPick(x, y);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
  },

  handleRaycastPick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cardsMeshes, true);

    if (intersects.length > 0) {
      let root = intersects[0].object;
      while (root.parent && root.userData.index === undefined) {
        root = root.parent;
      }
      if (root.userData && root.userData.index !== undefined) {
        this.activateSplitView(root.userData.index);
      }
    }
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

    if (this.activeStage === 'gallery' && !this.isSplitActive) {
      this.currentGalleryAngle += (this.targetGalleryAngle - this.currentGalleryAngle) * 0.08;
      this.galleryGroup.rotation.y = this.currentGalleryAngle;

      this.cardsMeshes.forEach((card, idx) => {
        card.position.y = Math.sin(time * 2 + idx) * 0.06;
      });
    }

    // Putaran Cepat & Bergelombang Portal 3D
    if (this.activeStage === 'portal' || this.portalGroup.visible) {
      const innerRing = this.portalGroup.getObjectByName('portalInnerRing');
      if (innerRing) innerRing.rotation.z += 0.04;
      if (this.portalVortexMesh) this.portalVortexMesh.rotation.z -= 0.06;
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