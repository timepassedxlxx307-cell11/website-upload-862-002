(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var menuButton = document.querySelector("[data-menu-button]");
    if (header && menuButton) {
      menuButton.addEventListener("click", function () {
        header.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function setHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setHero(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setHero(current + 1);
      }, 5000);
    }

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var input = root.querySelector("[data-search-input]");
      var typeFilter = root.querySelector("[data-type-filter]");
      var yearFilter = root.querySelector("[data-year-filter]");
      var regionFilter = root.querySelector("[data-region-filter]");
      var reset = root.querySelector("[data-reset-filters]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      var empty = root.querySelector("[data-empty]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (input && query) {
        input.value = query;
      }

      function matchText(card, value) {
        if (!value) {
          return true;
        }
        return (card.getAttribute("data-search") || "").toLowerCase().indexOf(value) !== -1;
      }

      function matchValue(card, attr, value) {
        if (!value) {
          return true;
        }
        return (card.getAttribute(attr) || "").indexOf(value) !== -1;
      }

      function applyFilters() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var typeValue = typeFilter ? typeFilter.value : "";
        var yearValue = yearFilter ? yearFilter.value : "";
        var regionValue = regionFilter ? regionFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var ok = matchText(card, text) &&
            matchValue(card, "data-type", typeValue) &&
            matchValue(card, "data-year", yearValue) &&
            matchValue(card, "data-region", regionValue);
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, typeFilter, yearFilter, regionFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (typeFilter) {
            typeFilter.value = "";
          }
          if (yearFilter) {
            yearFilter.value = "";
          }
          if (regionFilter) {
            regionFilter.value = "";
          }
          applyFilters();
        });
      }

      applyFilters();
    });
  });
})();
