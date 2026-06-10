(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setError(shell) {
        var message = document.createElement("div");
        message.className = "player-error";
        message.textContent = "视频暂时无法播放，请稍后再试";
        shell.appendChild(message);
    }

    window.MoviePlayer = function (options) {
        ready(function () {
            var video = document.querySelector(options.video || "#movieVideo");
            var cover = document.querySelector(options.cover || "#playerCover");
            if (!video || !options.source) {
                return;
            }
            var shell = video.closest(".player-shell") || video.parentElement;
            var hls = null;
            var initialized = false;

            function attach() {
                if (initialized) {
                    return Promise.resolve();
                }
                initialized = true;
                video.controls = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(options.source);
                    hls.attachMedia(video);
                    return new Promise(function (resolve) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setError(shell);
                            }
                        });
                    });
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = options.source;
                    return Promise.resolve();
                }
                setError(shell);
                return Promise.reject(new Error("unsupported"));
            }

            function play() {
                attach().then(function () {
                    if (cover) {
                        cover.style.display = "none";
                    }
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {
                            if (cover) {
                                cover.style.display = "";
                            }
                        });
                    }
                }).catch(function () {});
            }

            if (cover) {
                cover.addEventListener("click", play);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    };
})();
