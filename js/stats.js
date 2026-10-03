// ===== stats.json에서 실제 값 로드 =====
(function() {
  fetch('data/stats.json?t=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var el = document.querySelector('[data-stat="graduates"]');
      if (el && d.graduates_total) el.dataset.count = d.graduates_total;
      var ep = document.querySelector('[data-stat="partners"]');
      if (ep && d.partners) ep.dataset.count = d.partners;
      // 페이지 내 졸업생 수 텍스트 동적 업데이트
      if (d.graduates_total) {
        var formatted = d.graduates_total.toLocaleString();
        document.querySelectorAll('.kca-graduates').forEach(function(s) {
          s.textContent = formatted;
        });
        // meta description
        var metas = document.querySelectorAll('meta[name="description"], meta[property="og:description"]');
        metas.forEach(function(m) {
          m.content = m.content.replace(/[\d,]+명 졸업생/, formatted + '명 졸업생');
        });
      }
    })
    .catch(function() {});
})();

// ===== 카운트업 애니메이션 =====
(function() {
  const duration = 1500;
  let fired = false;

  function animateCount(el) {
    const target = parseInt(el.dataset.count);
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * ease);
      el.textContent = val.toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateHistory() {
    if (window._kcaStartClock) window._kcaStartClock();
  }

  function onVisible() {
    if (fired) return;
    const bar = document.querySelector('.stats-bar');
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      fired = true;
      const p1 = document.getElementById('stats-phase1');
      const p2 = document.getElementById('stats-phase2');
      const p3 = document.getElementById('stats-phase3');
      const items = document.querySelectorAll('.stat-anim');
      let d = 0;

      // 1) 텍스트 중앙 등장
      setTimeout(() => { if (p1) p1.classList.add('visible'); }, d);
      d += 2000;

      // 텍스트 사라짐
      setTimeout(() => {
        if (p1) { p1.classList.remove('visible'); p1.classList.add('fade-out'); }
      }, d);
      d += 700;

      // 2) 시간 등장 + 다이얼 스핀
      setTimeout(() => {
        if (p1) p1.style.display = 'none';
        if (p2) p2.classList.add('visible');
        animateHistory();
      }, d);
      d += 300;

      document.querySelectorAll('.clock-unit').forEach(u => {
        const unit = parseInt(u.dataset.clock);
        setTimeout(() => {
          u.classList.add('visible');
          if (window._kcaSpinUnit) window._kcaSpinUnit(unit);
        }, d);
        d += 400;
      });
      d += 2500;

      // 시간 사라짐
      setTimeout(() => {
        if (p2) { p2.classList.remove('visible'); p2.classList.add('fade-out'); }
      }, d);
      d += 700;

      // 3) 결과물 등장
      setTimeout(() => {
        if (p2) p2.style.display = 'none';
        if (p3) p3.classList.add('visible');
      }, d);
      d += 300;

      items.forEach(el => {
        const order = parseInt(el.dataset.order);
        if (order < 3) return;
        setTimeout(() => {
          el.classList.add('visible');
          const num = el.querySelector('[data-count]');
          if (num) animateCount(num);
        }, d);
        d += duration + 200;
      });
    }
  }

  window.addEventListener('scroll', onVisible);
  onVisible();
})();