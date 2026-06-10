(function () {
    var header = document.getElementById("siteHeader");
    var mobileButton = document.getElementById("mobileMenuButton");
    var mobileNav = document.getElementById("mobileNav");

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startHero();
            });
        });

        startHero();
    }

    var urlParams = new URLSearchParams(window.location.search);
    var initialQuery = urlParams.get("q") || "";
    var searchInput = document.getElementById("siteSearchInput");
    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }

    function applyFilter(input) {
        var targetSelector = input.getAttribute("data-filter-target") || "[data-card-list]";
        var container = document.querySelector(targetSelector);
        if (!container) {
            return;
        }
        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(container.querySelectorAll("[data-search]"));
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = (card.getAttribute("data-search") || "").toLowerCase();
            var matched = query === "" || haystack.indexOf(query) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        var empty = container.parentElement ? container.parentElement.querySelector(".no-results") : null;
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    filterInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            applyFilter(input);
        });
        applyFilter(input);
    });

    var chipButtons = Array.prototype.slice.call(document.querySelectorAll("[data-chip-filter]"));
    chipButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var panel = button.closest(".filter-bar");
            var input = panel ? panel.querySelector("[data-filter-input]") : null;
            if (!input) {
                return;
            }
            if (panel) {
                panel.querySelectorAll("[data-chip-filter]").forEach(function (item) {
                    item.classList.remove("active");
                });
            }
            button.classList.add("active");
            input.value = button.getAttribute("data-chip-filter") || "";
            applyFilter(input);
        });
    });
})();
