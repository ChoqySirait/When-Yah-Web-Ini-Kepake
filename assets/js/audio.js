// ============================================================
// AUDIO CONTROLLER ENGINE
// ============================================================
const AudioManager = {
  audioEl: document.getElementById('bg-audio'),
  pill: document.getElementById('audio-pill'),
  titleEl: document.getElementById('audio-title'),
  toggleBtn: document.getElementById('toggle-audio'),
  isPlaying: false,

  init() {
    this.audioEl.src = CONFIG.audioUrl;
    this.titleEl.textContent = CONFIG.audioTitle;

    this.toggleBtn.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    });
  },

  play() {
    this.audioEl.play().then(() => {
      this.isPlaying = true;
      this.pill.classList.remove('hidden');
      this.pill.classList.add('flex');
      this.toggleBtn.textContent = '⏸';
    }).catch(err => console.warn("Autoplay dicegah browser:", err));
  },

  pause() {
    this.audioEl.pause();
    this.isPlaying = false;
    this.toggleBtn.textContent = '▶';
  }
};