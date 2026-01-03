(() => {
  const modal = document.getElementById('installModal');
  if (!modal) return;

  // Always show modal on load; no persistence
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  let outsideClickHandler = null;

  function openModal() {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    const dialog = qs('.install-dialog', modal);
    // Click fora do diálogo fecha o modal (capturing), sem bloquear scroll
    outsideClickHandler = (e) => {
      if (!dialog) return;
      if (dialog.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    };
    setTimeout(() => document.addEventListener('click', outsideClickHandler, true), 0);
  }

  function closeModal() {
    modal.classList.remove('open');
    const done = () => { modal.hidden = true; modal.removeEventListener('transitionend', done); };
    modal.addEventListener('transitionend', done);
    setTimeout(done, 320);
    if (outsideClickHandler) { document.removeEventListener('click', outsideClickHandler, true); outsideClickHandler = null; }
  }

  function activate(platform) {
    const tabs = qsa('[data-platform]', modal);
    const panels = qsa('.platform-steps', modal);
    tabs.forEach(b => b.classList.toggle('active', b.dataset.platform === platform));
    panels.forEach(p => { p.hidden = p.dataset.platform !== platform; });
  }

  window.addEventListener('load', () => {
    activate('ios');
    setTimeout(openModal, 5000); // abre após 5 segundos
  });

  qs('.install-close', modal)?.addEventListener('click', closeModal);
  qs('#installGotIt', modal)?.addEventListener('click', closeModal);
  // Clique no fundo é tratado pelo listener global (capturing)

  qsa('[data-platform]', modal).forEach(btn => {
    btn.addEventListener('click', () => activate(btn.dataset.platform));
  });
})();
