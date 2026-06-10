(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function run() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                run();
            });
        });
        show(0);
        run();
    }

    function initSearch() {
        var scope = document.querySelector("[data-search-scope]");
        var input = document.querySelector("[data-search-input]");
        if (!scope || !input) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        var activeFilter = "all";
        if (query) {
            input.value = query;
        }
        function apply() {
            var needle = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year")
                ].join(" "));
                var filterText = normalize(card.getAttribute("data-filter"));
                var okText = !needle || text.indexOf(needle) !== -1;
                var okFilter = activeFilter === "all" || filterText.indexOf(activeFilter) !== -1 || text.indexOf(activeFilter) !== -1;
                var showCard = okText && okFilter;
                card.style.display = showCard ? "" : "none";
                if (showCard) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        input.addEventListener("input", apply);
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = normalize(button.getAttribute("data-filter-value"));
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    function attachVideo(video, source) {
        if (!video || video.getAttribute("data-ready") === "1") {
            return;
        }
        video.setAttribute("data-ready", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        video.src = source;
    }

    function initPlayer(source, poster) {
        var video = document.querySelector("[data-video-player]");
        var overlay = document.querySelector("[data-player-overlay]");
        if (!video || !source) {
            return;
        }
        if (poster && !video.getAttribute("poster")) {
            video.setAttribute("poster", poster);
        }
        function start() {
            attachVideo(video, source);
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.getAttribute("data-ready") !== "1") {
                start();
            }
        });
        video.addEventListener("play", function () {
            attachVideo(video, source);
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    }

    window.SitePlayer = {
        start: initPlayer
    };

    ready(function () {
        initMenu();
        initHero();
        initSearch();
    });
})();
