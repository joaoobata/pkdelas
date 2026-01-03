  document.body.classList.add('loading');
  window.scrollTo(0, 0);
  window.addEventListener("load", () => {
    const loader = document.querySelector('.loader');
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }, 1000);
  });