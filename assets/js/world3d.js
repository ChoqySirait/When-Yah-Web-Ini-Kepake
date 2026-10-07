// ============================================================
// MASTER 3D ENGINE
// 1. KOTAK KADO 3D DENGAN PUSARAN ENERGI TERSERAP
// 2. KARTU 3D KE KANAN & SYAIR MELAYANG DI KIRI
// 3. PORTAL DIMENSI STARGATE
// 4. KUE TINGKAT BELUDRU 3D
// ============================================================
const World3D = {
  canvas: document.getElementById('webgl-canvas'),
  renderer: null,
  scene: null,
  camera: null,

  // 3D Groups
  embersGroup: new THREE.Group(),
  suctionParticlesGroup: new THREE.Group(),
  giftBoxGroup: new THREE.Group(),
  galleryGroup: new THREE.Group(),
  portalGroup: new THREE.Group(),
  cakeGroup: new THREE.Group(),

  // Komponen Spesifik
  giftBoxLid: null,
  giftBoxBase: null,
  candleFlameMesh: null,
  candleLight: null,
  portalVortexMesh: null,
  portalLight: null,
  cardsMeshes: [],

  // Partikel Suction
  suctionCount: 300,
  suctionPositions: null,
  suctionOriginalRadii: null,

  // State
  activeStage: 'gift', // 'gift' | 'gallery' | 'portal' | 'cake' | 'letter'
  isAbsorbing: false,
  absorptionSpeed: 1.0,
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
    this.renderer.toneMappingExposure = 1.4;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050304, 0.04);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // Pencahayaan Sinematik
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    const goldLight = new THREE.DirectionalLight(0xd4af37, 2.0);
    goldLight.position.set(6, 8, 6);
    this.scene.add(goldLight);

    const wineRimLight = new THREE.DirectionalLight(0xa4161a, 2.4);
    wineRimLight.position.set(-6, -4, -4);
    this.scene.add(wineRimLight);

    // Bangun Objek 3D
    this.buildEmbers();
    this.buildSuctionParticles();
    this.buildRoyalGiftBox();
    this.buildCurvedGallery();
    this.buildCosmicPortal();
    this.buildTieredCake();

    this.scene.add(this.embersGroup);
    this.scene.add(this.suctionParticlesGroup);
    this.scene.add(this.giftBoxGroup);
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

  // 1. DEBU EMAS & CRIMSON LATAR
  buildEmbers() {
    const count = 500;
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

  // 2. PARTIKEL ENERGI TERSERAP MASUK (CONVERGENT ENERGY SUCTION)
  buildSuctionParticles() {
    const geometry = new THREE.BufferGeometry();
    this.suctionPositions = new Float32Array(this.suctionCount * 3);
    this.suctionOriginalRadii = new Float32Array(this.suctionCount);
    const colors = new Float32Array(this.suctionCount * 3);

    const gold = new THREE.Color(0xffd700);
    const crimson = new THREE.Color(0xff2a4d);

    for (let i = 0; i < this.suctionCount; i++) {
      const radius = 3.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      this.suctionOriginalRadii[i] = radius;
      this.suctionPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      this.suctionPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      this.suctionPositions[i * 3 + 2] = radius * Math.cos(phi);

      const col = Math.random() > 0.5 ? gold : crimson;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.suctionPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.suctionParticlesGroup.add(points);
  },

  // 3. KOTAK KADO KERAJAAN 3D (ROYAL BIRTHDAY GIFT BOX)
  buildRoyalGiftBox() {
    this.giftBoxGroup.position.set(0, 0, 0);

    // Badan Kotak Kado (Crimson Velvet)
    const baseGeom = new THREE.BoxGeometry(1.8, 1.4, 1.8);
    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x5a040d,
      roughness: 0.4,
      metalness: 0.3,
      emissive: 0x400207,
      emissiveIntensity: 0.3
    });
    this.giftBoxBase = new THREE.Mesh(baseGeom, velvetMat);
    this.giftBoxBase.position.y = -0.3;
    this.giftBoxGroup.add(this.giftBoxBase);

    // Pita Emas Badan Melintang (X & Z)
    const goldRibbonMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });
    const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(1.82, 1.42, 0.28), goldRibbonMat);
    ribbon1.position.y = -0.3;
    this.giftBoxGroup.add(ribbon1);

    const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.42, 1.82), goldRibbonMat);
    ribbon2.position.y = -0.3;
    this.giftBoxGroup.add(ribbon2);

    // Tutup Kado (Lid)
    this.giftBoxLid = new THREE.Group();
    const lidGeom = new THREE.BoxGeometry(1.95, 0.4, 1.95);
    const lidMesh = new THREE.Mesh(lidGeom, velvetMat);
    this.giftBoxLid.add(lidMesh);

    // Pita Silang di Tutup Kado
    const lidRibbon1 = new THREE.Mesh(new THREE.BoxGeometry(1.97, 0.42, 0.28), goldRibbonMat);
    const lidRibbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 1.97), goldRibbonMat);
    this.giftBoxLid.add(lidRibbon1);
    this.giftBoxLid.add(lidRibbon2);

    // Simpul Pita Emas 3D (Ribbon Bow)
    const bowGeom = new THREE.TorusGeometry(0.32, 0.08, 16, 32);
    const bowLeft = new THREE.Mesh(bowGeom, goldRibbonMat);
    bowLeft.rotation.z = Math.PI / 4;
    bowLeft.position.set(-0.25, 0.35, 0);
    this.giftBoxLid.add(bowLeft);

    const bowRight = new THREE.Mesh(bowGeom, goldRibbonMat);
    bowRight.rotation.z = -Math.PI / 4;
    bowRight.position.set(0.25, 0.35, 0);
    this.giftBoxLid.add(bowRight);

    this.giftBoxLid.position.y = 0.55;
    this.giftBoxGroup.add(this.giftBoxLid);

    // Cincin Pendar Emas Mengitari Kado
    const ringGeom = new THREE.TorusGeometry(2.1, 0.025, 16, 100);
    const ring = new THREE.Mesh(ringGeom, goldRibbonMat);
    ring.rotation.x = Math.PI / 3;
    ring.name = "giftOrbit";
    this.giftBoxGroup.add(ring);
  },

  // 4. GALERI 3D PANGGUNG MELENGKUNG (TEXTURE RECTIFIED & DOUBLE SIDED)
  buildCurvedGallery() {
    const textureLoader = new THREE.TextureLoader();
    const count = CONFIG.memories.length;
    const radius = 5.0;

    CONFIG.memories.forEach((item, index) => {
      const cardGroup = new THREE.Group();

      // Bingkai Kaca Obsidian Tebal
      const slabGeom = new THREE.BoxGeometry(2.3, 3.1, 0.08);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x14080d,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x220509,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
      });
      const slab = new THREE.Mesh(slabGeom, slabMat);
      cardGroup.add(slab);

      // Permukaan Foto Memori
      const planeGeom = new THREE.PlaneGeometry(2.1, 2.8);
      const texture = textureLoader.load(item.image);
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;

      const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(planeGeom, planeMat);
      plane.position.z = 0.045;
      cardGroup.add(plane);

      // Garis Batas Emas
      const borderGeom = new THREE.EdgesGeometry(slabGeom);
      const borderMat = new THREE.LineBasicMaterial({ color: 0xd4af37, opacity: 0.6, transparent: true });
      const borderLines = new THREE.LineSegments(borderGeom, borderMat);
      cardGroup.add(borderLines);

      // Tata Letak Melengkung Carousel
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

  // 5. PORTAL KOSMIK 3D (VORTEX STARGATE)
  buildCosmicPortal() {
    this.portalGroup.position.set(0, 0, 0);

    const outerRingGeom = new THREE.TorusGeometry(1.9, 0.06, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1 });
    const outerRing = new THREE.Mesh(outerRingGeom, ringMat);
    this.portalGroup.add(outerRing);

    const innerRingGeom = new THREE.TorusGeometry(1.65, 0.04, 16, 100);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xa4161a, metalness: 0.9, roughness: 0.2 });
    const innerRing = new THREE.Mesh(innerRingGeom, innerMat);
    innerRing.name = "portalInnerRing";
    this.portalGroup.add(innerRing);

    const vortexGeom = new THREE.CircleGeometry(1.6, 48);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x660708,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    this.portalVortexMesh = new THREE.Mesh(vortexGeom, vortexMat);
    this.portalGroup.add(this.portalVortexMesh);

    this.portalLight = new THREE.PointLight(0xd4af37, 2.5, 8);
    this.portalGroup.add(this.portalLight);
  },

  // 6. KUE TINGKAT BELUDRU 3D
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
  // LOGIKA SPLIT 3D: KARTU KE KANAN & SYAIR DI KIRI
  // ==========================================================
  activateSplitView(cardIndex) {
    this.isSplitActive = true;
    this.currentCardIndex = cardIndex;
    const isMobile = window.innerWidth < 640;

    this.cardsMeshes.forEach((card, idx) => {
      if (idx === cardIndex) {
        // Pindahkan kartu ke sisi KANAN dengan kemiringan 3D anggun
        gsap.to(card.position, {
          x: isMobile ? 0 : 1.75,
          y: isMobile ? 1.2 : 0,
          z: 2.2,
          duration: 0.8,
          ease: "power3.out"
        });
        gsap.to(card.rotation, {
          x: 0,
          y: isMobile ? 0 : -0.32, // Menghadap sedikit ke kiri ke arah teks
          z: 0,
          duration: 0.8,
          ease: "power3.out"
        });
        gsap.to(card.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.5 });
      } else {
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

  // NAVIGASI KARTU
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

  // TRANSISI KOTAK KADO PECAH DENGAN BURST CAHAYA
  burstGiftBox(onComplete) {
    this.isAbsorbing = false;

    // Tutup kado terlempar ke atas
    gsap.to(this.giftBoxLid.position, { y: 6, z: -2, duration: 1.0, ease: "power2.in" });
    gsap.to(this.giftBoxLid.rotation, { x: 2, y: 3, duration: 1.0 });

    // Badan kado membesar lalu lenyap
    gsap.to(this.giftBoxBase.scale, { x: 3, y: 3, z: 3, duration: 0.8, ease: "power2.in" });
    gsap.to(this.giftBoxGroup.position, { z: 4, duration: 1.0, ease: "power2.in", onComplete: () => {
      this.giftBoxGroup.visible = false;
      this.suctionParticlesGroup.visible = false;
      this.galleryGroup.visible = true;
      gsap.from(this.galleryGroup.position, { y: -3, z: -4, duration: 1.5, ease: "power3.out" });
      if (onComplete) onComplete();
    }});
  },

  // TRANSISI PORTAL
  transitionToPortal(onPortalPassed) {
    this.activeStage = 'portal';
    if (this.isSplitActive) this.deactivateSplitView();

    gsap.to(this.galleryGroup.position, { y: -10, duration: 0.8, onComplete: () => {
      this.galleryGroup.visible = false;
    }});

    this.portalGroup.visible = true;
    gsap.from(this.portalGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.2, ease: "back.out(1.7)" });

    setTimeout(() => {
      gsap.to(this.camera.position, {
        z: 0,
        duration: 1.4,
        ease: "power3.in",
        onComplete: () => {
          this.portalGroup.visible = false;
          this.camera.position.set(0, 0, 7.5);
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

    // Animasi Pusaran Partikel Terserap ke Kado
    if (this.isAbsorbing && this.suctionPositions) {
      const positions = this.suctionParticlesGroup.children[0].geometry.attributes.position.array;
      const mat = this.suctionParticlesGroup.children[0].material;
      mat.opacity = Math.min(mat.opacity + 0.04, 0.95);

      for (let i = 0; i < this.suctionCount; i++) {
        let x = positions[i * 3];
        let y = positions[i * 3 + 1];
        let z = positions[i * 3 + 2];

        // Partikel tertarik ke pusat (0,0,0) dengan pusaran spiral
        const speed = 0.06 * this.absorptionSpeed;
        x -= x * speed - z * 0.03;
        y -= y * speed;
        z -= z * speed + x * 0.03;

        // Reset bila sudah terlalu dekat dengan kado
        if (Math.hypot(x, y, z) < 0.4) {
          const r = this.suctionOriginalRadii[i];
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
      this.suctionParticlesGroup.children[0].geometry.attributes.position.needsUpdate = true;
    }

    // Animasi Kado Mengambang & Cincin Orbit
    if (this.activeStage === 'gift') {
      const orbit = this.giftBoxGroup.getObjectByName('giftOrbit');
      if (orbit) orbit.rotation.z += 0.015;
      this.giftBoxGroup.position.y = Math.sin(time * 2) * 0.06;
    }

    // Galeri Carousel
    if (this.activeStage === 'gallery' && !this.isSplitActive) {
      this.currentGalleryAngle += (this.targetGalleryAngle - this.currentGalleryAngle) * 0.08;
      this.galleryGroup.rotation.y = this.currentGalleryAngle;

      this.cardsMeshes.forEach((card, idx) => {
        card.position.y = Math.sin(time * 2 + idx) * 0.06;
      });
    }

    // Portal Stargate
    if (this.activeStage === 'portal' || this.portalGroup.visible) {
      const innerRing = this.portalGroup.getObjectByName('portalInnerRing');
      if (innerRing) innerRing.rotation.z += 0.04;
      if (this.portalVortexMesh) this.portalVortexMesh.rotation.z -= 0.06;
    }

    // Kedipan Lilin
    if (this.candleFlameMesh && this.candleFlameMesh.visible) {
      const flicker = Math.sin(time * 15) * 0.08 + Math.cos(time * 25) * 0.05;
      this.candleFlameMesh.scale.x = 0.8 + flicker;
      this.candleFlameMesh.scale.z = 0.8 + flicker;
      this.candleLight.intensity = 2.0 + flicker * 2;
    }

    this.renderer.render(this.scene, this.camera);
  }
};