// ============================================================
// APP ORCHESTRATOR
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  AudioManager.init();

  World3D.init((memoryData) => {
    openPoemModal(memoryData);
  });

  const chapterTag = document.getElementById('chapter-tag');
  const chapterTitle = document.getElementById('chapter-title');

  const uiSeal = document.getElementById('ui-seal');
  const uiGalleryHint = document.getElementById('ui-gallery-hint');
  const uiCakePanel = document.getElementById('ui-cake-panel');
  const uiLetterPanel = document.getElementById('ui-letter-panel');

  const sealTrigger = document.getElementById('seal-hold-btn');
  const sealProgress = document.getElementById('seal-progress');
  const sealPercent = document.getElementById('seal-percent');
  const sealLabel = document.getElementById('seal-label');
  const sealTease = document.getElementById('seal-tease');

  const btnToCake = document.getElementById('btn-to-cake');
  const cakeGate = document.getElementById('cake-gate');
  const cakeWishBox = document.getElementById('cake-wish-box');
  const inputDate = document.getElementById('input-date');
  const btnVerifyDate = document.getElementById('btn-verify-date');
  const dateError = document.getElementById('cake-date-error');
  const btnBlowCandle = document.getElementById('btn-blow-candle');
  const btnToLetter = document.getElementById('btn-to-letter');

  const poemOverlay = document.getElementById('poem-overlay');
  const poemModalBox = document.getElementById('poem-modal-box');
  const poemTitle = document.getElementById('poem-card-title');
  const poemTypewriter = document.getElementById('poem-typewriter');
  const btnClosePoem = document.getElementById('btn-close-poem');

  // BABAK 0: TAHAN TOMBOL
  const totalDuration = 7000;
  const circumference = 402;
  let holdStartTime = null;
  let holdInterval = null;
  let sealDone = false;

  const teaseMessages = [
    "Duarr! Eh belum... jangan dilepas dulu!",
    "Duarr! Dikit lagi padahal... tahan terus layarnya!",
    "Duarr! Kok dilepas? Coba ulangi dari awal ya!",
    "Duarr! Kurang sabar nih, coba tahan lebih lama!"
  ];

  function startHold(e) {
    if (sealDone) return;
    if (e.cancelable) e.preventDefault();

    holdStartTime = Date.now();
    sealTease.textContent = "Tetap tahan... jangan sampai lepas...";
    sealTrigger.classList.add('holding-seal');

    holdInterval = setInterval(() => {
      const elapsed = Date.now() - holdStartTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const percent = Math.floor(progress * 100);

      sealPercent.textContent = `${percent}%`;
      const offset = circumference - (progress * circumference);
      sealProgress.style.strokeDashoffset = offset;

      if (percent >= 70) {
        document.body.classList.remove('rumble-subtle');
        document.body.classList.add('rumble-intense');
        sealLabel.textContent = "TAHAN!!";
      } else if (percent >= 40) {
        document.body.classList.add('rumble-subtle');
        sealLabel.textContent = "JANGAN LEPAS";
      }

      const gem = World3D.crystalGroup.getObjectByName('rubyGem');
      if (gem) gem.rotation.y += 0.08;

      if (progress >= 1) {
        finishHold();
      }
    }, 30);
  }

  function cancelHold() {
    if (sealDone || !holdInterval) return;
    clearInterval(holdInterval);
    holdInterval = null;

    document.body.classList.remove('rumble-subtle', 'rumble-intense');
    sealTrigger.classList.remove('holding-seal');
    sealProgress.style.strokeDashoffset = circumference;
    sealPercent.textContent = "0%";
    sealLabel.textContent = "TEKAN";

    const randomTease = teaseMessages[Math.floor(Math.random() * teaseMessages.length)];
    sealTease.textContent = randomTease;
  }

  function finishHold() {
    sealDone = true;
    clearInterval(holdInterval);
    document.body.classList.remove('rumble-subtle', 'rumble-intense');

    sealLabel.textContent = "TERBUKA";
    sealTease.textContent = "Rahasia telah dibuka...";

    AudioManager.play();
    World3D.transitionToGallery();

    setTimeout(() => {
      uiSeal.classList.add('hidden');
      uiGalleryHint.classList.remove('hidden');
      uiGalleryHint.classList.add('flex');
      chapterTag.textContent = "Chapter I";
      chapterTitle.textContent = "Unspoken Beauty";
    }, 1100);
  }

  sealTrigger.addEventListener('mousedown', startHold);
  window.addEventListener('mouseup', cancelHold);
  sealTrigger.addEventListener('touchstart', startHold, { passive: false });
  window.addEventListener('touchend', cancelHold);

  // BABAK 1: SYAIR MODAL TYPEWRITER & CLOSE HANDLER
  let typeInterval = null;

  function openPoemModal(data) {
    World3D.isModalOpen = true;
    poemTitle.textContent = data.title;
    poemOverlay.classList.remove('hidden');
    poemOverlay.classList.add('flex');

    clearInterval(typeInterval);
    poemTypewriter.textContent = '';
    let i = 0;
    typeInterval = setInterval(() => {
      if (i < data.poem.length) {
        poemTypewriter.textContent += data.poem.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 45);
  }

  function closePoemModal() {
    poemOverlay.classList.add('hidden');
    poemOverlay.classList.remove('flex');
    clearInterval(typeInterval);
    poemTypewriter.textContent = '';
    setTimeout(() => {
      World3D.isModalOpen = false;
    }, 150);
  }

  // Klik tombol 'X'
  btnClosePoem.addEventListener('click', (e) => {
    e.stopPropagation();
    closePoemModal();
  });

  // Klik backdrop luar modal
  poemOverlay.addEventListener('click', (e) => {
    if (e.target === poemOverlay) {
      closePoemModal();
    }
  });

  // Cegah klik di dalam box modal menutup modal
  poemModalBox.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // TRANSISI DARI GALERI KE KUE
  btnToCake.addEventListener('click', () => {
    uiGalleryHint.classList.add('hidden');
    uiCakePanel.classList.remove('hidden');
    uiCakePanel.classList.add('flex');
    chapterTag.textContent = "Chapter II";
    chapterTitle.textContent = "A Wish Upon The Dark";
    World3D.transitionToCake();
  });

  // BABAK 2: KUIS TANGGAL & LILIN
  btnVerifyDate.addEventListener('click', () => {
    const val = parseInt(inputDate.value.trim());
    if (val === CONFIG.birthDate) {
      dateError.textContent = '';
      cakeGate.style.display = 'none';
      cakeWishBox.classList.remove('hidden');
      World3D.igniteCandle();
    } else {
      dateError.textContent = 'Masa tanggal lahir sendiri terlupa? Coba lagi ya.';
    }
  });

  btnBlowCandle.addEventListener('click', () => {
    World3D.extinguishCandle();
    cakeWishBox.style.display = 'none';
    btnToLetter.classList.remove('hidden');

    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#a4161a', '#ffffff', '#e0a96d']
    });
  });

  // BABAK 3: SURAT CINTA
  btnToLetter.addEventListener('click', () => {
    uiCakePanel.classList.add('hidden');
    uiLetterPanel.classList.remove('hidden');
    uiLetterPanel.classList.add('flex');
    chapterTag.textContent = "Chapter III";
    chapterTitle.textContent = "Eternal Note";

    World3D.transitionToLetter();

    document.getElementById('letter-salutation').textContent = CONFIG.letter.salutation;
    const bodyEl = document.getElementById('letter-body');
    bodyEl.innerHTML = '';
    CONFIG.letter.body.forEach(para => {
      const p = document.createElement('p');
      p.textContent = para;
      bodyEl.appendChild(p);
    });
    document.getElementById('letter-signature').textContent = CONFIG.letter.signature;
    document.getElementById('letter-date').textContent = CONFIG.letter.date;
  });
});