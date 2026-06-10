(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function boot(url) {
    ready(function () {
      var video = document.getElementById("moviePlayer");
      var button = document.getElementById("playerStart");
      var active = false;
      var hls = null;

      if (!video || !button || !url) {
        return;
      }

      function attach() {
        if (active) {
          return;
        }
        active = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function start() {
        attach();
        button.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!active) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  window.MoviePlayer = {
    boot: boot
  };
})();
