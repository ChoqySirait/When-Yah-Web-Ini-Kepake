// ============================================================
// MASTER 3D ENGINE
// 1. ORBITCONTROLS: FLEKSIBEL 360°, TILT ATAS/BAWAH, ZOOM IN & OUT
// 2. KOTAK KADO & PUSARAN ENERGI TERSERAP SPIRAL
// 3. ALTERNATING SPLIT: GENAP KE KANAN, GANJIL KE KIRI (PROPORSIONAL)
// 4. KUE TINGKAT HAUTE PATISSERIE DENGAN AIR MANCUR KEMBANG API 3D
// ============================================================
const World3D = {
  canvas: document.getElementById('webgl-canvas'),
  renderer: null,
  scene: null,
  camera: null,
  controls: null,

  // 3D Groups
  embersGroup: new THREE.Group(),
  suctionParticlesGroup: new THREE.Group(),
  giftBoxGroup: new THREE.Group(),
  galleryGroup: new THREE.Group(),
  portalGroup: new THREE.Group(),
  cakeGroup: new THREE.Group(),
  fireworkFountainGroup: new THREE.Group(),

  // Komponen
  giftBoxLid: null,
  giftBoxBase: null,
  candleFlameMesh: null,
  candleLight: null,
  portalVortexMesh: null,
  portalLight: null,
  cardsMeshes: [],

  // Partikel Suction
  suctionCount: 350,
  suctionPositions: null,
  suctionOriginalRadii: null,

  // Partikel Kembang Api Kue
  fireworkParticles: null,
  fireworkVelocities: null,
  isFireworkActive: false,

  // State Pengendali
  activeStage: 'gift', // 'gift' | 'gallery' | 'portal' | 'cake' | 'letter'
  isAbsorbing: false,
  absorptionSpeed: 1.0,
  currentCardIndex: 0,
  isSplitActive: false,
  isDragging: false,
  pointerDownPos: { x: 0, y: 0 },

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
    this.renderer.toneMappingExposure = 1.45;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050304, 0.035);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 7.8);

    // ========================================================
    // ORBITCONTROLS RESMI: ROTASI 360°, TILT ATAS/BAWAH, ZOOM
    // ========================================================
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.minDistance = 2.5; // Zoom in sedekat mungkin
    this.controls.maxDistance = 16.0; // Zoom out sejauh mungkin
    this.controls.maxPolarAngle = Math.PI - 0.05; // Bebas lihat dari bawah
    this.controls.minPolarAngle = 0.05; // Bebas lihat dari atas langit (top-down)
    this.controls.enabled = false; // Diaktifkan saat masuk galeri & kue

    // Pencahayaan Mewah
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xffe29a, 2.2);
    goldKeyLight.position.set(6, 8, 6);
    this.scene.add(goldKeyLight);

    const wineRimLight = new THREE.DirectionalLight(0xa4161a, 2.5);
    wineRimLight.position.set(-6, -4, -4);
    this.scene.add(wineRimLight);

    // Bangun Seluruh Aset Prosedural 3D
    this.buildEmbers();
    this.buildSuctionParticles();
    this.buildRoyalGiftBox();
    this.build360CardCarousel();
    this.buildCosmicPortal();
    this.buildHautePatisserieCake();
    this.buildFireworkFountain();

    this.scene.add(this.embersGroup);
    this.scene.add(this.suctionParticlesGroup);
    this.scene.add(this.giftBoxGroup);
    this.scene.add(this.galleryGroup);
    this.scene.add(this.portalGroup);
    this.scene.add(this.cakeGroup);
    this.scene.add(this.fireworkFountainGroup);

    this.galleryGroup.visible = false;
    this.portalGroup.visible = false;
    this.cakeGroup.visible = false;

    this.setupEvents();
    this.animate();
  },

  // Generator Kanvas Tekstur Cadangan Anti-Hitam
  createProceduralCardTexture(title, index) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 700);
    grad.addColorStop(0, '#3a0208');
    grad.addColorStop(0.5, '#160408');
    grad.addColorStop(1, '#080103');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 700);

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 472, 660);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'italic 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ Memori Indah ✦', 256, 320);

    ctx.font = '24px "Courier New", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title || `Momen #${index + 1}`, 256, 380);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  },

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
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.embersGroup.add(points);
  },

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

  buildRoyalGiftBox() {
    this.giftBoxGroup.position.set(0, 0, 0);

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

    const goldRibbonMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });
    const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(1.82, 1.42, 0.28), goldRibbonMat);
    ribbon1.position.y = -0.3;
    this.giftBoxGroup.add(ribbon1);

    const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.42, 1.82), goldRibbonMat);
    ribbon2.position.y = -0.3;
    this.giftBoxGroup.add(ribbon2);

    this.giftBoxLid = new THREE.Group();
    const lidGeom = new THREE.BoxGeometry(1.95, 0.4, 1.95);
    const lidMesh = new THREE.Mesh(lidGeom, velvetMat);
    this.giftBoxLid.add(lidMesh);

    const lidRibbon1 = new THREE.Mesh(new THREE.BoxGeometry(1.97, 0.42, 0.28), goldRibbonMat);
    const lidRibbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 1.97), goldRibbonMat);
    this.giftBoxLid.add(lidRibbon1);
    this.giftBoxLid.add(lidRibbon2);

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

    const ringGeom = new THREE.TorusGeometry(2.1, 0.025, 16, 100);
    const ring = new THREE.Mesh(ringGeom, goldRibbonMat);
    ring.rotation.x = Math.PI / 3;
    ring.name = "giftOrbit";
    this.giftBoxGroup.add(ring);
  },

  build360CardCarousel() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
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
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide
      });
      const slab = new THREE.Mesh(slabGeom, slabMat);
      slab.userData.cardIndex = index;
      cardGroup.add(slab);

      const planeGeom = new THREE.PlaneGeometry(2.0, 2.7);
      const defaultTex = this.createProceduralCardTexture(item.title, index);
      const planeMat = new THREE.MeshBasicMaterial({
        map: defaultTex,
        side: THREE.DoubleSide
      });

      const loadImg = (url, fallback) => {
        textureLoader.load(
          url,
          (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.generateMipmaps = true;
            planeMat.map = tex;
            planeMat.needsUpdate = true;
          },
          undefined,
          () => {
            if (fallback) loadImg(fallback, null);
          }
        );
      };
      loadImg(item.image, item.fallbackImage);

      const plane = new THREE.Mesh(planeGeom, planeMat);
      plane.position.z = 0.045;
      plane.userData.cardIndex = index;
      cardGroup.add(plane);

      const borderGeom = new THREE.EdgesGeometry(slabGeom);
      const borderMat = new THREE.LineBasicMaterial({ color: 0xd4af37, opacity: 0.65, transparent: true });
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
        cardIndex: index,
        data: item,
        originalPos: cardGroup.position.clone(),
        originalRot: cardGroup.rotation.clone()
      };

      this.cardsMeshes.push(cardGroup);
      this.galleryGroup.add(cardGroup);
    });

    this.galleryGroup.add(this.portalGroup);
  },

  buildCosmicPortal() {
    this.portalGroup.position.set(0, 0, -4.8);

    const outerRingGeom = new THREE.TorusGeometry(1.6, 0.05, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1 });
    const outerRing = new THREE.Mesh(outerRingGeom, ringMat);
    this.portalGroup.add(outerRing);

    const innerRingGeom = new THREE.TorusGeometry(1.35, 0.035, 16, 100);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xa4161a, metalness: 0.9, roughness: 0.2 });
    const innerRing = new THREE.Mesh(innerRingGeom, innerMat);
    innerRing.name = "portalInnerRing";
    this.portalGroup.add(innerRing);

    const vortexGeom = new THREE.CircleGeometry(1.3, 48);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x800e13,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    this.portalVortexMesh = new THREE.Mesh(vortexGeom, vortexMat);
    this.portalGroup.add(this.portalVortexMesh);

    this.portalLight = new THREE.PointLight(0xd4af37, 2.5, 9);
    this.portalGroup.add(this.portalLight);
  },

  buildHautePatisserieCake() {
    this.cakeGroup.position.set(0, -0.65, 0);

    const platterBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.65, 2.75, 0.12, 64),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.12 })
    );
    platterBase.position.y = -1.0;
    this.cakeGroup.add(platterBase);

    const platterRim = new THREE.Mesh(
      new THREE.TorusGeometry(2.72, 0.05, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.98, roughness: 0.1 })
    );
    platterRim.rotation.x = Math.PI / 2;
    platterRim.position.y = -0.94;
    this.cakeGroup.add(platterRim);

    // Tingkat Bawah (Beludru Merah)
    const tier1 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.1, 1.1, 64),
      new THREE.MeshStandardMaterial({
        color: 0x48030b,
        roughness: 0.65,
        metalness: 0.2,
        emissive: 0x220105,
        emissiveIntensity: 0.2
      })
    );
    tier1.position.y = -0.42;
    this.cakeGroup.add(tier1);

    // 36 Mutiara Emas Mengelilingi Tingkat Bawah
    const pearlGeom = new THREE.SphereGeometry(0.065, 16, 16);
    const pearlMat = new THREE.MeshStandardMaterial({ color: 0xffe066, metalness: 0.95, roughness: 0.15 });
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const pearl = new THREE.Mesh(pearlGeom, pearlMat);
      pearl.position.set(Math.cos(angle) * 2.14, -0.92, Math.sin(angle) * 2.14);
      this.cakeGroup.add(pearl);
    }

    const ribbon1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.12, 0.04, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 })
    );
    ribbon1.rotation.x = Math.PI / 2;
    ribbon1.position.y = 0.12;
    this.cakeGroup.add(ribbon1);

    // Tingkat Atas (Ganache Cokelat Belgia)
    const tier2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.35, 0.95, 64),
      new THREE.MeshStandardMaterial({
        color: 0x180509,
        roughness: 0.25,
        metalness: 0.4,
        emissive: 0x100205,
        emissiveIntensity: 0.25
      })
    );
    tier2.position.y = 0.58;
    this.cakeGroup.add(tier2);

    // 20 Buah Ceri Emas di Tingkat Atas
    const cherryGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const cherryMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const cherry = new THREE.Mesh(cherryGeom, cherryMat);
      cherry.position.set(Math.cos(angle) * 1.36, 1.06, Math.sin(angle) * 1.36);
      this.cakeGroup.add(cherry);
    }

    // Lilin Champange
    const candleGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.8, 32);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xffeedd, metalness: 0.4, roughness: 0.2 });
    const candle = new THREE.Mesh(candleGeom, candleMat);
    candle.position.y = 1.45;
    this.cakeGroup.add(candle);

    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.1, 16),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    wick.position.y = 1.88;
    this.cakeGroup.add(wick);

    const flameGeom = new THREE.SphereGeometry(0.12, 16, 16);
    flameGeom.scale(0.8, 2.0, 0.8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.95 });
    this.candleFlameMesh = new THREE.Mesh(flameGeom, flameMat);
    this.candleFlameMesh.position.y = 2.02;
    this.candleFlameMesh.visible = false;
    this.cakeGroup.add(this.candleFlameMesh);

    this.candleLight = new THREE.PointLight(0xffb732, 0, 8);
    this.candleLight.position.set(0, 2.05, 0);
    this.cakeGroup.add(this.candleLight);
  },

  // 7. SISTEM AIR MANCUR KEMBANG API 3D (TIUP LILIN SPEKTAKULER)
  buildFireworkFountain() {
    const count = 400;
    const geometry = new THREE.BufferGeometry();
    this.fireworkParticles = new Float32Array(count * 3);
    this.fireworkVelocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const gold = new THREE.Color(0xffd700);
    const crimson = new THREE.Color(0xff2a4d);
    const white = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      this.fireworkParticles[i * 3] = 0;
      this.fireworkParticles[i * 3 + 1] = 1.4; // Berasal dari sumbu lilin
      this.fireworkParticles[i * 3 + 2] = 0;

      const col = Math.random() > 0.6 ? gold : (Math.random() > 0.3 ? crimson : white);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.fireworkParticles, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.fireworkFountainGroup.add(points);
  },

  launchFireworkFountain() {
    this.isFireworkActive = true;
    const count = 400;
    const points = this.fireworkFountainGroup.children[0];
    points.material.opacity = 1.0;

    for (let i = 0; i < count; i++) {
      this.fireworkParticles[i * 3] = 0;
      this.fireworkParticles[i * 3 + 1] = 1.4;
      this.fireworkParticles[i * 3 + 2] = 0;

      // Kecepatan menyembur ke atas berbentuk kubah kembang api
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.04 + Math.random() * 0.08;
      this.fireworkVelocities[i * 3] = Math.cos(angle) * speed;
      this.fireworkVelocities[i * 3 + 1] = 0.08 + Math.random() * 0.12; // Melesat ke atas
      this.fireworkVelocities[i * 3 + 2] = Math.sin(angle) * speed;
    }

    gsap.to(points.material, {
      opacity: 0,
      duration: 2.8,
      delay: 0.5,
      onComplete: () => {
        this.isFireworkActive = false;
      }
    });
  },

  // ==========================================================
  // SPLIT VIEW: GENAP KE KANAN, GANJIL KE KIRI (PROPORSIONAL)
  // ==========================================================
  activateSplitView(cardIndex) {
    this.isSplitActive = true;
    this.currentCardIndex = cardIndex;
    this.controls.enabled = false; // Kunci orbit kamera sementara saat membaca
    const isMobile = window.innerWidth < 640;

    // Reset posisi kamera tepat di depan
    gsap.to(this.camera.position, { x: 0, y: 0, z: isMobile ? 8.5 : 7.2, duration: 0.8 });
    this.controls.target.set(0, 0, 0);

    const isEven = cardIndex % 2 === 0;
    const targetX = isMobile ? 0 : (isEven ? 1.6 : -1.6);
    const targetRotY = isMobile ? 0 : (isEven ? -0.28 : 0.28);

    this.cardsMeshes.forEach((card, idx) => {
      if (idx === cardIndex) {
        gsap.to(card.position, {
          x: targetX,
          y: isMobile ? 1.3 : 0,
          z: isMobile ? 1.0 : 1.2,
          duration: 0.85,
          ease: "power3.out"
        });
        gsap.to(card.rotation, {
          x: 0,
          y: targetRotY,
          z: 0,
          duration: 0.85,
          ease: "power3.out"
        });
        gsap.to(card.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.5 });
      } else {
        gsap.to(card.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.4 });
      }
    });

    if (this.onCardFocusCallback) {
      this.onCardFocusCallback(CONFIG.memories[cardIndex], isEven);
    }
  },

  deactivateSplitView() {
    this.isSplitActive = false;
    this.controls.enabled = true; // Aktifkan kembali rotasi bebas

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
      gsap.to(card.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.5 });
    });
  },

  burstGiftBox(onComplete) {
    this.isAbsorbing = false;
    this.activeStage = 'gallery';
    this.controls.enabled = true; // Aktifkan orbit controls setelah kado meledak

    gsap.to(this.giftBoxLid.position, { y: 6, z: -2, duration: 1.0, ease: "power2.in" });
    gsap.to(this.giftBoxLid.rotation, { x: 2, y: 3, duration: 1.0 });

    gsap.to(this.giftBoxBase.scale, { x: 3, y: 3, z: 3, duration: 0.8, ease: "power2.in" });
    gsap.to(this.giftBoxGroup.position, { z: 4, duration: 1.0, ease: "power2.in", onComplete: () => {
      this.giftBoxGroup.visible = false;
      this.suctionParticlesGroup.visible = false;
      this.galleryGroup.visible = true;
      gsap.from(this.galleryGroup.position, { y: -3, z: -4, duration: 1.5, ease: "power3.out" });
      if (onComplete) onComplete();
    }});
  },

  transitionToPortal(onPortalPassed) {
    this.activeStage = 'portal';
    if (this.isSplitActive) this.deactivateSplitView();
    this.controls.enabled = false;

    // Kamera melesat menembus stargate portal
    gsap.to(this.camera.position, {
      x: 0,
      y: 0,
      z: -4.5,
      duration: 1.6,
      ease: "power3.in",
      onComplete: () => {
        this.galleryGroup.visible = false;
        this.camera.position.set(0, 0, 7.8);
        this.controls.target.set(0, 0, 0);
        this.transitionToCake();
        if (onPortalPassed) onPortalPassed();
      }
    });
  },

  transitionToCake() {
    this.activeStage = 'cake';
    this.controls.enabled = true; // Bebas putar kue 360 derajat, atas, bawah, zoom!
    this.cakeGroup.visible = true;
    gsap.from(this.cakeGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.4, ease: "back.out(1.5)" });
  },

  igniteCandle() {
    this.candleFlameMesh.visible = true;
    gsap.to(this.candleLight, { intensity: 2.4, duration: 0.8 });
    gsap.from(this.candleFlameMesh.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: "back.out(2)" });
  },

  extinguishCandle() {
    gsap.to(this.candleFlameMesh.scale, { x: 0, y: 0, z: 0, duration: 0.3, onComplete: () => {
      this.candleFlameMesh.visible = false;
    }});
    gsap.to(this.candleLight, { intensity: 0, duration: 0.4 });
    this.launchFireworkFountain(); // Semburan air mancur kembang api 3D
  },

  transitionToLetter() {
    this.activeStage = 'letter';
    this.controls.enabled = false;
    gsap.to(this.cakeGroup.position, { y: -20, duration: 1.0, onComplete: () => {
      this.cakeGroup.visible = false;
    }});
    gsap.to(this.camera.position, { x: 0, y: 0, z: 8.5, duration: 2, ease: "power2.out" });
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
    };

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) || this.pointerDownPos.x;
      const y = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) || this.pointerDownPos.y;

      // Toleransi tap klik kartu
      const dist = Math.hypot(x - this.pointerDownPos.x, y - this.pointerDownPos.y);
      if (dist < 10 && this.activeStage === 'gallery' && !this.isSplitActive) {
        this.handleRaycastPick(x, y);
      }
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    this.canvas.addEventListener('mouseup', onPointerUp);
    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    this.canvas.addEventListener('touchend', onPointerUp, { passive: true });
  },

  handleRaycastPick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cardsMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects.find(item => item.object.userData && item.object.userData.cardIndex !== undefined);
      if (hit) {
        this.activateSplitView(hit.object.userData.cardIndex);
      }
    }
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = performance.now() * 0.001;

    // Perbarui OrbitControls
    if (this.controls && this.controls.enabled) {
      this.controls.update();
    }

    this.embersGroup.rotation.y = time * 0.02;

    // Spiral Suction Energy Masuk ke Kado
    if (this.isAbsorbing && this.suctionPositions) {
      const positions = this.suctionParticlesGroup.children[0].geometry.attributes.position.array;
      const mat = this.suctionParticlesGroup.children[0].material;
      mat.opacity = Math.min(mat.opacity + 0.04, 0.95);

      for (let i = 0; i < this.suctionCount; i++) {
        let x = positions[i * 3];
        let y = positions[i * 3 + 1];
        let z = positions[i * 3 + 2];

        const speed = 0.06 * this.absorptionSpeed;
        x -= x * speed - z * 0.035;
        y -= y * speed;
        z -= z * speed + x * 0.035;

        if (Math.hypot(x, y, z) < 0.35) {
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

    if (this.activeStage === 'gift') {
      const orbit = this.giftBoxGroup.getObjectByName('giftOrbit');
      if (orbit) orbit.rotation.z += 0.015;
      this.giftBoxGroup.position.y = Math.sin(time * 2) * 0.06;
    }

    // Portal Stargate Berputar
    if (this.activeStage === 'gallery' || this.activeStage === 'portal') {
      const innerRing = this.portalGroup.getObjectByName('portalInnerRing');
      if (innerRing) innerRing.rotation.z += 0.035;
      if (this.portalVortexMesh) this.portalVortexMesh.rotation.z -= 0.05;
    }

    // Partikel Kembang Api Menembus Langit
    if (this.isFireworkActive && this.fireworkParticles) {
      const count = 400;
      for (let i = 0; i < count; i++) {
        this.fireworkParticles[i * 3] += this.fireworkVelocities[i * 3];
        this.fireworkParticles[i * 3 + 1] += this.fireworkVelocities[i * 3 + 1];
        this.fireworkParticles[i * 3 + 2] += this.fireworkVelocities[i * 3 + 2];
        this.fireworkVelocities[i * 3 + 1] -= 0.0018; // Gravitasi
      }
      this.fireworkFountainGroup.children[0].geometry.attributes.position.needsUpdate = true;
    }

    if (this.candleFlameMesh && this.candleFlameMesh.visible) {
      const flicker = Math.sin(time * 15) * 0.08 + Math.cos(time * 25) * 0.05;
      this.candleFlameMesh.scale.x = 0.8 + flicker;
      this.candleFlameMesh.scale.z = 0.8 + flicker;
      this.candleLight.intensity = 2.4 + flicker * 2;
    }

    this.renderer.render(this.scene, this.camera);
  }
};