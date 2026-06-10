(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
        var current = 0;
        var showSlide = function (index) {
            slides[current].classList.remove("active");
            if (dots[current]) {
                dots[current].classList.remove("active");
            }
            current = index;
            slides[current].classList.add("active");
            if (dots[current]) {
                dots[current].classList.add("active");
            }
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide((current + 1) % slides.length);
        }, 5200);
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    filterForms.forEach(function (form) {
        var input = form.querySelector("input");
        var listSelector = form.getAttribute("data-filter-target");
        var list = document.querySelector(listSelector);
        var empty = document.querySelector(form.getAttribute("data-empty-target"));
        if (!input || !list) {
            return;
        }
        var items = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var runFilter = function () {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            items.forEach(function (item) {
                var text = [
                    item.getAttribute("data-title") || "",
                    item.getAttribute("data-category") || "",
                    item.getAttribute("data-region") || "",
                    item.getAttribute("data-tags") || ""
                ].join(" ").toLowerCase();
                var matched = !query || text.indexOf(query) !== -1;
                item.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        };
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            runFilter();
        });
        input.addEventListener("input", runFilter);
    });

    var heroSearch = document.querySelector("[data-hero-search]");
    if (heroSearch) {
        heroSearch.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = heroSearch.querySelector("input");
            var query = input ? input.value.trim() : "";
            if (query) {
                window.location.href = "search.html?q=" + encodeURIComponent(query);
            } else {
                window.location.href = "search.html";
            }
        });
    }

    var searchPageInput = document.querySelector("[data-search-input]");
    if (searchPageInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (q) {
            searchPageInput.value = q;
            searchPageInput.dispatchEvent(new Event("input"));
        }
    }

    var player = document.querySelector("[data-player]");
    if (player) {
        var video = player.querySelector("video");
        var playButton = player.querySelector("[data-play]");
        var muteButton = player.querySelector("[data-mute]");
        var fullButton = player.querySelector("[data-fullscreen]");
        var sourceElement = video ? video.querySelector("source") : null;
        var sourceUrl = sourceElement ? sourceElement.getAttribute("src") : "";
        var ready = false;
        var hlsInstance = null;

        var prepareVideo = function () {
            if (!video || ready) {
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        player.classList.add("player-error");
                    }
                });
            } else {
                player.classList.add("player-error");
            }
        };

        var refreshButton = function () {
            if (!playButton || !video) {
                return;
            }
            playButton.textContent = video.paused ? "▶" : "Ⅱ";
        };

        var togglePlay = function () {
            prepareVideo();
            if (!video) {
                return;
            }
            if (video.paused) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            } else {
                video.pause();
            }
            window.setTimeout(refreshButton, 80);
        };

        if (playButton) {
            playButton.addEventListener("click", togglePlay);
        }
        if (video) {
            video.addEventListener("click", togglePlay);
            video.addEventListener("play", refreshButton);
            video.addEventListener("pause", refreshButton);
            video.addEventListener("ended", refreshButton);
        }
        if (muteButton && video) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "🔇" : "🔊";
            });
        }
        if (fullButton && video) {
            fullButton.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
            });
        }
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
