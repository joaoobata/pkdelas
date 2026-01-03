(function () {
  const c = document.getElementById("bg-matrix");
  const ctx = c.getContext("2d");
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+-/".split("");
  const fontSize = 10;
  let drops = [];
  let resizeRaf = null;
  let lastWidth = null;

  function resize() {
    const targetW = window.innerWidth;
    const targetH = window.innerHeight;
    // ignora resizes só de altura (barra de navegação móvel)
    if (lastWidth !== null && Math.abs(targetW - lastWidth) < 2) {
      return;
    }
    lastWidth = targetW;
    c.width = targetW;
    c.height = targetH;
    const newColumns = Math.floor(targetW / fontSize);
    const smoothStartRows = 8; // start near the top for a soft entry
    drops = Array.from(
      { length: newColumns },
      () => Math.floor(Math.random() * smoothStartRows)
    );
  }

  function draw() {
    // camada sutil para deixar rastro
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = "green";
    ctx.font = fontSize + "px arial";

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > c.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  resize();
  window.addEventListener("resize", () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resize();
      resizeRaf = null;
    });
  });
  setInterval(draw, 45);
})();
