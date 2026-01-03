(() => {
  const glitches = document.querySelectorAll('.game_CardGlitch');
  if (!glitches.length) return;

  glitches.forEach((el) => {
    const card = el.closest('.game_Card');
    const title = card?.querySelector('.game_Name');
    if (title && !title.dataset.title) {
      title.dataset.title = title.textContent?.trim() || '';
    }

    // base random duration between 3.2s and 5.5s (slightly slower)
    const baseDuration = 3.2 + Math.random() * 2.3;
    // negative delay so each starts mid-cycle at a different moment
    const baseDelay = -(Math.random() * baseDuration);
    const baseShift = 1.5;

    el.dataset.baseDuration = baseDuration.toFixed(2);
    el.dataset.baseDelay = baseDelay.toFixed(2);
    el.dataset.baseShift = baseShift.toString();

    el.style.setProperty('--glitch-duration', `${el.dataset.baseDuration}s`);
    el.style.setProperty('--glitch-delay', `${el.dataset.baseDelay}s`);
    el.style.setProperty('--glitch-shift', `${el.dataset.baseShift}px`);
    card?.style.setProperty('--glitch-duration', `${el.dataset.baseDuration}s`);
    card?.style.setProperty('--glitch-delay', `${el.dataset.baseDelay}s`);
    card?.style.setProperty('--glitch-shift', `${el.dataset.baseShift}px`);

    // cria status se não existir
    if (card && !card.querySelector('.game_Status')) {
      const status = document.createElement('div');
      status.className = 'game_Status';
      const dot = document.createElement('span');
      dot.className = 'status-dot';
      const text = document.createElement('span');
      text.className = 'status-text';
      text.textContent = 'Localizando falhas';
      status.append(dot, text);
      const button = card.querySelector('.game_Button');
      (button?.parentNode)?.insertBefore(status, button.nextSibling);
    }
  });

  let currentSet = [];
  const ACTIVE_MIN = 10000; // mínimo 10s bugado
  const ACTIVE_MAX = 25000; // máximo 25s bugado

  function bumpStatus(card) {
    const status = card?.querySelector('.game_Status');
    if (!status) return;
    status.classList.remove('status-flash');
    // force reflow to restart animation
    void status.offsetWidth;
    status.classList.add('status-flash');
  }

  const pickNextSet = () => {
    const total = glitches.length;
    if (total === 1) return [0];
    const desired = Math.min(total, Math.random() < 0.6 ? 1 : 2); // aleatoriamente 1 ou 2
    const indices = Array.from({ length: total }, (_, i) => i);
    // shuffle simples
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, desired);
  };

  function setActive(list) {
    const active = new Set(list);
    glitches.forEach((el, i) => {
      const card = el.closest('.game_Card');
      const title = card?.querySelector('.game_Name');
      const statusText = card?.querySelector('.status-text');
      const statusDot = card?.querySelector('.status-dot');
      if (active.has(i)) {
        const intenseDuration = 0.75 + Math.random() * 0.55; // 0.75s a 1.3s (flicker suavizado)
        const intenseShift = 1 + Math.random() * 1.5; // 1px a 2.5px (bem suave)
        const intenseDelay = -(Math.random() * intenseDuration);
        el.classList.add('glitch-intense');
        el.style.setProperty('--glitch-duration', `${intenseDuration.toFixed(2)}s`);
        el.style.setProperty('--glitch-delay', `${intenseDelay.toFixed(2)}s`);
        el.style.setProperty('--glitch-shift', `${intenseShift.toFixed(1)}px`);
        card?.style.setProperty('--glitch-duration', `${intenseDuration.toFixed(2)}s`);
        card?.style.setProperty('--glitch-delay', `${intenseDelay.toFixed(2)}s`);
        card?.style.setProperty('--glitch-shift', `${intenseShift.toFixed(1)}px`);
        card?.classList.add('card-intense');
        title?.classList.add('title-glitching');
        if (statusText) statusText.textContent = 'Falha Localizada';
        if (statusDot) statusDot.classList.add('status-found');
        bumpStatus(card);
      } else {
        el.classList.remove('glitch-intense');
        const d = el.dataset.baseDuration || '3.5';
        const dl = el.dataset.baseDelay || '0';
        const s = el.dataset.baseShift || '3';
        el.style.setProperty('--glitch-duration', `${d}s`);
        el.style.setProperty('--glitch-delay', `${dl}s`);
        el.style.setProperty('--glitch-shift', `${s}px`);
        card?.style.setProperty('--glitch-duration', `${d}s`);
        card?.style.setProperty('--glitch-delay', `${dl}s`);
        card?.style.setProperty('--glitch-shift', `${s}px`);
        card?.classList.remove('card-intense');
        title?.classList.remove('title-glitching');
        if (statusText) statusText.textContent = 'Localizando falhas';
        if (statusDot) statusDot.classList.remove('status-found');
        bumpStatus(card);
      }
    });
  }

  const cycle = () => {
    currentSet = pickNextSet();
    setActive(currentSet);
    const delay = ACTIVE_MIN + Math.random() * (ACTIVE_MAX - ACTIVE_MIN);
    window.setTimeout(cycle, delay);
  };

  cycle();
})();
