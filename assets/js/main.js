// ============================================================
// APP ORCHESTRATOR
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  AudioManager.init();

  // Inisialisasi 3D Engine dengan Callback Alternating Split View
  World3D.init((memoryData, isEven) => {
    displayFloatingPoem(memoryData, isEven);
  });

  const chapterTag = document.getElementById('chapter-tag');
  const chapterTitle = document.getElementById('chapter-title');

  const uiSeal = document.getElementById('ui-seal');
  const uiGalleryFloating = document.getElementById('ui-gallery-floating');
  const floatingPoemContainer = document.getElementById('floating-poem-container');
  const poemTag = document.getElementById('poem-tag');
  const poemTitle = document.getElementById('poem-title');
  const poemText = document.getElementById('poem-text');
  const btnCloseSplit = document.getElementById('btn-close-split');
  const portalTriggerContainer = document.getElementById('portal-trigger-container');
  const btnEnterPortal = document.getElementById('btn-enter-portal');

  const uiCakePanel = document.getElementById('ui-cake-panel');
  const uiLetterPanel = document.getElementById('ui-letter-panel');

  const sealTrigger = document.getElementById('seal-hold-btn');
  const sealProgress = document.getElementById('seal-progress');
  const sealPercent = document.getElementById('seal-percent');
  const sealLabel = document.getElementById('seal-label');
  const sealTease = document.getElementById('seal-tease');

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
  // BABAK 0: TAHAN TOMBOL DENGAN ENERGI TERSERAP KE KADO
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
      portalTriggerContainer.classList.remove('hidden');
      chapterTag.textContent = "Chapter I";
      chapterTitle.textContent = "Unspoken Beauty";
    });
  }

  sealTrigger.addEventListener('mousedown', startHold);
  window.addEventListener('mouseup', cancelHold);
  sealTrigger.addEventListener('touchstart', startHold, { passive: false });
  window.addEventListener('touchend', cancelHold);

  // ==========================================================
  // BABAK 1: FLOATING POETRY DISPLAY (ALTERNATIF KIRI / KANAN)
  // ==========================================================
  let poemTypeInterval = null;

  function displayFloatingPoem(data, isEven) {
    uiGalleryFloating.classList.remove('hidden');
    portalTriggerContainer.classList.add('hidden');

    if (isEven) {
      floatingPoemContainer.className = "w-full max-w-md p-6 flex flex-col sm:mr-auto sm:ml-0 text-left transition-all duration-700 items-start";
    } else {
      floatingPoemContainer.className = "w-full max-w-md p-6 flex flex-col sm:ml-auto sm:mr-0 text-right transition-all duration-700 items-end";
    }

    poemTag.textContent = "Chapter I • Unspoken Beauty";
    poemTitle.textContent = data.title;

    clearInterval(poemTypeInterval);
    poemText.textContent = '';
    let i = 0;
    poemTypeInterval = setInterval(() => {
      if (i < data.poem.length) {
        poemText.textContent += data.poem.charAt(i);
        i++;
      } else {
        clearInterval(poemTypeInterval);
      }
    }, 45);
  }

  btnCloseSplit.addEventListener('click', () => {
    clearInterval(poemTypeInterval);
    uiGalleryFloating.classList.add('hidden');
    portalTriggerContainer.classList.remove('hidden');
    World3D.deactivateSplitView();
  });

  // ==========================================================
  // TRANSISI PORTAL: GANTI MUSIK OTOMATIS KE HAPPY BIRTHDAY
  // ==========================================================
  btnEnterPortal.addEventListener('click', () => {
    portalTriggerContainer.classList.add('hidden');
    uiGalleryFloating.classList.add('hidden');
    chapterTag.textContent = "Interlude";
    chapterTitle.textContent = "Crossing The Stargate";

    // Ganti musik ke Happy Birthday (Acoustic) secara mulus
    AudioManager.switchTrack(
      CONFIG.birthdayAudioUrl,
      CONFIG.fallbackBirthdayAudioUrl,
      CONFIG.birthdayAudioTitle
    );

    World3D.transitionToPortal(() => {
      uiCakePanel.classList.remove('hidden');
      uiCakePanel.classList.add('flex');
      chapterTag.textContent = "Chapter II";
      chapterTitle.textContent = "A Wish Upon The Dark";
    });
  });

  // ==========================================================
  // BABAK 2: KUIS TANGGAL & PESTA KEMBANG API LILIN
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

    if (CONFIG.receiverEmail && userWish) {
      wishStatus.textContent = "Mengirimkan harapan ke langit...";
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONFIG.receiverEmail)}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Penerima: CONFIG.recipientName,
          Harapan_Ulang_Tahun: userWish,
          Waktu: new Date().toLocaleString()
        })
      }).then(() => {
        wishStatus.textContent = "Harapan telah tersimpan abadi ✨";
      }).catch(() => {
        wishStatus.textContent = "Harapan telah tersimpan di semesta ✨";
      });
    }

    // Tiup lilin memicu semburan air mancur kembang api 3D
    World3D.extinguishCandle();
    cakeWishBox.style.display = 'none';
    btnToLetter.classList.remove('hidden');

    // Rentetan kembang api bertingkat di layar
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#a4161a', '#ffffff', '#ffd700']
    });

    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 60,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 60,
        origin: { x: 1 }
      });
    }, 400);
  });

  // ==========================================================
  // BABAK 3: SURAT CINTA TYPEWRITER AUTO-SCROLL
  // ==========================================================
  btnToLetter.addEventListener('click', () => {
    uiCakePanel.classList.add('hidden');
    uiLetterPanel.classList.remove('hidden');
    uiLetterPanel.classList.add('flex');
    chapterTag.textContent = "Chapter III";
    chapterTitle.textContent = "Eternal Note";

    World3D.transitionToLetter();
    startLetterTypewriter();
  });

  function startLetterTypewriter() {
    const salutationEl = document.getElementById('letter-salutation');
    const bodyEl = document.getElementById('letter-body');
    const signatureEl = document.getElementById('letter-signature');
    const dateEl = document.getElementById('letter-date');
    const letterPanel = document.getElementById('ui-letter-panel');

    salutationEl.textContent = '';
    bodyEl.innerHTML = '';
    signatureEl.textContent = '';
    dateEl.textContent = '';

    // Step 1: Ketik Salutation
    typeString(salutationEl, CONFIG.letter.salutation, 40, () => {
      // Step 2: Ketik Paragraf satu demi satu
      let pIndex = 0;
      function nextParagraph() {
        if (pIndex < CONFIG.letter.body.length) {
          const p = document.createElement('p');
          bodyEl.appendChild(p);
          typeString(p, CONFIG.letter.body[pIndex], 30, () => {
            pIndex++;
            // Scroll otomatis ke bawah agar kalimat terbaru selalu terlihat
            letterPanel.scrollTo({ top: letterPanel.scrollHeight, behavior: 'smooth' });
            setTimeout(nextParagraph, 200);
          });
        } else {
          // Step 3: Ketik Signature & Tanggal
          typeString(signatureEl, CONFIG.letter.signature, 40, () => {
            dateEl.textContent = CONFIG.letter.date;
            letterPanel.scrollTo({ top: letterPanel.scrollHeight, behavior: 'smooth' });
          });
        }
      }
      nextParagraph();
    });
  }

  function typeString(element, text, speed, onDone) {
    element.classList.add('typewriter-cursor');
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < text.length) {
        element.textContent += text.charAt(idx);
        idx++;
      } else {
        clearInterval(timer);
        element.classList.remove('typewriter-cursor');
        if (onDone) onDone();
      }
    }, speed);
  }
});