// ============================================================
// SISTEM GALERI 3D & TYPEWRITER MODAL
// ============================================================
const GalleryManager = {
  container: document.getElementById('cards-container'),
  modal: document.getElementById('modal-card'),
  modalImg: document.getElementById('modal-img'),
  typewriterEl: document.getElementById('modal-typewriter'),
  closeBtn: document.getElementById('close-modal'),
  typeInterval: null,

  init() {
    this.renderCards();
    this.closeBtn.addEventListener('click', () => this.hideModal());
  },

  renderCards() {
    this.container.innerHTML = '';
    CONFIG.memories.forEach((item) => {
      const card = document.createElement('div');
      card.className = "floating-card cursor-pointer group bg-[#161a1d] border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-xl";
      card.innerHTML = `
        <div class="w-full aspect-[4/5] rounded-xl overflow-hidden mb-2 relative">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80"></div>
          <span class="absolute bottom-2 left-2 text-xs font-serif text-[#d4af37] font-semibold">${item.title}</span>
        </div>
        <p class="text-[11px] text-gray-400 text-center font-light italic">Ketuk untuk membaca ✦</p>
      `;

      card.addEventListener('click', () => this.showModal(item));
      this.container.appendChild(card);
    });
  },

  showModal(item) {
    this.modalImg.src = item.image;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    this.startTypewriter(item.poem);
  },

  hideModal() {
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
    clearInterval(this.typeInterval);
    this.typewriterEl.textContent = '';
  },

  startTypewriter(text) {
    clearInterval(this.typeInterval);
    this.typewriterEl.textContent = '';
    let i = 0;
    this.typeInterval = setInterval(() => {
      if (i < text.length) {
        this.typewriterEl.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(this.typeInterval);
      }
    }, 45);
  }
};