// ============================================================
// MASTER 3D ENGINE (THREE.JS + GSAP PROCEDURAL SCENE)
// ============================================================
const World3D = {
  canvas: document.getElementById('webgl-canvas'),
  renderer: null,
  scene: null,
  camera: null,
  
  // Groups untuk tiap babak
  embersGroup: new THREE.Group(),
  crystalGroup: new THREE.Group(),
  galleryGroup: new THREE.Group(),
  cakeGroup: new THREE.Group(),

  // Komponen Spesifik
  candleFlameMesh: null,
  candleLight: null,
  cardsMeshes: [],
  
  // State Interaksi
  activeStage: 'crystal', // 'crystal' | 'gallery' | 'cake' | 'letter'
  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),
  onCardClickCallback: null,

  init(onCardClick) {
    this.onCardClickCallback = onCardClick;

    // 1. Setup Renderer dengan rasio layar optimal (Ringan di HP, Tajam di Retina)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // 2. Setup Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070506, 0.05);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // 3. Pencahayaan Sinematik (Dark Romance Palette)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xd4af37, 1.2);
    dirLight.position.set(5, 8, 5);
    this.scene.add(dirLight);

    const crimsonRimLight = new THREE.DirectionalLight(0xa4161a, 1.8);
    crimsonRimLight.position.set(-6, -4, -4);
    this.scene.add(crimsonRimLight);

    // 4. Bangun Seluruh Aset Prosedural 3D
    this.buildEmbers();
    this.buildCrystalSeal();
    this.buildCascadingGallery();
    this.buildTieredCake();

    // Tambahkan groups ke scene
    this.scene.add(this.embersGroup);
    this.scene.add(this.crystalGroup);
    this.scene.add(this.galleryGroup);
    this.scene.add(this.cakeGroup);

    // Default visibility
    this.galleryGroup.visible = false;
    this.cakeGroup.visible = false;

    // 5. Daftarkan Event Listener
    this.setupEvents();

    // 6. Jalankan Render Loop 60 FPS
    this.animate();
  },

  // ----------------------------------------------------------
  // ASET 1: RIBUAN DEBU EMAS & CRIMSOM (3D EMBERS)
  // ----------------------------------------------------------
  buildEmbers() {
    const count = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const gold = new THREE.Color(0xd4af37);
    const crimson = new THREE.Color(0xa4161a);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;

      const mixedColor = Math.random() > 0.4 ? gold : crimson;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.embersGroup.add(points);
  },

  // ----------------------------------------------------------
  // ASET 2: PRISMA SEGEL OBSIDIAN 3D (PROLOG)
  // ----------------------------------------------------------
  buildCrystalSeal() {
    // Inti Kristal Dodecahedron
    const geom = new THREE.DodecahedronGeometry(1.2, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x140508,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x660708,
      emissiveIntensity: 0.3
    });
    const crystal = new THREE.Mesh(geom, mat);
    crystal.name = "obsidianCore";
    this.crystalGroup.add(crystal);

    // Cincin Emas Mengorbit
    const ringGeom = new THREE.TorusGeometry(1.9, 0.02, 16, 100);
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

  // ----------------------------------------------------------
  // ASET 3: GALERI 3D KACA MIRING BERTINGKAT (CASCADING PLANES)
  // Sesuai referensi gambar BUCK: Miring diagonal di ruang 3D
  // ----------------------------------------------------------
  buildCascadingGallery() {
    const textureLoader = new THREE.TextureLoader();

    // Susunan miring oblique di ruang 3D
    this.galleryGroup.rotation.x = 0.25;
    this.galleryGroup.rotation.y = -0.45;
    this.galleryGroup.rotation.z = 0.15;

    CONFIG.memories.forEach((item, index) => {
      const cardGroup = new THREE.Group();

      // Bingkai Belakang Kaca Tebal (Glass Slab)
      const slabGeom = new THREE.BoxGeometry(2.1, 2.7, 0.08);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x10080b,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x220509,
        emissiveIntensity: 0.2
      });
      const slab = new THREE.Mesh(slabGeom, slabMat);
      cardGroup.add(slab);

      // Permukaan Foto Memori
      const planeGeom = new THREE.PlaneGeometry(1.9, 2.4);
      const texture = textureLoader.load(item.image);
      const planeMat = new THREE.MeshBasicMaterial({ map: texture });
      const plane = new THREE.Mesh(planeGeom, planeMat);
      plane.position.z = 0.045;
      cardGroup.add(plane);

      // List Batas Emas Tipis di Pinggiran Kartu
      const borderGeom = new THREE.EdgesGeometry(slabGeom);
      const borderMat = new THREE.LineBasicMaterial({ color: 0xd4af37, opacity: 0.4, transparent: true });
      const borderLines = new THREE.LineSegments(borderGeom, borderMat);
      cardGroup.add(borderLines);

      // Posisi Cascading / Bertumpuk Menyerong Sesuai Referensi Gambar 6
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

  // ----------------------------------------------------------
  // ASET 4: KUE BELUDRU GELAP 3D & API LILIN BERKEDIP
  // ----------------------------------------------------------
  buildTieredCake() {
    this.cakeGroup.position.set(0, -0.6, 0);

    // 1. Piring Emas Mengilap
    const trayGeom = new THREE.CylinderGeometry(2.5, 2.6, 0.12, 64);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.15
    });
    const tray = new THREE.Mesh(trayGeom, trayMat);
    tray.position.y = -1.0;
    this.cakeGroup.add(tray);

    // 2. Tingkat Kue Bawah (Dark Crimson Velvet)
    const tier1Geom = new THREE.CylinderGeometry(2.0, 2.0, 1.0, 64);
    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x38040a,
      roughness: 0.75,
      metalness: 0.15
    });
    const tier1 = new THREE.Mesh(tier1Geom, velvetMat);
    tier1.position.y = -0.45;
    this.cakeGroup.add(tier1);

    // Pita Emas Tingkat Bawah
    const ribbon1Geom = new THREE.TorusGeometry(2.02, 0.04, 16, 64);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    const ribbon1 = new THREE.Mesh(ribbon1Geom, ribbonMat);
    ribbon1.rotation.x = Math.PI / 2;
    ribbon1.position.y = -0.92;
    this.cakeGroup.add(ribbon1);

    // 3. Tingkat Kue Atas (Obsidian Dark Chocolate)
    const tier2Geom = new THREE.CylinderGeometry(1.3, 1.3, 0.9, 64);
    const chocoMat = new THREE.MeshStandardMaterial({
      color: 0x16070a,
      roughness: 0.5,
      metalness: 0.3
    });
    const tier2 = new THREE.Mesh(tier2Geom, chocoMat);
    tier2.position.y = 0.45;
    this.cakeGroup.add(tier2);

    // 4. Batang Lilin Putih Gading
    const candleGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 32);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xfffcf2, roughness: 0.3 });
    const candle = new THREE.Mesh(candleGeom, candleMat);
    candle.position.y = 1.25;
    this.cakeGroup.add(candle);

    // 5. Api Lilin Prosedural 3D
    const flameGeom = new THREE.SphereGeometry(0.12, 16, 16);
    flameGeom.scale(0.8, 1.8, 0.8);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffa200,
      transparent: true,
      opacity: 0.95
    });
    this.candleFlameMesh = new THREE.Mesh(flameGeom, flameMat);
    this.candleFlameMesh.position.y = 1.7;
    this.candleFlameMesh.visible = false; // Muncul saat tanggal terverifikasi
    this.cakeGroup.add(this.candleFlameMesh);

    // Point Light Nyata dari Api Lilin
    this.candleLight = new THREE.PointLight(0xffaa33, 0, 7);
    this.candleLight.position.set(0, 1.75, 0);
    this.cakeGroup.add(this.candleLight);
  },

  // ----------------------------------------------------------
  // LOGIKA TRANSISI SINEMATIK ANTAR BABAK (GSAP)
  // ----------------------------------------------------------
  transitionToGallery() {
    this.activeStage = 'gallery';
    
    // Zoom tembus kristal lalu hilangkan
    gsap.to(this.crystalGroup.scale, { x: 3.5, y: 3.5, z: 3.5, duration: 1.2, ease: "power2.in" });
    gsap.to(this.crystalGroup.position, { z: 4, duration: 1.2, ease: "power2.in", onComplete: () => {
      this.crystalGroup.visible = false;
      this.galleryGroup.visible = true;
      
      // Animasi kartu meluncur masuk ke layar
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
    // Kamera menjauh pelan memberi ruang bagi surat kaca
    gsap.to(this.cakeGroup.position, { y: -5, duration: 1.2, ease: "power2.in" });
    gsap.to(this.camera.position, { z: 9, duration: 2, ease: "power2.out" });
  },

  // ----------------------------------------------------------
  // INPUT GESTURE & RAYCASTING (SWIPE HP & MOUSE DESKTOP)
  // ----------------------------------------------------------
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
      if (!this.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - this.previousMousePosition.x;
      const deltaY = clientY - this.previousMousePosition.y;

      if (this.activeStage === 'gallery') {
        // Rotasi sudut oblique galeri saat di-swipe
        this.galleryGroup.rotation.y += deltaX * 0.004;
        this.galleryGroup.position.x += deltaX * 0.005;
      } else if (this.activeStage === 'cake') {
        // Putar kue 360 derajat
        this.cakeGroup.rotation.y += deltaX * 0.008;
      }

      this.previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = (e) => {
      this.isDragging = false;
    };

    // Deteksi Klik pada Kartu Kaca (Raycasting)
    const onClick = (e) => {
      if (this.activeStage !== 'gallery') return;
      const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
      const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
      if (!clientX || !clientY) return;

      this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.cardsMeshes, true);

      if (intersects.length > 0) {
        // Cari root group kartu yang diklik
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

  // ----------------------------------------------------------
  // ANIMATION LOOP (60 FPS FLUID PHYSICS)
  // ----------------------------------------------------------
  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // Embers melayang perlahan
    this.embersGroup.rotation.y = time * 0.02;

    // Animasi Prisma Awal
    if (this.activeStage === 'crystal') {
      const core = this.crystalGroup.getObjectByName('obsidianCore');
      const orbit = this.crystalGroup.getObjectByName('goldOrbit');
      if (core) {
        core.rotation.y += 0.01;
        core.rotation.x = Math.sin(time) * 0.2;
      }
      if (orbit) {
        orbit.rotation.z += 0.015;
      }
    }

    // Goyangan mengambang pelan kartu galeri
    if (this.activeStage === 'gallery' && !this.isDragging) {
      this.cardsMeshes.forEach((card, idx) => {
        card.position.y += Math.sin(time * 2 + idx) * 0.0012;
      });
    }

    // Kedipan cahaya lilin organik
    if (this.candleFlameMesh && this.candleFlameMesh.visible) {
      const flicker = Math.sin(time * 15) * 0.08 + Math.cos(time * 25) * 0.05;
      this.candleFlameMesh.scale.x = 0.8 + flicker;
      this.candleFlameMesh.scale.z = 0.8 + flicker;
      this.candleLight.intensity = 2.0 + flicker * 2;
    }

    this.renderer.render(this.scene, this.camera);
  }
};