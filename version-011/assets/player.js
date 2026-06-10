import { H as Hls } from './hls-vendor-dru42stk.js';

function initialisePlayer(video) {
  var source = video.getAttribute('data-video-src');
  var shell = video.closest('[data-player-shell]');
  var message = shell ? shell.querySelector('[data-player-message]') : null;
  var overlay = shell ? shell.querySelector('[data-play-button]') : null;

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  if (!source) {
    setMessage('当前影片未配置播放地址。');
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setMessage('高清 HLS 片源已就绪，点击播放按钮即可观看。');
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setMessage('播放器加载遇到问题，可刷新页面或稍后重试。');
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setMessage('浏览器原生 HLS 播放已就绪，点击播放按钮即可观看。');
  } else {
    video.src = source;
    setMessage('当前浏览器可能不支持 HLS 播放，请使用较新的 Chrome、Edge、Safari 或移动浏览器。');
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      hideOverlay();
      video.play().catch(function () {
        setMessage('浏览器阻止了自动播放，请再次点击播放器控制栏播放。');
      });
    });
  }

  video.addEventListener('play', hideOverlay);
}

document.querySelectorAll('video[data-video-src]').forEach(initialisePlayer);
