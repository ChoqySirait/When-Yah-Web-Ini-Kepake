// ============================================================
// ORKESTRATOR UTAMA FLOW HALAMAN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  AudioManager.init();
  GalleryManager.init();

  const secPrank = document.getElementById('sec-prank');
  const secGallery = document.getElementById('sec-gallery');
  const secCake = document.getElementById('sec-cake');
  const secLetter = document.getElementById('sec-letter');

  const toCakeBtn = document.getElementById('to-cake-btn');
  const toLetterBtn = document.getElementById('to-letter-btn');

  // BABAK 1: Menyalakan penahanan segel 7 detik
  PrankManager.init(() => {
    AudioManager.play();
    secPrank.classList.add('hidden');
    secGallery.classList.remove('hidden');
    secGallery.classList.add('flex');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // BABAK 2: Pindah dari Galeri ke Kue
  toCakeBtn.addEventListener('click', () => {
    secGallery.classList.add('hidden');
    secCake.classList.remove('hidden');
    secCake.classList.add('flex');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // BABAK 3: Menginisialisasi kue interaktif
  CakeManager.init(() => {
    // Dipanggil saat lilin padam
  });

  // BABAK 4: Membuka surat utama
  toLetterBtn.addEventListener('click', () => {
    secCake.classList.add('hidden');
    secLetter.classList.remove('hidden');
    secLetter.classList.add('flex');
    renderLetter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function renderLetter() {
    document.getElementById('letter-salutation').textContent = CONFIG.letter.salutation;
    const bodyEl = document.getElementById('letter-body');
    bodyEl.innerHTML = '';
    CONFIG.letter.body.forEach(paragraph => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      bodyEl.appendChild(p);
    });
    document.getElementById('letter-signature').textContent = CONFIG.letter.signature;
    document.getElementById('letter-date').textContent = CONFIG.letter.date;
  }
});