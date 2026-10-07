// ============================================================
// LOGIKA SEGEL TAHAN LAYAR (7 DETIK SUSPENSE)
// Menangani sentuhan di smartphone dan klik mouse di laptop
// ============================================================
const PrankManager = {
  triggerBtn: document.getElementById('seal-trigger'),
  progressCircle: document.getElementById('seal-progress'),
  percentText: document.getElementById('seal-percent'),
  labelEl: document.getElementById('seal-label'),
  counterEl: document.getElementById('prank-counter'),
  appContainer: document.getElementById('app-container'),

  // Parameter waktu tahan (7 detik = 7000ms)
  totalDuration: 7000,
  circumference: 477, // Keliling lingkaran SVG r=76 (2 * PI * 76)
  
  startTime: null,
  timerId: null,
  isCompleted: false,
  onCompleteCallback: null,

  // Kalimat usil saat jari dilepas sebelum waktu habis
  panicTeases: [
    "Duarr! Eh belum... jangan dilepas dulu dong!",
    "Duarr! Dikit lagi padahal... tahan napas, tahan layarnya!",
    "Duarr! Kok dilepas? Coba ulangi dari nol ya!",
    "Duarr! Kurang lama, jangan grogi gitu dong!"
  ],

  init(onSuccess) {
    this.onCompleteCallback = onSuccess;

    // Listener interaksi Mouse (Laptop/Desktop)
    this.triggerBtn.addEventListener('mousedown', (e) => this.startHold(e));
    window.addEventListener('mouseup', () => this.cancelHold());

    // Listener interaksi Layar Sentuh (Mobile HP)
    this.triggerBtn.addEventListener('touchstart', (e) => this.startHold(e), { passive: false });
    window.addEventListener('touchend', () => this.cancelHold());
    window.addEventListener('touchcancel', () => this.cancelHold());
  },

  startHold(e) {
    if (this.isCompleted) return;
    if (e.cancelable) e.preventDefault();

    this.startTime = Date.now();
    this.counterEl.textContent = "Tetap tahan... jangan sampai lepas...";
    this.triggerBtn.classList.add('holding-active');

    // Interval kalkulasi progres tiap 30 milidetik
    this.timerId = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const progressRatio = Math.min(elapsed / this.totalDuration, 1);
      const percent = Math.floor(progressRatio * 100);

      // Perbarui angka persen dan animasi garis lingkaran
      this.percentText.textContent = `${percent}%`;
      const offset = this.circumference - (progressRatio * this.circumference);
      this.progressCircle.style.strokeDashoffset = offset;

      // Efek visual panik: layar bergetar pelan di 40%, makin intens di 70%
      if (percent >= 70) {
        this.appContainer.classList.remove('rumble-subtle');
        this.appContainer.classList.add('rumble-intense');
        this.labelEl.textContent = "TAHAN!!";
      } else if (percent >= 40) {
        this.appContainer.classList.add('rumble-subtle');
        this.labelEl.textContent = "JANGAN LEPAS";
      }

      // Berhasil selesai 100%
      if (progressRatio >= 1) {
        this.finishHold();
      }
    }, 30);
  },

  cancelHold() {
    if (this.isCompleted || !this.timerId) return;

    clearInterval(this.timerId);
    this.timerId = null;

    // Reset getaran layar dan styling tombol
    this.appContainer.classList.remove('rumble-subtle', 'rumble-intense');
    this.triggerBtn.classList.remove('holding-active');
    this.progressCircle.style.strokeDashoffset = this.circumference;
    this.percentText.textContent = "0%";
    this.labelEl.textContent = "Tahan";

    // Pilih kalimat usil secara acak
    const randomIdx = Math.floor(Math.random() * this.panicTeases.length);
    this.counterEl.textContent = this.panicTeases[randomIdx];
  },

  finishHold() {
    this.isCompleted = true;
    clearInterval(this.timerId);
    this.timerId = null;

    this.appContainer.classList.remove('rumble-subtle', 'rumble-intense');
    this.labelEl.textContent = "TERBUKA";
    this.counterEl.textContent = "Segel berhasil dipecahkan...";

    // Ledakan confetti kecil tanda segel terbuka
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#a4161a', '#ffffff']
      });
    }

    // Pindah ke babak berikutnya setelah jeda sejenak
    setTimeout(() => {
      if (this.onCompleteCallback) this.onCompleteCallback();
    }, 700);
  }
};