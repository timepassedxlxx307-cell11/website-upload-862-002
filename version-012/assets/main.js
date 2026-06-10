(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var toggle = qs('[data-nav-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
            document.body.classList.toggle('no-scroll', panel.classList.contains('open'));
        });
    }

    function initHero() {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        show(0);
    }

    function initSearchForms() {
        qsa('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
            });
        });
    }

    function initSearchPage() {
        var input = qs('[data-search-input]');
        var cards = qsa('[data-search-card]');
        var buttons = qsa('[data-filter-button]');
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var category = params.get('category') || 'all';
        input.value = query;
        function setActive(value) {
            buttons.forEach(function (button) {
                button.classList.toggle('active', button.getAttribute('data-filter-button') === value);
            });
        }
        function activeFilter() {
            var active = qs('[data-filter-button].active');
            return active ? active.getAttribute('data-filter-button') : category;
        }
        function apply() {
            var term = input.value.trim().toLowerCase();
            var filter = activeFilter();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var group = card.getAttribute('data-group') || '';
                var matchedTerm = !term || text.indexOf(term) !== -1;
                var matchedFilter = filter === 'all' || group === filter || text.indexOf(filter.toLowerCase()) !== -1;
                card.classList.toggle('hidden-by-search', !(matchedTerm && matchedFilter));
            });
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                setActive(button.getAttribute('data-filter-button'));
                apply();
            });
        });
        setActive(category);
        input.addEventListener('input', apply);
        apply();
    }

    function initPlayer() {
        var video = qs('#moviePlayer');
        var button = qs('#playMovie');
        var shell = qs('[data-video-shell]');
        if (!video || !button) {
            return;
        }
        var stream = button.getAttribute('data-stream');
        var started = false;
        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
        function start() {
            if (!stream) {
                return;
            }
            button.classList.add('is-hidden');
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        try {
                            hls.destroy();
                        } catch (error) {}
                        video.src = stream;
                        playVideo();
                    }
                });
                return;
            }
            video.src = stream;
            playVideo();
        }
        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                start();
            }
        });
        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === shell) {
                    start();
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHero();
        initSearchForms();
        initSearchPage();
        initPlayer();
    });
})();
