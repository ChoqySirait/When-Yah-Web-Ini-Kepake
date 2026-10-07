// ============================================================
// SISTEM KUIS TANGGAL & INTERAKSI TIUP LILIN
// ============================================================
const CakeManager = {
  gatekeeper: document.getElementById('date-gatekeeper'),
  inputDate: document.getElementById('input-date'),
  verifyBtn: document.getElementById('verify-date-btn'),
  errorEl: document.getElementById('date-error'),
  cakeInteractive: document.getElementById('cake-interactive'),
  flame: document.getElementById('candle-flame'),
  wishBox: document.getElementById('wish-box'),
  blowBtn: document.getElementById('blow-candle-btn'),
  toLetterBtn: document.getElementById('to-letter-btn'),

  init(onCompleted) {
    this.verifyBtn.addEventListener('click', () => {
      const val = parseInt(this.inputDate.value.trim());
      if (val === CONFIG.birthDate) {
        this.errorEl.textContent = '';
        this.unlockCake();
      } else {
        this.errorEl.textContent = 'Masa tanggal lahir sendiri terlupa? Coba lagi ya.';
      }
    });

    this.blowBtn.addEventListener('click', () => {
      this.blowCandle();
      if (onCompleted) onCompleted();
    });
  },

  unlockCake() {
    this.gatekeeper.style.display = 'none';
    this.cakeInteractive.classList.remove('opacity-30', 'pointer-events-none');
    this.flame.classList.remove('hidden');
    this.wishBox.classList.remove('hidden');
  },

  blowCandle() {
    this.flame.classList.add('hidden');
    this.wishBox.style.display = 'none';
    this.toLetterBtn.classList.remove('hidden');

    // Semburan confetti emas dan crimson gelap
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#a4161a', '#ffffff', '#e0a96d']
      });

      setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 50,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 50,
          origin: { x: 1 }
        });
      }, 350);
    }
  }
};