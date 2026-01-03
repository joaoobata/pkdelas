(() => {
  const GAME_NAME = (document.body?.dataset?.gameName || 'BLOODY DAWN').trim();
  const invadirBtn = document.getElementById('invadir-btn');
  const terminal = document.getElementById('terminal');
  const terminalOutput = document.getElementById('terminal-output');
  const progressBar = document.getElementById('progress-bar');
  const progressValue = document.getElementById('progress-value');
  const progressTitle = document.querySelector('#progress .progress-title');
  const typingCmd = document.querySelector('.typing-cmd');
  if (typingCmd) typingCmd.setAttribute('data-cmd', GAME_NAME);
  const radarLoader = document.getElementById('radar-loader');
  const radarCore = document.querySelector('.radar-loader-core');
  const radarPanel = document.querySelector('.radar-panel');
  const failCount = document.getElementById('fail-count');
  const terminalPanels = document.getElementById('terminal-panels');
  const resultsStandalone = document.getElementById('results-standalone');
  const radarBeep = typeof Audio !== 'undefined' ? new Audio('assets/application/audios/radar.mp3') : null;
  const glitchReady = typeof Audio !== 'undefined' ? new Audio('assets/application/audios/glitch_3.mp3') : null;
  const glitchResult = typeof Audio !== 'undefined' ? new Audio('assets/application/audios/glitch_4.mp3') : null;
  const hackingSfx = typeof Audio !== 'undefined' ? new Audio('assets/application/audios/hacking-sfx.mp3') : null;
  const securityCheckSfx = typeof Audio !== 'undefined' ? new Audio('assets/application/audios/t1.mp3') : null;
  const failsCheckSfx = typeof Audio !== 'undefined' ? new Audio('assets/application/audios/t2.mp3') : null;
  const hackingPhaseSfx = typeof Audio !== 'undefined' ? new Audio('assets/application/audios/t3.mp3') : null;
  const concludeSfx = typeof Audio !== 'undefined' ? new Audio('assets/application/audios/t4.mp3') : null;
  const sfxList = [radarBeep, glitchReady, glitchResult, hackingSfx, securityCheckSfx, failsCheckSfx, hackingPhaseSfx, concludeSfx];
  if (radarBeep) radarBeep.preload = 'auto';
  if (glitchReady) glitchReady.preload = 'auto';
  if (glitchResult) glitchResult.preload = 'auto';
  if (hackingSfx) hackingSfx.preload = 'auto';
  if (securityCheckSfx) securityCheckSfx.preload = 'auto';
  if (failsCheckSfx) failsCheckSfx.preload = 'auto';
  if (hackingPhaseSfx) hackingPhaseSfx.preload = 'auto';
  if (concludeSfx) concludeSfx.preload = 'auto';
  let audioPrimed = false;
  function primeOne(el) {
    if (!el) return;
    const originalVol = el.volume;
    el.volume = 0;
    const playAttempt = el.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.then(() => {
        el.pause();
        el.currentTime = 0;
        el.volume = originalVol;
      }).catch(() => {
        el.volume = originalVol;
      });
    } else {
      el.volume = originalVol;
    }
  }
  function ensureAudioPrimed() {
    if (audioPrimed) return;
    audioPrimed = true;
    sfxList.forEach(primeOne);
  }
  function playHacking() {
    ensureAudioPrimed();
    if (!hackingSfx) return;
    hackingSfx.currentTime = 0;
    hackingSfx.play().catch(() => {});
  }

  const defaultButtonHTML = invadirBtn ? invadirBtn.innerHTML : '';

  let isProcessing = false;
  let isCooldown = false;
  let isReadyToHack = false;
  let hasCompletedOnce = false;
  let validadeTimer = null;
  let searchProgressRAF = null;
  let searchStreamTimeout = null;
  let mobileTerminalRaised = false;
  let lastFailCount = 0;
  let lastBeepId = null;
  let lastBeepAt = 0;

  const SEARCH_DURATION_MS = 8000;
  const TERMINAL_DURATION_MS = 8000;
  const stepResultTags = {
    '> INICIANDO METODO...': { text: 'METODO INICIADO COM SUCESSO', tone: 'green' },
    '> VERIFICANDO PLATAFORMA...': { text: 'https://betsul.com/', tone: 'yellow' },
    '> VERIFICANDO SEGURANCA...': { text: 'FRAGIL', tone: 'yellow' },
    '> INJETANDO O METODO...': { text: 'METODO INJETADO COM SUCESSO', tone: 'green' },
    '> VERIFICANDO ENTRADA...': { text: 'GERANDO ENTRADAS', tone: 'yellow' }
  };

  const visualCodeSnippets = [
    `<?php
$seed = bin2hex(random_bytes(6));
$channel = 'hack://' . $seed;
printf("# canal: %s\\n", $channel);
?>`,
    `<?php
$routes = ['scan','inject','verify','patch'];
$audit = array_map(
  fn($s,$i) => [
    'step'    => $s,
    'ok'      => true,
    'latency' => rand(10,120) + $i
  ],
  $routes,
  array_keys($routes)
);
echo json_encode($audit, JSON_PRETTY_PRINT);
?>`,
    `<?php
function inject($token) {
  $payload = ['token'=>$token,'ts'=>microtime(true)];
  $res = ['status'=>'retry','entropy'=>random_int(1,99)];
  if ($payload['ts'] && $res['entropy'] > 42) {
    $res['status'] = 'ok';
  }
  return $res;
}
print_r(inject(bin2hex(random_bytes(4))));
?>`,
    `<?php
$cursor = [
  'addr' => sprintf('r%02d', rand(1,9)),
  'load' => rand(10,99)
];
$entropy = random_bytes(8);
var_dump($cursor, $entropy);
?>`,
    `<?php
$state = [
  'lock'   => true,
  'token'  => bin2hex(random_bytes(8)),
  'breach' => (mt_rand(1,100) < 24),
  'proof'  => base64_encode((string) microtime(true))
];
if ($state['breach']) {
  error_log('breach detected');
}
print_r($state);
?>`,
    `<?php
function handshake($node) {
  $ok = mt_rand(1,100) > 8;
  return ['ok'=>$ok, 'node'=>$node, 'ts'=>microtime(true)];
}
$result = handshake('edge-' . rand(3,99));
print_r($result);
?>`
  ];

  const glitchSnippets = [
    "// glitch: checksum drift",
    "// glitch: packet jitter",
    "// glitch: sync lost, retrying",
    "// glitch: noise detected",
    "// glitch: checksum mismatch"
  ];

  function isMobileViewport() {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  }

  function setButtonBlocked(blocked) {
    if (!invadirBtn) return;
    invadirBtn.classList.toggle('btn-blocked', blocked);
    invadirBtn.setAttribute('aria-disabled', blocked ? 'true' : 'false');
    invadirBtn.setAttribute('tabindex', blocked ? '-1' : '0');
  }

  function setButtonLabel(text) {
    if (!invadirBtn) return;
    invadirBtn.textContent = text;
  }

  function setButtonTextOnly(text) {
    if (!invadirBtn) return;
    invadirBtn.textContent = text;
  }

  function resetResultsView() {
    if (resultsStandalone) {
      resultsStandalone.style.display = 'none';
      resultsStandalone.innerHTML = '';
    }
    hideFollowContainer(resultsStandalone);
    hideFollowContainer(terminalOutput);
    if (terminalPanels) {
      terminalPanels.style.display = 'flex';
    }
    resetTerminalUI();
  }

  function resetTerminalUI() {
    stopSearchStream();
    if (validadeTimer) {
      clearInterval(validadeTimer);
      validadeTimer = null;
    }
    if (terminalOutput) {
      terminalOutput.innerHTML = '';
      terminalOutput.scrollTop = 0;
    }
    updateProgress(0, 'PROCURANDO...');
  }

  function setStatusText(text) {
    if (progressTitle) progressTitle.textContent = text;
  }

  function resetButton() {
    if (!invadirBtn) return;
    invadirBtn.innerHTML = defaultButtonHTML;
    setButtonBlocked(false);
    isProcessing = false;
  }

  function stopSearchProgress(finalLabel) {
    if (searchProgressRAF) {
      cancelAnimationFrame(searchProgressRAF);
      searchProgressRAF = null;
    }
    if (typeof finalLabel === 'string') {
      updateProgress(100, finalLabel);
    }
  }

  function getSearchDurationMs() {
    return SEARCH_DURATION_MS;
  }

  function getRemainingMs(startedAt, targetMs) {
    return Math.max(targetMs - (performance.now() - startedAt), 0);
  }

  function startSearchProgress(duration = SEARCH_DURATION_MS) {
    stopSearchProgress();
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(98, (elapsed / duration) * 100);
      updateProgress(pct, 'PROCURANDO...');
      searchProgressRAF = requestAnimationFrame(tick);
    };
    tick();
  }

  function startSearchStream() {
    stopSearchStream();
    const pushLine = () => {
      appendCodeLine(pickSnippet());
      const delay = 160 + Math.random() * 120;
      searchStreamTimeout = setTimeout(pushLine, delay);
    };
    pushLine();
  }

  function stopSearchStream() {
    if (searchStreamTimeout) {
      clearTimeout(searchStreamTimeout);
      searchStreamTimeout = null;
    }
  }

  function findFollowContainer(anchorEl) {
    if (!anchorEl || !anchorEl.parentElement) return null;
    const next = anchorEl.nextElementSibling;
    if (next && next.classList && next.classList.contains('result-follow-container')) return next;
    return null;
  }

  function ensureFollowContainer(anchorEl) {
    if (!anchorEl || !anchorEl.parentElement) return null;
    const existing = findFollowContainer(anchorEl);
    if (existing) return existing;
    const container = document.createElement('div');
    container.className = 'result-follow-container';
    anchorEl.parentElement.insertBefore(container, anchorEl.nextElementSibling);
    return container;
  }

  function hideFollowContainer(anchorEl) {
    const container = findFollowContainer(anchorEl);
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
  }

  function randomDelayLong() {
    return 5000 + Math.random() * 3000;
  }

  function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function startCooldown(seconds) {
    return new Promise((resolve) => {
      let remaining = seconds;
      let timerId;
      const tick = () => {
        setButtonTextOnly(`GERAR NOVAMENTE (${remaining}s)`);
        if (remaining <= 0) {
          if (timerId) clearInterval(timerId);
          resolve();
          return;
        }
        remaining -= 1;
      };
      setButtonBlocked(true);
      tick();
      timerId = setInterval(tick, 1000);
    });
  }

  function setFailCountVisibility(show) {
    if (!failCount) return;
    failCount.style.display = show ? 'block' : 'none';
  }

  function setTerminalPanelsVisible(show) {
    if (!terminalPanels) return;
    terminalPanels.style.display = show ? 'flex' : 'none';
  }

  function setTerminalHiddenMobile(hidden) {
    if (!terminalPanels) return;
    terminalPanels.classList.toggle('terminal-hidden-mobile', hidden);
  }

  function setTerminalHiddenMobile(hidden) {
    if (!terminalPanels) return;
    terminalPanels.classList.toggle('terminal-hidden-mobile', hidden);
  }

  function withoutTerminalTransition(action) {
    if (!terminal) {
      action();
      return;
    }
    const prev = terminal.style.transition;
    terminal.style.transition = 'none';
    action();
    // force reflow
    void terminal.offsetHeight;
    terminal.style.transition = prev;
  }

  function withoutTerminalTransition(action) {
    if (!terminal) {
      action();
      return;
    }
    const prev = terminal.style.transition;
    terminal.style.transition = 'none';
    action();
    // force reflow
    void terminal.offsetHeight;
    terminal.style.transition = prev;
  }

  function playRadarBeep(idHint) {
    ensureAudioPrimed();
    if (!radarBeep) return;
    const now = Date.now();
    if (idHint !== undefined && lastBeepId === idHint && now - lastBeepAt < 400) return;
    lastBeepId = idHint;
    lastBeepAt = now;
    radarBeep.currentTime = 0;
    radarBeep.play().catch(() => {});
  }

  function playGlitchReadySound() {
    ensureAudioPrimed();
    if (!glitchReady) return;
    glitchReady.currentTime = 0;
    glitchReady.play().catch(() => {});
  }

  function playGlitchResultSound() {
    ensureAudioPrimed();
    if (!glitchResult) return;
    glitchResult.currentTime = 0;
    glitchResult.play().catch(() => {});
  }

  function showRadarPanel() {
    if (!radarPanel) return;
    radarPanel.classList.remove('mobile-hidden');
    radarPanel.style.display = 'flex';
    if (terminal) terminal.classList.remove('terminal-full');
  }

  function hideRadarPanel() {
    if (!radarPanel) return;
    radarPanel.classList.add('mobile-hidden');
    radarPanel.style.display = 'none';
    if (terminal) terminal.classList.add('terminal-full');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightJs(line) {
    const tokenRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|if|else|for|while|class|new|await|async|try|catch|throw|def|import|from|as|with|elif|lambda|yield|pass|break|continue|raise|except|finally)\b|\b(?:true|false|null|undefined|None|True|False)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*(?=\s*\())/g;
    let result = '';
    let lastIndex = 0;
    let match;
    while ((match = tokenRegex.exec(line)) !== null) {
      const token = match[0];
      const start = match.index;
      const end = start + token.length;
      if (start > lastIndex) result += escapeHtml(line.slice(lastIndex, start));
      let cls = '';
      if (token.startsWith('//') || token.startsWith('/*') || token.startsWith('#')) cls = 'js-comment';
      else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) cls = 'js-string';
      else if (/^(true|false|null|undefined|None|True|False)$/.test(token)) cls = 'js-boolean';
      else if (/^\d/.test(token)) cls = 'js-number';
      else if (/^(const|let|var|function|return|if|else|for|while|class|new|await|async|try|catch|throw|def|import|from|as|with|elif|lambda|yield|pass|break|continue|raise|except|finally)$/.test(token)) cls = 'js-keyword';
      else cls = 'js-func';
      result += `<span class="${cls}">${escapeHtml(token)}</span>`;
      lastIndex = end;
    }
    if (lastIndex < line.length) result += escapeHtml(line.slice(lastIndex));
    return result;
  }

  function updateProgress(percent, labelText) {
    const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
    if (progressBar) progressBar.style.width = `${safePercent}%`;
    if (progressValue) progressValue.textContent = `${safePercent}%`;
    if (labelText && progressTitle) progressTitle.textContent = labelText;
  }

  function scrollToBottom() {
    if (!terminalOutput) return;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    requestAnimationFrame(() => {
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    });
  }

  function appendCodeLine(code) {
    const codeEl = document.createElement('div');
    codeEl.className = 'terminal-line';
    codeEl.innerHTML = `<span class="terminal-code">${highlightJs(code)}</span>`;
    terminalOutput.appendChild(codeEl);
    scrollToBottom();
  }

  function appendStatus(step) {
    const stepEl = document.createElement('div');
    const statusClass = step.status ? ` status-${step.status}` : '';
    const content = step.isHtml ? step.text : escapeHtml(step.text);
    stepEl.className = `terminal-line status-line${statusClass}`;
    stepEl.innerHTML = `<span class="status-dot"></span><span class="status-text">${content}</span>`;
    terminalOutput.appendChild(stepEl);
    scrollToBottom();
    return stepEl;
  }

  function generateFailCode() {
    const part = () => Math.random().toString(16).slice(2, 6).toUpperCase();
    return `F-${part()}-${part()}`;
  }

  function appendFailFoundLine(idx) {
    if (!terminalOutput) return;
    const code = generateFailCode();
    const line = document.createElement('div');
    line.className = 'terminal-line status-line status-warn';
    line.innerHTML = `<span class="status-dot"></span><span class="status-text"><i class="bi bi-arrow-right-short"></i> FALHA ${idx} ENCONTRADA (${escapeHtml(code)}).</span>`;
    terminalOutput.appendChild(line);
    scrollToBottom();
    playRadarBeep(idx);
  }

  function spawnDotsLegacy(count) {
    if (!radarCore) return;
    radarCore.querySelectorAll('.dot').forEach((d) => d.remove());
    const minFails = 3;
    const dynamicMax = Math.floor(8 + Math.random() * 10); // upper limit tambÃ©m varia
    const total = typeof count === 'number'
      ? count
      : Math.floor(Math.random() * (dynamicMax - minFails + 1)) + minFails;
    const radius = radarCore.clientWidth / 2 - 12;
    const cx = radarCore.clientWidth / 2;
    const cy = radarCore.clientHeight / 2;
    if (!radius || !cx || !cy) return;
    let current = 0;

    const addDot = () => {
      if (current >= total) return;
      const dot = document.createElement('div');
      dot.className = 'dot dot-new';
      const angle = Math.random() * Math.PI * 2;
      const r = radius * Math.sqrt(Math.random());
      dot.style.left = `${cx + r * Math.cos(angle)}px`;
      dot.style.top = `${cy + r * Math.sin(angle)}px`;
      radarCore.appendChild(dot);
      current += 1;
      if (failCount) failCount.textContent = `FALHAS: ${current}`;
      setFailCountVisibility(true);
      appendFailFoundLine(current);
      if (current < total) setTimeout(addDot, 1000 + Math.random() * 2000);
    };

    addDot();
  }

  function spawnDots(count, onProgress, durationMs = SEARCH_DURATION_MS) {
    return new Promise((resolve) => {
      const totalTime = durationMs;
      if (!radarCore) {
        if (typeof onProgress === 'function') onProgress(100);
        setTimeout(resolve, totalTime);
        return;
      }
      radarCore.querySelectorAll('.dot').forEach((d) => d.remove());
      const minFails = 3;
      const dynamicMax = Math.floor(8 + Math.random() * 10);
      const total = typeof count === 'number'
        ? count
        : Math.floor(Math.random() * (dynamicMax - minFails + 1)) + minFails;
      const radius = radarCore.clientWidth / 2 - 12;
      const cx = radarCore.clientWidth / 2;
      const cy = radarCore.clientHeight / 2;
      if (!radius || !cx || !cy) {
        setTimeout(resolve, totalTime);
        return;
      }
      lastFailCount = 0;

      const scheduleDot = (idx) => {
        const at = Math.min(totalTime - 50, Math.round(((idx + 1) / total) * totalTime));
        setTimeout(() => {
          const dot = document.createElement('div');
          dot.className = 'dot dot-new';
          const angle = Math.random() * Math.PI * 2;
          const r = radius * Math.sqrt(Math.random());
          dot.style.left = `${cx + r * Math.cos(angle)}px`;
          dot.style.top = `${cy + r * Math.sin(angle)}px`;
          radarCore.appendChild(dot);
          lastFailCount += 1;
          if (failCount) failCount.textContent = `FALHAS: ${lastFailCount}`;
          setFailCountVisibility(true);
          appendFailFoundLine(lastFailCount);
          if (typeof onProgress === 'function') {
            const pct = Math.min(99, Math.round(((idx + 1) / total) * 100));
            onProgress(pct);
          }
        }, at);
      };

      for (let i = 0; i < total; i += 1) {
        scheduleDot(i);
      }

      setTimeout(() => {
        if (typeof onProgress === 'function') onProgress(100);
        resolve();
      }, totalTime);
    });
  }


  function appendTagLine(stepText) {
    const tag = stepResultTags[stepText];
    if (!tag) return;
    const line = document.createElement('div');
    const toneClass = tag.tone === 'yellow' ? 'terminal-warn' : 'terminal-alert';
    line.className = 'terminal-line';
    line.innerHTML = `<span class="${toneClass}">${escapeHtml(tag.text)}</span>`;
    terminalOutput.appendChild(line);
    scrollToBottom();
  }

  function pickSnippet() {
    const base = visualCodeSnippets[Math.floor(Math.random() * visualCodeSnippets.length)];
    if (Math.random() < 0.22) {
      const glitch = glitchSnippets[Math.floor(Math.random() * glitchSnippets.length)];
      return `${base}  ${glitch}`;
    }
    return base;
  }

  function showRadar(shouldSpawn = true) {
    if (!radarLoader) return;
    radarLoader.classList.remove('radar-hidden');
    if (!radarCore) return;
    if (shouldSpawn) {
      radarCore.querySelectorAll('.dot').forEach((d) => d.remove());
      requestAnimationFrame(() => spawnDots());
    }
  }

  function hideRadar() {
    if (radarLoader) radarLoader.classList.add('radar-hidden');
    setFailCountVisibility(false);
  }

  function hideRadarPanelForMobile() {
    if (!isMobileViewport()) return;
    hideRadar();
    hideRadarPanel();
  }

  function resetMobileLayoutForSearch() {
    mobileTerminalRaised = false;
    withoutTerminalTransition(() => {
      if (terminal) terminal.classList.remove('mobile-terminal-raised');
    });
    showRadarPanel();
  }

  function liftTerminalForMobile() {
    if (!isMobileViewport() || !terminal) return Promise.resolve();
    hideRadarPanelForMobile();
    mobileTerminalRaised = true;
    return new Promise((resolve) => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        terminal.removeEventListener('transitionend', onEnd);
        resolve();
      };
      const onEnd = (e) => {
        if (e.target === terminal && (e.propertyName === 'transform' || e.propertyName === 'margin-top')) {
          finish();
        }
      };
      terminal.addEventListener('transitionend', onEnd);
      requestAnimationFrame(() => {
        terminal.classList.add('mobile-terminal-raised');
      });
      setTimeout(finish, 480);
    });
  }

  function blinkConcluido(times = 3) {
    return new Promise((resolve) => {
      if (!progressTitle) return resolve();
      let count = 0;
      const toggle = () => {
        progressTitle.style.visibility = progressTitle.style.visibility === 'hidden' ? 'visible' : 'hidden';
        count++;
        if (count >= times * 2) {
          progressTitle.style.visibility = 'visible';
          resolve();
          return;
        }
        setTimeout(toggle, 180);
      };
      toggle();
    });
  }

  function buildResultData() {
    const normalRaw = Math.floor(8 + Math.random() * 18); // 8-25
    let turboRaw = Math.floor(5 + Math.random() * 11); // 5-15
    if (turboRaw >= normalRaw) {
      turboRaw = Math.max(5, normalRaw - 1);
    }
    return {
      normal: `${normalRaw}x`,
      turbo: `${turboRaw}x`,
      validade: '01:30',
      acerto: `${(82 + Math.random() * 12).toFixed(2)}%`
    };
  }

  function renderResults(state, data, targetEl = terminalOutput) {
    if (!targetEl) return;
    if (validadeTimer) {
      clearInterval(validadeTimer);
      validadeTimer = null;
    }
    const loading = state === 'loading';
    const values = data || {};
    const cards = [
      { key: 'normal', title: 'NORMAL (rodadas)', value: values.normal },
      { key: 'turbo', title: 'TURBO (rodadas)', value: values.turbo },
      { key: 'validade', title: 'VALIDADE', value: values.validade },
      { key: 'acerto', title: 'ACERTO', value: values.acerto }
    ];

    const randomDigits = Array.from({ length: 8 }, () => (Math.random() > 0.5 ? '1' : '0')).join('');
    const loader = `<div class="result-spinner"></div>`;

    const htmlCards = cards.map((c) => {
      const valueHtml = loading
        ? loader
        : `<div class="result-value" data-key="${c.key}">${c.value || '...'}</div>`;

      return `
        <div class="result-card ${loading ? 'result-loading' : ''}">
          ${loading ? '' : `<div class="result-title">${c.title}</div>`}
          ${valueHtml}
        </div>
      `;
    }).join('');
    targetEl.innerHTML = `<div class="results-grid">${htmlCards}</div>`;

    const followContainer = ensureFollowContainer(targetEl);
      if (followContainer) {
        if (state === 'final') {
          followContainer.style.display = 'flex';
          followContainer.innerHTML = '<button class="result-follow-btn" type="button" data-link-key="follow">acompanhar falha</button>';
          if (window.applyAppLinks) window.applyAppLinks();
        } else {
          followContainer.style.display = 'none';
          followContainer.innerHTML = '';
        }
      }

    if (targetEl === terminalOutput) {
      scrollToBottom();
    } else {
      targetEl.scrollTop = 0;
    }
  }

  function showResultsSequence() {
    const data = buildResultData();
    if (terminalPanels) terminalPanels.style.display = 'none';
    if (resultsStandalone) resultsStandalone.style.display = 'block';
    renderResults('loading', null, resultsStandalone || terminalOutput);
    setStatusText('PROCESSANDO RESULTADOS...');
    return new Promise((resolve) => {
      setTimeout(() => {
        renderResults('final', data, resultsStandalone || terminalOutput);
        startValidityCountdown(90);
        setStatusText('RESULTADO GERADO');
        playGlitchResultSound();
        resolve();
      }, 3000);
    });
  }

  function setIdleState() {
    stopSearchProgress();
    stopSearchStream();
    isProcessing = false;
    isCooldown = false;
    isReadyToHack = false;
    lastFailCount = 0;
    if (radarCore) radarCore.querySelectorAll('.dot').forEach((d) => d.remove());
    showRadar(false);
    showRadarPanel();
    if (failCount) failCount.textContent = 'AGUARDANDO';
    setFailCountVisibility(true);
    if (terminalPanels) terminalPanels.style.display = 'flex';
    setTerminalHiddenMobile(isMobileViewport());
    setTerminalHiddenMobile(isMobileViewport());
    if (resultsStandalone) {
      resultsStandalone.style.display = 'none';
      resultsStandalone.innerHTML = '';
    }
    hideFollowContainer(resultsStandalone);
    hideFollowContainer(terminalOutput);
    if (terminalOutput) {
      terminalOutput.innerHTML = '<div class="terminal-line status-line status-info"><span class="status-text"><i class="bi bi-terminal"></i> AGUARDANDO INICIAR...</span></div>';
      terminalOutput.scrollTop = 0;
    }
    updateProgress(0, 'PRONTO PARA BUSCAR');
    setStatusText('PRONTO PARA BUSCAR');
    setButtonLabel('INICIAR');
    setButtonBlocked(false);
  }

  function handleValidityExpired() {
    setIdleState();
  }

  function startValidityCountdown(seconds = 90) {
    if (validadeTimer) clearInterval(validadeTimer);
    const validadeEl =
      resultsStandalone?.style.display === 'block'
        ? resultsStandalone.querySelector('.result-value[data-key="validade"]')
        : terminalOutput?.querySelector('.result-value[data-key="validade"]');
    if (!validadeEl) return;
    let remaining = seconds;
    const update = () => {
      const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
      const secs = Math.floor(remaining % 60).toString().padStart(2, '0');
      validadeEl.textContent = `${mins}:${secs}`;
      if (remaining <= 10) {
        validadeEl.classList.add('validade-warning');
      } else {
        validadeEl.classList.remove('validade-warning');
      }
      if (remaining <= 0) {
        clearInterval(validadeTimer);
        validadeTimer = null;
        handleValidityExpired();
        return;
      }
      remaining -= 1;
    };
    update();
    validadeTimer = setInterval(update, 1000);
  }

  async function generateTerminalOutput() {
    ensureAudioPrimed();
    if (terminalOutput) terminalOutput.innerHTML = '';
    updateProgress(0, 'INICIANDO...');
    const failTotal = lastFailCount || 0;
    const steps = [
      { pct: 8, label: '<i class="bi bi-arrow-right-short"></i> INICIANDO O METODO...', status: 'info', isHtml: true },
      { pct: 18, label: '<i class="bi bi-arrow-right-short"></i> VERIFICANDO PLATAFORMA...', status: 'info', isHtml: true },
      { pct: 30, label: '<i class="bi bi-arrow-right-short"></i> VERIFICANDO SEGURANÇA...', status: 'warn', isHtml: true },
      { pct: 42, label: `<i class="bi bi-arrow-right-short"></i> VERIFICANDO ${GAME_NAME.toUpperCase()}...`, status: 'info', isHtml: true },
      { pct: 55, label: `<i class="bi bi-arrow-right-short"></i> VERIFICANDO AS ${failTotal || '...'} FALHAS...`, status: 'warn', isHtml: true },
      { pct: 62, label: '<i class="bi bi-arrow-right-short"></i> FALHAS CONFIRMADAS', status: 'success', isHtml: true },
      { pct: 74, label: '<i class="bi bi-arrow-right-short"></i> HACKEANDO...', status: 'action', isHtml: true },
      { pct: 82, label: '<i class="bi bi-arrow-right-short"></i> INJETANDO O METODO...', status: 'action', isHtml: true },
      { pct: 90, label: '<i class="bi bi-arrow-right-short"></i> VERIFICANDO ENTRADA...', status: 'info', isHtml: true },
      { pct: 96, label: '<i class="bi bi-arrow-right-short"></i> CONFIRMANDO ENTRADA...', status: 'info', isHtml: true },
      { pct: 100, label: '<i class="bi bi-arrow-right-short"></i> CONCLUÍDO.', status: 'success', isHtml: true }
    ];
    const stepDelay = Math.floor(TERMINAL_DURATION_MS / steps.length);

    for (const step of steps) {
      if (step.label.includes('VERIFICANDO SEGURAN') && securityCheckSfx) {
        securityCheckSfx.currentTime = 0;
        securityCheckSfx.play().catch(() => {});
      }
      if (step.label.toUpperCase().includes('VERIFICANDO AS') && step.label.toUpperCase().includes('FALHAS') && failsCheckSfx) {
        failsCheckSfx.currentTime = 0;
        failsCheckSfx.play().catch(() => {});
      }
      if (step.label.toUpperCase().includes('HACKEANDO') && hackingPhaseSfx) {
        hackingPhaseSfx.currentTime = 0;
        hackingPhaseSfx.play().catch(() => {});
      }
      appendStatus({ text: step.label, status: step.status || 'info', isHtml: step.isHtml });
      if (progressTitle) {
        const plain = step.label.replace(/<[^>]+>/g, '').replace(/^>\s*/, '');
        progressTitle.textContent = plain;
      }
      updateProgress(step.pct, step.pct >= 100 ? 'CONCLUIDO' : 'HACKEANDO');
      await waitMs(stepDelay);
    }

    if (concludeSfx) {
      concludeSfx.currentTime = 0;
      concludeSfx.play().catch(() => {});
    }
    appendStatus({ text: 'O METODO FOI EXECUTADO COM SUCESSO', status: 'success' });
    if (progressTitle) progressTitle.textContent = 'MÉTODO EXECUTADO COM SUCESSO.';
    updateProgress(100, 'CONCLUÍDO');
    await waitMs(3000);
  }

  function startSearch() {
    if (isProcessing) return Promise.resolve(false);
    ensureAudioPrimed();
    playHacking();
    const duration = getSearchDurationMs();
    resetResultsView();
    setTerminalPanelsVisible(true);
    setTerminalHiddenMobile(isMobileViewport());
    isProcessing = true;
    isReadyToHack = false;
    setButtonBlocked(true);
    setButtonLabel('PROCURANDO...');
    setStatusText('PROCURANDO FALHAS...');
    resetMobileLayoutForSearch();
    showRadar(false);
    showRadarPanel();
    if (terminal) terminal.style.display = '';
    if (failCount) failCount.textContent = 'PROCURANDO...';
    setFailCountVisibility(true);
    updateProgress(0, 'PROCURANDO...');
    startSearchProgress(duration);
    playHacking();
    return spawnDots(undefined, (pct) => updateProgress(pct, 'PROCURANDO...'), duration).then(() => new Promise((resolve) => {
      setFailCountVisibility(true);
      setButtonLabel('INVADIR');
      setButtonBlocked(false);
      playGlitchReadySound();
      stopSearchProgress('FALHAS ENCONTRADAS');
      stopSearchStream();
      setStatusText('FALHAS ENCONTRADAS');
      setTerminalPanelsVisible(!isMobileViewport());
      if (isMobileViewport()) setTerminalHiddenMobile(true);
      isProcessing = false;
      isReadyToHack = true;
      resolve(true);
    }));
  }

  function startHackFlow() {
    ensureAudioPrimed();
    playHacking();
    resetResultsView();
    stopSearchProgress();
    stopSearchStream();
    if (hackingSfx) {
      hackingSfx.currentTime = 0;
      hackingSfx.play().catch(() => {});
    }
    if (isMobileViewport()) {
      hideRadar();
      hideRadarPanel();
    } else {
      showRadarPanel();
      showRadar(false);
    }
    if (isMobileViewport()) {
      setTerminalPanelsVisible(true);
      setTerminalHiddenMobile(false);
      if (terminalPanels) {
        terminalPanels.classList.remove('terminal-animate-in');
        void terminalPanels.offsetHeight;
        terminalPanels.classList.add('terminal-animate-in');
      }
    }
    isProcessing = true;
    setButtonBlocked(true);
    setButtonLabel('PROCESSANDO...');
    setStatusText('HACKEANDO...');
    updateProgress(0, 'HACKEANDO');
    generateTerminalOutput()
      .then(() => blinkConcluido(3))
      .then(showResultsSequence)
      .then(() => {
        isCooldown = true;
        isReadyToHack = false;
        hasCompletedOnce = true;
        return startCooldown(30);
      })
      .then(() => {
        resetButton();
        setButtonLabel('PROCURAR');
        isProcessing = false;
        isCooldown = false;
      });
  }

  if (invadirBtn && terminalOutput) {
    setIdleState();

    invadirBtn.addEventListener('click', (e) => {
      e.preventDefault();
      ensureAudioPrimed();
      if (isProcessing || isCooldown) return;
      const runAction = () => {
        const shouldSearch = !isReadyToHack;
        if (shouldSearch) {
          startSearch();
          return;
        }
        startHackFlow();
      };

      runAction();
    });
  }
})();



