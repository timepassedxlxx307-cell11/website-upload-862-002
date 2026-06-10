(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobile = document.querySelector('[data-mobile-nav]');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var region = scope.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        if (r && card.getAttribute('data-region') !== r) {
          ok = false;
        }
        card.hidden = !ok;
      });
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (region) {
      region.addEventListener('change', apply);
    }
    if (scope.hasAttribute('data-search-page') && input) {
      var params = new URLSearchParams(window.location.search);
      var value = params.get('q');
      if (value) {
        input.value = value;
      }
    }
    apply();
  });

  var video = document.querySelector('[data-player-video]');
  var playButton = document.querySelector('[data-player-button]');
  if (video && typeof playerSource !== 'undefined') {
    var attached = false;
    var hlsInstance = null;
    var attachSource = function () {
      if (attached) {
        return;
      }
      attached = true;
      var source = playerSource;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    var start = function () {
      attachSource();
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    };
    if (playButton) {
      playButton.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!attached) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
