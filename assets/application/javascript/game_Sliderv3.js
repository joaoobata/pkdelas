(() => {
  const track = document.getElementById('gamesTrack');
  if (!track) return;

  const prev = document.querySelector('.slider-btn.prev');
  const next = document.querySelector('.slider-btn.next');

  const cards = () => Array.from(track.querySelectorAll('.game_Card'));
  const wrap = (i, n) => (n ? ((i % n) + n) % n : 0);

  let current = 0;
  let isAnimating = false;
  let animTO = 0;
  const ANIM_MS = 420; // duração aproximada do scroll suave
  const EPS = 2; // tolerância para bordas do scroll
  const atStart = () => track.scrollLeft <= EPS;
  const atEnd = () => Math.ceil(track.scrollLeft + EPS) >= (track.scrollWidth - track.clientWidth);

  function nearestIndex() {
    const cs = cards();
    if (!cs.length) return 0;
    let idx = 0, min = Infinity;
    const sl = track.scrollLeft;
    cs.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - sl);
      if (d < min) { min = d; idx = i; }
    });
    return idx;
  }

  function scrollToIndex(i) {
    const cs = cards();
    const n = cs.length;
    if (!n) return;
    current = wrap(i, n);
    const left = cs[current].offsetLeft;
    isAnimating = true;
    if (animTO) clearTimeout(animTO);
    track.scrollTo({ left, behavior: 'smooth' });
    animTO = window.setTimeout(() => { isAnimating = false; }, ANIM_MS);
  }

  // Navegação apenas por setas, com loop 1 a 1
  prev?.addEventListener('click', () => {
    const n = cards().length; if (!n) return;
    if (atStart()) scrollToIndex(n - 1); else scrollToIndex(current - 1);
  });

  next?.addEventListener('click', () => {
    const n = cards().length; if (!n) return;
    if (atEnd()) scrollToIndex(0); else scrollToIndex(current + 1);
  });

  // Atualiza o índice quando o usuário rola manualmente
  track.addEventListener('scroll', () => {
    if (isAnimating) return;
    current = nearestIndex();
  }, { passive: true });

  const recalc = () => { current = nearestIndex(); };
  window.addEventListener('resize', recalc);
  window.addEventListener('load', recalc);
  recalc();
})();
