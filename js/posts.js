var YT_VIDEOS = ['6-z24ajO4S8', 'g1yy-8UV49U'];
var ytReady = false;
var ytReadyCallbacks = [];

window.onYouTubeIframeAPIReady = function() {
  ytReady = true;
  ytReadyCallbacks.forEach(function(cb) { cb(); });
  ytReadyCallbacks = [];
};

function onYTReady(cb) {
  if (ytReady) { cb(); } else { ytReadyCallbacks.push(cb); }
}

function loadYTAPI() {
  if (document.getElementById('yt-api-script')) return;
  var s = document.createElement('script');
  s.id = 'yt-api-script';
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
}

function getWatched() {
  return JSON.parse(localStorage.getItem('yt_watched') || '[]');
}
function markWatchedLocal(id) {
  var w = getWatched();
  if (w.indexOf(id) === -1) w.push(id);
  localStorage.setItem('yt_watched', JSON.stringify(w));
}
function recordView(id) {
  fetch('/api/video-view?id=' + id, { method: 'POST' }).catch(function() {});
}

function pickVideo(serverStats) {
  var watched = getWatched();
  var unwatched = YT_VIDEOS.filter(function(id) { return watched.indexOf(id) === -1; });
  var pool = unwatched.length > 0 ? unwatched : YT_VIDEOS;
  if (serverStats) {
    pool = pool.slice().sort(function(a, b) {
      return (serverStats[b] || 0) - (serverStats[a] || 0);
    });
    if (pool.length > 1 && Math.random() < 0.3) {
      return pool[1 + Math.floor(Math.random() * (pool.length - 1))];
    }
    return pool[0];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

var track = document.querySelector('.photo-strip-track');
function stripPause() { if (track) track.style.animationPlayState = 'paused'; }
function stripResume() { if (track) track.style.animationPlayState = ''; }

document.querySelectorAll('[data-youtube]').forEach(function(card) {
  var thumb = card.querySelector('.post-thumb');

  thumb.addEventListener('click', function() {
    if (thumb.querySelector('iframe')) return;

    fetch('/api/video-stats')
      .then(function(r) { return r.json(); })
      .catch(function() { return null; })
      .then(function(stats) {
        var id = pickVideo(stats);
        markWatchedLocal(id);
        recordView(id);

        var container = document.createElement('div');
        container.style.cssText = 'width:100%;height:100%;';
        thumb.innerHTML = '';
        thumb.appendChild(container);
        stripPause();

        loadYTAPI();
        onYTReady(function() {
          new YT.Player(container, {
            videoId: id,
            playerVars: { autoplay: 1, rel: 0 },
            events: {
              onStateChange: function(e) {
                if (e.data === YT.PlayerState.PLAYING) stripPause();
                else stripResume();
              }
            }
          });
        });

        var observer = new IntersectionObserver(function(entries) {
          if (!entries[0].isIntersecting) { stripResume(); observer.disconnect(); }
        }, { threshold: 0.1 });
        observer.observe(card);
      });
  });
});
