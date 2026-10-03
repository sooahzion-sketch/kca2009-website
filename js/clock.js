// ===== 교육 역사 아날로그 다이얼 시계 =====
(function() {
  const open = new Date(2012, 8, 20);

  // 0~max 숫자 칼럼 생성
  function buildDigit(id, max) {
    const el = document.getElementById(id);
    if (!el) return;
    const col = document.createElement('div');
    col.className = 'dial-col';
    for (let i = 0; i <= max; i++) {
      const s = document.createElement('span');
      s.textContent = i;
      col.appendChild(s);
    }
    el.appendChild(col);
    el._col = col;
    el._prev = -1;
  }

  function setDigit(id, val) {
    const el = document.getElementById(id);
    if (!el || !el._col || el._prev === val) return;
    el._col.style.transform = 'translateY(-' + (val * 1.15) + 'em)';
    el._prev = val;
  }

  // 십의자리(0-5), 일의자리(0-9)
  buildDigit('dh1', 2); buildDigit('dh0', 9);
  buildDigit('dm1', 5); buildDigit('dm0', 9);
  buildDigit('ds1', 5); buildDigit('ds0', 9);

  function updateClock() {
    const diff = Date.now() - open.getTime();
    const days = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const daysEl = document.getElementById('dial-days');
    if (daysEl) daysEl.textContent = days.toLocaleString();
    setDigit('dh1', Math.floor(h / 10)); setDigit('dh0', h % 10);
    setDigit('dm1', Math.floor(m / 10)); setDigit('dm0', m % 10);
    setDigit('ds1', Math.floor(s / 10)); setDigit('ds0', s % 10);
  }

  // 다이얼이 빠르게 돌다가 실제 값에 멈추는 효과
  function spinToValue(id, target, duration) {
    const el = document.getElementById(id);
    if (!el || !el._col) return;
    const max = id.endsWith('1') ? (id.startsWith('dh') ? 2 : 5) : 9;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      if (p < 1) {
        const fake = Math.floor(Math.random() * (max + 1));
        el._col.style.transform = 'translateY(-' + (fake * 1.15) + 'em)';
        requestAnimationFrame(tick);
      } else {
        el._col.style.transform = 'translateY(-' + (target * 1.15) + 'em)';
        el._prev = target;
      }
    }
    el._col.style.transition = 'none';
    requestAnimationFrame(tick);
    setTimeout(() => { el._col.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.3, 1)'; }, duration + 50);
  }

  function spinDays(target, duration) {
    const el = document.getElementById('dial-days');
    if (!el) return;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      if (p < 1) {
        const fake = target - Math.floor(Math.random() * 20);
        el.textContent = fake.toLocaleString();
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString();
      }
    }
    requestAnimationFrame(tick);
  }

  window._kcaSpinUnit = function(unit) {
    const diff = Date.now() - open.getTime();
    const days = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const dur = 600;
    if (unit === 1) spinDays(days, dur);
    if (unit === 2) { spinToValue('dh1', Math.floor(h/10), dur); spinToValue('dh0', h%10, dur); }
    if (unit === 3) { spinToValue('dm1', Math.floor(m/10), dur); spinToValue('dm0', m%10, dur); }
    if (unit === 4) { spinToValue('ds1', Math.floor(s/10), dur); spinToValue('ds0', s%10, dur); }
  };

  window._kcaStartClock = function() {
    updateClock();
    setInterval(updateClock, 1000);
  };
  window._kcaDays = Math.floor((Date.now() - open.getTime()) / 86400000);
})();