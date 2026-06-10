(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-target]'));
    var index = 0;

    function showSlide(nextIndex) {
      index = nextIndex % slides.length;
      if (index < 0) {
        index = slides.length - 1;
      }

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-target')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMovieFilter(panel) {
    var input = panel.querySelector('[data-filter-input]');
    var select = panel.querySelector('[data-filter-type]');
    var list = document.querySelector('[data-movie-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var selectedType = normalize(select ? select.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !selectedType || cardType.indexOf(selectedType) !== -1;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedType));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }

    var syncInput = panel.querySelector('[data-query-sync]');

    if (syncInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query) {
        syncInput.value = query;
        applyFilter();
      }
    }
  }

  document.querySelectorAll('[data-filter-panel]').forEach(setupMovieFilter);

  var categorySearch = document.querySelector('[data-category-search]');
  var categoryList = document.querySelector('[data-category-list]');

  if (categorySearch && categoryList) {
    var categoryTiles = Array.prototype.slice.call(categoryList.querySelectorAll('.category-tile'));

    categorySearch.addEventListener('input', function () {
      var keyword = normalize(categorySearch.value);

      categoryTiles.forEach(function (tile) {
        var haystack = normalize(tile.textContent + ' ' + tile.getAttribute('data-title'));
        tile.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');
    var stream = shell.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function attachStream() {
      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = stream;
        playVideo();
      }

      shell.classList.add('is-playing');
    }

    if (overlay) {
      overlay.addEventListener('click', attachStream);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        attachStream();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('.player-shell[data-stream]').forEach(setupPlayer);
})();