(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
      var previous = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });

      if (previous) {
        previous.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-card-filter]').forEach(function (input) {
      var scopeSelector = input.getAttribute('data-card-filter') || 'body';
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-text]'));
      input.addEventListener('input', function () {
        var keyword = normalise(input.value);
        cards.forEach(function (card) {
          var haystack = normalise(card.getAttribute('data-search-text'));
          card.classList.toggle('hidden-by-filter', keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage && window.MOVIE_INDEX) {
      var form = searchPage.querySelector('[data-search-form]');
      var input = searchPage.querySelector('[data-search-input]');
      var resultBox = searchPage.querySelector('[data-search-results]');
      var countBox = searchPage.querySelector('[data-search-count]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';
      input.value = initialQuery;

      function cardHtml(movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="movie/' + movie.id + '.html">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="card-badge">' + escapeHtml(movie.type) + '</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <a class="card-title" href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a>',
          '    <p class="card-desc">' + escapeHtml(movie.one_line) + '</p>',
          '    <div class="card-meta">',
          '      <span>' + escapeHtml(movie.region) + '</span>',
          '      <span>' + escapeHtml(String(movie.year)) + '</span>',
          '      <span>' + escapeHtml(movie.category_name) + '</span>',
          '    </div>',
          '  </div>',
          '</article>'
        ].join('');
      }

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function render(query) {
        var keyword = normalise(query);
        var words = keyword.split(/\s+/).filter(Boolean);
        var results = window.MOVIE_INDEX.filter(function (movie) {
          if (!words.length) {
            return true;
          }
          var haystack = normalise([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre_raw,
            movie.tags,
            movie.one_line,
            movie.category_name
          ].join(' '));
          return words.every(function (word) {
            return haystack.indexOf(word) !== -1;
          });
        }).slice(0, 240);
        countBox.textContent = keyword ? '找到 ' + results.length + ' 条相关结果，最多显示前 240 条。' : '已展示片库前 240 条，可输入片名、地区、类型或标签继续筛选。';
        resultBox.innerHTML = results.map(cardHtml).join('');
      }

      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          var query = input.value.trim();
          var url = new URL(window.location.href);
          if (query) {
            url.searchParams.set('q', query);
          } else {
            url.searchParams.delete('q');
          }
          window.history.replaceState(null, '', url.toString());
          render(query);
        });
      }

      input.addEventListener('input', function () {
        render(input.value);
      });

      render(initialQuery);
    }
  });
})();
