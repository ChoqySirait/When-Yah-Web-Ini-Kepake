// ============================================================
// APP ORCHESTRATOR
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  AudioManager.init();

  // Inisialisasi 3D Engine dengan Callback Split View
  World3D.init((memoryData) => {
    displaySplitPoem(memoryData);
  });

  const chapterTag = document.getElementById('chapter-tag');
  const chapterTitle = document.getElementById('chapter-title');

  const uiSeal = document.getElementById('ui-seal');
  const uiGalleryControls = document.getElementById('ui-gallery-controls');
  const galleryNormalHint = document.getElementById('gallery-normal-hint');
  const gallerySplitPanel = document.getElementById('gallery-split-panel');
  const splitPoemTitle = document.getElementById('split-poem-title');
  const splitPoemText = document.getElementById('split-poem-text');
  const btnCloseSplit = document.getElementById('btn-close-split');

  const uiCakePanel = document.getElementById('ui-cake-panel');
  const uiLetterPanel = document.getElementById('ui-letter-panel');

  const sealTrigger = document.getElementById('seal-hold-btn');
  const sealProgress = document.getElementById('seal-progress');
  const sealPercent = document.getElementById('seal-percent');
  const sealLabel = document.getElementById('seal-label');
  const sealTease = document.getElementById('seal-tease');

  const btnPrevCard = document.getElementById('btn-prev-card');
  const btnNextCard = document.getElementById('btn-next-card');
  const btnActivatePortal = document.getElementById('btn-activate-portal');

  const cakeGate = document.getElementById('cake-gate');
  const cakeWishBox = document.getElementById('cake-wish-box');
  const inputDate = document.getElementById('input-date');
  const btnVerifyDate = document.getElementById('btn-verify-date');
  const dateError = document.getElementById('cake-date-error');
  const wishInput = document.getElementById('wish-input');
  const wishStatus = document.getElementById('wish-status');
  const btnBlowCandle = document.getElementById('btn-blow-candle');
  const btnToLetter = document.getElementById('btn-to-letter');

  // ==========================================================
  // BABAK 0: TAHAN TOMBOL & PUSARAN ENERGI MASUK KE KADO
  // ==========================================================
  const totalDuration = 7000;
  const circumference = 402;
  let holdStartTime = null;
  let holdInterval = null;
  let sealDone = false;

  const cancelTeases = [
    "Duarr! Eh belum... jangan dilepas dulu dong!",
    "Duarr! Dikit lagi padahal... tahan terus layarnya!",
    "Duarr! Kok panik terus dilepas? Ulangi dari awal yaa 😜",
    "Duarr! Hayo tangannya gemeteran ya? Coba lagi!"
  ];

  function updateHoldMessage(percent) {
    if (percent < 15) {
      sealTease.textContent = "Energi mawar mulai terserap ke dalam kado...";
    } else if (percent < 30) {
      sealTease.textContent = "Kotak kado mulai bereaksi... tahan jarimu di situ!";
    } else if (percent < 50) {
      sealTease.textContent = "Detak jantungnya makin cepat... jangan goyang!";
    } else if (percent < 70) {
      sealTease.textContent = "PANIK GAK?! Pitanya mulai terbuka, awas lepas!";
    } else if (percent < 88) {
      sealTease.textContent = "TAHAN NAPAS! Energinya udah penuh banget nih!!";
    } else if (percent < 99) {
      sealTease.textContent = "1 DETIK LAGI! JANGAN DILEPAS WOYY!!";
    }
  }

  function startHold(e) {
    if (sealDone) return;
    if (e.cancelable) e.preventDefault();

    holdStartTime = Date.now();
    sealTrigger.classList.add('holding-seal');
    World3D.isAbsorbing = true;

    holdInterval = setInterval(() => {
      const elapsed = Date.now() - holdStartTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const percent = Math.floor(progress * 100);

      sealPercent.textContent = `${percent}%`;
      const offset = circumference - (progress * circumference);
      sealProgress.style.strokeDashoffset = offset;

      World3D.absorptionSpeed = 1.0 + progress * 2.5;
      updateHoldMessage(percent);

      if (percent >= 70) {
        document.body.className = "bg-[#050304] text-[#f5f3f4] min-h-screen overflow-hidden select-none rumble-level-3";
        sealLabel.textContent = "TAHAN!!";
      } else if (percent >= 45) {
        document.body.className = "bg-[#050304] text-[#f5f3f4] min-h-screen overflow-hidden select-none rumble-level-2";
        sealLabel.textContent = "AWAS!!";
      } else if (percent >= 25) {
        document.body.className = "bg-[#050304] text-[#f5f3f4] min-h-screen overflow-hidden select-none rumble-level-1";
      }

      if (progress >= 1) {
        finishHold();
      }
    }, 30);
  }

  function cancelHold() {
    if (sealDone || !holdInterval) return;
    clearInterval(holdInterval);
    holdInterval = null;

    World3D.isAbsorbing = false;
    document.body.className = "bg-[#050304] text-[#f5f3f4] min-h-screen overflow-hidden select-none";
    sealTrigger.classList.remove('holding-seal');
    sealProgress.style.strokeDashoffset = circumference;
    sealPercent.textContent = "0%";
    sealLabel.textContent = "TEKAN";

    const randomTease = cancelTeases[Math.floor(Math.random() * cancelTeases.length)];
    sealTease.textContent = randomTease;
  }

  function finishHold() {
    sealDone = true;
    clearInterval(holdInterval);
    document.body.className = "bg-[#050304] text-[#f5f3f4] min-h-screen overflow-hidden select-none";

    sealLabel.textContent = "DUARR!!";
    sealTease.textContent = "Kado berhasil dibuka ✨";

    AudioManager.play();
    World3D.burstGiftBox(() => {
      uiSeal.classList.add('hidden');
      uiGalleryControls.classList.remove('hidden');
      uiGalleryControls.classList.add('flex');
      chapterTag.textContent = "Chapter I";
      chapterTitle.textContent = "Unspoken Beauty";
    });
  }

  sealTrigger.addEventListener('mousedown', startHold);
  window.addEventListener('mouseup', cancelHold);
  sealTrigger.addEventListener('touchstart', startHold, { passive: false });
  window.addEventListener('touchend', cancelHold);

  // ==========================================================
  // BABAK 1: GALERI 3D & FLOATING POETRY KIRI
  // ==========================================================
  btnNextCard.addEventListener('click', () => World3D.nextCard());
  btnPrevCard.addEventListener('click', () => World3D.prevCard());

  let poemTypeInterval = null;
  function displaySplitPoem(data) {
    galleryNormalHint.classList.add('hidden');
    gallerySplitPanel.classList.remove('hidden');
    gallerySplitPanel.classList.add('flex');

    splitPoemTitle.textContent = data.title;
    clearInterval(poemTypeInterval);
    splitPoemText.textContent = '';
    let i = 0;
    poemTypeInterval = setInterval(() => {
      if (i < data.poem.length) {
        splitPoemText.textContent += data.poem.charAt(i);
        i++;
      } else {
        clearInterval(poemTypeInterval);
      }
    }, 45);
  }

  btnCloseSplit.addEventListener('click', () => {
    clearInterval(poemTypeInterval);
    gallerySplitPanel.classList.add('hidden');
    gallerySplitPanel.classList.remove('flex');
    galleryNormalHint.classList.remove('hidden');
    World3D.deactivateSplitView();
  });

  // ==========================================================
  // TRANSISI PORTAL MENEMBUS DIMENSI KUE
  // ==========================================================
  btnActivatePortal.addEventListener('click', () => {
    uiGalleryControls.classList.add('hidden');
    chapterTag.textContent = "Interlude";
    chapterTitle.textContent = "Crossing The Stargate";

    World3D.transitionToPortal(() => {
      uiCakePanel.classList.remove('hidden');
      uiCakePanel.classList.add('flex');
      chapterTag.textContent = "Chapter II";
      chapterTitle.textContent = "A Wish Upon The Dark";
    });
  });

  // ==========================================================
  // BABAK 2: KUIS TANGGAL & PENGIRIMAN DOA KE EMAIL
  // ==========================================================
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
    const userWish = wishInput.value.trim();

    // Kirim doa otomatis ke email melalui FormSubmit AJAX
    if (CONFIG.receiverEmail && userWish) {
      wishStatus.textContent = "Mengirimkan harapan ke langit...";
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONFIG.receiverEmail)}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Recipient: CONFIG.recipientName,
          Birthday_Wish: userWish,
          Timestamp: new Date().toLocaleString()
        })
      }).then(() => {
        wishStatus.textContent = "Harapan telah tersimpan abadi ✨";
      }).catch(() => {
        wishStatus.textContent = "Harapan telah tersimpan di semesta ✨";
      });
    }

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

  // ==========================================================
  // BABAK 3: SURAT CINTA UTAMA
  // ==========================================================
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