(() => {
  if (!document.body.classList.contains('bank-body')) return;

  const investimentoInput = document.getElementById('investimento');
  const btnCalcular = document.getElementById('btn-calcular');
  const outJogar = document.getElementById('valor-jogar');
  const outGanhar = document.getElementById('valor-ganhar');
  const outPerder = document.getElementById('valor-perder');
  const outMeta = document.getElementById('valor-meta');

  const cfg = {
    stakePct: 0.02,   // 2% por rodada
    lossPct: 0.5,     // pode perder até 50% no dia
    gainMult: 5       // pode ganhar até 5x
  };

  const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  });

  function parseValor(str) {
    if (!str) return 0;
    const cleaned = str.replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
    const n = Number(cleaned);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function setValor(el, val) {
    if (el) el.textContent = currency.format(val || 0);
  }

  function calcular() {
    const investimento = parseValor(investimentoInput?.value);
    const jogar = investimento * cfg.stakePct;
    const ganhar = investimento * cfg.gainMult;
    const perder = investimento * cfg.lossPct;
    const meta = ganhar * 0.9; // meta ligeiramente abaixo do ganho máximo

    setValor(outJogar, jogar);
    setValor(outGanhar, ganhar);
    setValor(outPerder, perder);
    setValor(outMeta, meta);
  }

  btnCalcular?.addEventListener('click', calcular);
  investimentoInput?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') calcular();
  });

  calcular();
})();
