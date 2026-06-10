(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero-slider]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide-to]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var containers = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    if (!containers.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));
    var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    inputs.forEach(function (input) {
      if (q && !input.value) {
        input.value = q;
      }
    });

    function apply() {
      var query = normalize(inputs.map(function (input) { return input.value; }).filter(Boolean).join(' '));
      var year = selects.length ? normalize(selects[0].value) : '';
      containers.forEach(function (container) {
        var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-filter-text'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !year || cardYear === year;
          var ok = matchQuery && matchYear;
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        var empty = document.querySelector('[data-no-results]');
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
}());
