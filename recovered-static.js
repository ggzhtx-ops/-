(function () {
  function recover() {
    if (location.pathname === "/about/about" || location.pathname === "/about/about/") {
      history.replaceState(null, "", "/about/" + location.search + location.hash);
    }

    document.documentElement.classList.add("is-ready", "recovered-static");
    document.documentElement.classList.remove("no-js");

    ["canvas", "transition-overlay", "preloader", "input-blocker", "video-overlay", "scroll-indicator"].forEach(function (id) {
      var element = document.getElementById(id);
      if (!element) return;
      element.style.setProperty("display", "none", "important");
      element.style.setProperty("visibility", "hidden", "important");
      element.style.setProperty("opacity", "0", "important");
      element.style.setProperty("pointer-events", "none", "important");
    });

    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
  }

  recover();
  window.addEventListener("DOMContentLoaded", recover);
  window.addEventListener("load", recover);
  setInterval(recover, 1000);
})();
