(function () {
    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = selectAll('.hero-slide');
    var tabs = selectAll('.hero-tab');
    var activeIndex = 0;

    function activateSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        tabs.forEach(function (tab, tabIndex) {
            tab.classList.toggle('is-active', tabIndex === activeIndex);
        });
    }

    tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () {
            activateSlide(index);
        });
    });

    if (slides.length > 1) {
        activateSlide(0);
        window.setInterval(function () {
            activateSlide(activeIndex + 1);
        }, 5200);
    }

    var searchPanel = document.querySelector('[data-search-panel]');

    if (searchPanel) {
        var keywordInput = searchPanel.querySelector('[data-search-keyword]');
        var genreInput = searchPanel.querySelector('[data-search-genre]');
        var regionInput = searchPanel.querySelector('[data-search-region]');
        var cards = selectAll('[data-movie-card]');
        var countNode = searchPanel.querySelector('[data-result-count]');
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q');

        if (initialKeyword && keywordInput) {
            keywordInput.value = initialKeyword;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var genre = normalize(genreInput && genreInput.value);
            var region = normalize(regionInput && regionInput.value);
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type')
                ].join(' '));
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var ok = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }

                if (genre && cardGenre.indexOf(genre) === -1) {
                    ok = false;
                }

                if (region && cardRegion.indexOf(region) === -1) {
                    ok = false;
                }

                card.classList.toggle('hide-card', !ok);

                if (ok) {
                    shown += 1;
                }
            });

            if (countNode) {
                countNode.textContent = '当前显示 ' + shown + ' 部影片';
            }
        }

        [keywordInput, genreInput, regionInput].forEach(function (input) {
            if (input) {
                input.addEventListener('input', applyFilter);
                input.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }
}());
