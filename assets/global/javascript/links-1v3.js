(() => {
  const APP_LINKS = {
    home: 'index.html',
    bank: 'control-banca.html',
    platform: 'https://ads.betfair.bet.br/redirect.aspx?pid=6901750&bid=11330',
    'game-bloody-dawn': 'bloody-dawn.html',
    'game-wild-bandito': 'wild-bandito.html',
    'game-dynamite-trio': 'dynamite-trio.html',
    'game-spell-master': 'spell-master.html',
    'game-rage-of-perun': 'rage-of-perun.html',
  };

  const applyLinks = () => {
    document
      .querySelectorAll('[data-link-key]')
      .forEach((el) => {
        if (el.id === 'invadir-btn' || el.dataset.linkNoauto === 'true') return; // não reescreve o botão de iniciar
        const rawKey = el.getAttribute('data-link-key');
        const key = rawKey === 'follow' ? 'platform' : rawKey;
        const url = key && APP_LINKS[key];
        if (!url) return;
        const tag = el.tagName.toLowerCase();
        if (tag === 'a') {
          el.setAttribute('href', url);
        } else {
          el.dataset.href = url;
          el.onclick = () => window.location.assign(url);
        }
      });
  };

  // garante que clique usa o link atualizado mesmo se o href antigo estiver em cache
  document.addEventListener('click', (ev) => {
    if (ev.defaultPrevented) return;
    const target = ev.target?.closest?.('[data-link-key]');
    if (!target) return;
    if (target.id === 'invadir-btn' || target.dataset.linkNoauto === 'true') return; // deixa o JS do jogo cuidar
    const rawKey = target.getAttribute('data-link-key');
    const key = rawKey === 'follow' ? 'platform' : rawKey;
    const url = key && APP_LINKS[key];
    if (!url || url === '#') return;
    ev.preventDefault();
    window.location.assign(url);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyLinks();
    });
  } else {
    applyLinks();
  }

  // expose for quick runtime changes if needed
  window.APP_LINKS = APP_LINKS;
  window.updateAppLinks = (patch = {}) => {
    // função mantida para compatibilidade, sem sincronização automática via analytics
    applyLinks();
  };
  window.applyAppLinks = applyLinks;

  if (typeof MutationObserver !== 'undefined') {
    const obs = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes && m.addedNodes.length)) {
        applyLinks();
      }
    });
    obs.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }
})();

