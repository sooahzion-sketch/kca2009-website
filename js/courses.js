// ===== 과정 시작일 기준 자동 숨김/당일 표시 =====
(function() {
  var today = new Date();
  today.setHours(0,0,0,0);
  var year = today.getFullYear();

  document.querySelectorAll('.course-item').forEach(function(item) {
    var startStr = item.dataset.start;
    if (!startStr) return;
    var parts = startStr.split('.');
    if (parts.length < 2) return;
    var startDate = new Date(year, parseInt(parts[0],10) - 1, parseInt(parts[1],10));
    startDate.setHours(0,0,0,0);

    if (startDate.getTime() < today.getTime()) {
      // 시작일 지남 → 숨김
      item.style.display = 'none';
    } else if (startDate.getTime() === today.getTime()) {
      // 당일 → 버튼을 "당일마감"으로 변경
      var btn = item.querySelector('.c-btn');
      if (btn) {
        btn.textContent = '당일마감';
        btn.className = 'c-btn c-btn--today';
        btn.href = 'tel:01025198585';
      }
      var state = item.querySelector('.c-state');
      if (state) {
        state.textContent = '당일마감';
        state.className = 'c-state c-state--active';
        state.style.color = '#dc2626';
        state.style.borderColor = '#dc2626';
        state.style.background = 'rgba(220,38,38,0.08)';
      }
    }
  });
})();

// ===== 신청인원 실시간 표시 — 2026-08-11 폐기 =====
// 건우님 지시("그냥 모집 인원수 표시를 하지말자")로 카드에서 신청현황 항목 자체를 없앴다.
// 종전엔 enrollments.json을 fetch해 '신청현황' dl의 dd를 'N / M명'으로 덮어썼다.
// enrollments.json 파일 자체는 계속 생성된다(오피스 등 다른 소비처가 있음) — 홈페이지만 안 읽는다.
// 되살리려면 이 블록과 함께 홈페이지서버 main.go의 카드 템플릿 dl을 복원해야 한다.

// ===== 모집과정 중 최대 국비지원율 자동 표시 =====
(function() {
  var max = 0;
  document.querySelectorAll('input[name="q-course"]').forEach(function(el) {
    var total = parseInt(el.dataset.total, 10) || 0;
    var self = parseInt(el.dataset.self, 10) || 0;
    if (total > 0) max = Math.max(max, Math.round((1 - self / total) * 100));
  });
  var target = document.getElementById('gov-max-support');
  if (target && max > 0) target.textContent = '국가지원 과정별 최대 ' + max + '%';
})();

// ===== 과정 카드 c-main 클릭 → 과정 페이지 이동 =====
// URL은 HTML의 onclick 속성에서 읽음 (courses.json pageUrl 별도 관리 불필요)
(function() {
  document.querySelectorAll('.course-item').forEach(function(item) {
    var main = item.querySelector('.c-main');
    if (!main) return;
    var m = (main.getAttribute('onclick') || '').match(/location\.href='([^']+)'/);
    if (!m) return;
    main.style.cursor = 'pointer';
    main.addEventListener('click', function() {
      location.href = m[1];
    });
  });
})();

// ===== 개업일 기준 연수 자동 계산 (2012-09-20, 만 기준) =====
document.querySelectorAll('.kca-years').forEach(el => {
  const now = new Date();
  let y = now.getFullYear() - 2012;
  if (now.getMonth() < 8 || (now.getMonth() === 8 && now.getDate() < 20)) y--;
  el.textContent = y;
});