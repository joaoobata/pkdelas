(() => {
  const payload = {
    page: document.body?.dataset?.page || window.location.pathname || 'unknown',
    game: document.body?.dataset?.gameName || document.body?.dataset?.game || null
  };

  // Versão estática: não envia nada para servidor.
  // Mantida apenas para compatibilidade caso um endpoint seja adicionado futuramente.
  console.debug?.('track (offline)', payload);
})();
