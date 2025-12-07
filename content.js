(() => {
  let lastMaxStake = null;

  const updateModalText = () => {
    const modal = document.querySelector('[data-testid="betslip-error-modal-content"]');
    if (!modal || lastMaxStake === null) return false;
    const msg = modal.querySelector(".x2texei");
    if (msg) msg.textContent = `Vedon maksimipanos on ${lastMaxStake}€`;
    return !!msg;
  };

  const onNewStake = () => {
    updateModalText();
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (updateModalText() || attempts >= 10) clearInterval(timer);
    }, 150);
  };

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const { type, payload } = event.data || {};
    if (type === "BET_MAX_STAKE" && payload) {
      lastMaxStake = payload.max;
      onNewStake();
    }
  });

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("page.js");
  script.onload = () => script.remove();
  (document.documentElement || document.head || document.body).appendChild(script);
})();