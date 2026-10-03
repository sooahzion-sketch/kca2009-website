// 모바일에서만 새로고침 시 스크롤 위치 자동복원 방지
if ('scrollRestoration' in history && window.innerWidth <= 768) {
  history.scrollRestoration = 'manual';
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 72;
      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// 페이지 로드 시 hash 있으면 스크롤 후 제거
if (window.location.hash) {
  var hashTarget = document.querySelector(window.location.hash);
  if (hashTarget) {
    setTimeout(function() {
      var offset = 72;
      var y = hashTarget.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(function() {
        history.replaceState(null, '', window.location.pathname);
      }, 600);
    }, 100);
  } else {
    history.replaceState(null, '', window.location.pathname);
  }
}

// ===== Nav Active 표시 =====
(function() {
  var path = location.pathname;
  var isHome = (path === '/' || path === '/index.html');

  // 서브 페이지: 경로 매칭 (칼럼, 갤러리 등)
  if (!isHome) {
    document.querySelectorAll('nav .nav-link').forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href || href.startsWith('/#')) return;
      var hrefClean = href.replace(/\.html$/, '').replace(/\/$/, '') || '/';
      if (href.startsWith('/') && path.startsWith(hrefClean)) {
        if (hrefClean === '/' && path !== '/') return;
        link.classList.add('nav-active');
      }
    });
    return;
  }

  // 메인 페이지: 스크롤 위치 기반 active
  var hashLinks = [];
  document.querySelectorAll('nav .nav-link').forEach(function(link) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('/#')) {
      var id = href.substring(2);
      var sec = document.getElementById(id);
      if (sec) hashLinks.push({ link: link, section: sec });
    }
  });

  if (hashLinks.length === 0) return;

  function updateActive() {
    var scrollY = window.pageYOffset + 120;
    var active = null;
    hashLinks.forEach(function(item) {
      if (item.section.offsetTop <= scrollY) active = item;
    });
    hashLinks.forEach(function(item) { item.link.classList.remove('nav-active'); });
    if (active) active.link.classList.add('nav-active');
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();