(() => {
  const send = (payload) => window.postMessage({ type: "BET_MAX_STAKE", payload }, "*");

  const checkData = (data, source) => {
    const failures = data?.betFailure;
    const first = Array.isArray(failures) ? failures[0] : undefined;
    if (first && Object.prototype.hasOwnProperty.call(first, "betMaxStake")) {
      send({ max: first.betMaxStake, failure: first, source });
    }
  };

  const handleJson = async (res, source) => {
    try {
      const data = await res.clone().json();
      checkData(data, source);
    } catch (_) {}
  };

  if (window.fetch) {
    const origFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await origFetch(...args);
      handleJson(res, "fetch");
      return res;
    };
  }

  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (...args) {
    this.addEventListener("load", function () {
      try {
        if (this.responseType === "" || this.responseType === "text") {
          handleJson(new Response(this.responseText), "xhr-text");
        } else if (this.responseType === "json" && this.response) {
          checkData(this.response, "xhr-json");
        }
      } catch (_) {}
    });
    return origOpen.apply(this, args);
  };
})();