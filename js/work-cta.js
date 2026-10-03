/* work-cta.js — 교육분야 페이지 CTA 자동화
 * body[data-work-course] 로 관련 과정명 지정
 * schedule.json에서 가장 가까운 모집 중 과정을 자동 표시
 */
(function () {
  var courseKey = document.body.getAttribute('data-work-course');
  if (!courseKey) return;

  var pageMap = {
    '자동차광택코팅+디테일링스팀세차과정': 'polishing.html',
    '자동차썬팅과정': 'tinting.html',
    '자동차덴트복원 입문과정': 'dent.html',
    '자동차랩핑 입문과정': 'wrapping.html',
    '자동차디테일링스팀세차과정': 'steam.html',
    '자동차진단평가사과정(이론+실기)': 'inspector.html'
    // 자동차에바크리닝과정: HRD-Net 미등록 수동 과정 — 의도적으로 제외
  };

  function fmt(d) { return d.replace(/-/g, '.'); }

  function apply(courses) {
    var today = new Date().toISOString().slice(0, 10);
    var matched = courses.filter(function (c) { return c.name === courseKey; });
    if (!matched.length) return;

    /* 시작일 >= 오늘인 과정 중 가장 빠른 것, 없으면 가장 마지막 과정 */
    matched.sort(function (a, b) {
      var da = (a.schedule || [])[0] ? a.schedule[0].date : '';
      var db = (b.schedule || [])[0] ? b.schedule[0].date : '';
      return da < db ? -1 : 1;
    });
    var target = matched.find(function (c) {
      return c.schedule && c.schedule[0] && c.schedule[0].date >= today;
    }) || matched[matched.length - 1];

    var dates = (target.schedule || []).map(function (s) { return s.date; }).sort();
    var startDate = dates[0];
    var endDate = dates[dates.length - 1];
    var pageFile = pageMap[target.name] || '';

    var infoEl = document.getElementById('cta-course-info');
    if (infoEl) {
      infoEl.textContent = target.name + ' (' + fmt(startDate) + ' ~ ' + fmt(endDate) + ') 과정이 현재 모집중에 있습니다.';
    }

    var btnEl = document.getElementById('cta-course-btn');
    if (btnEl && pageFile) {
      btnEl.href = '../courses/' + pageFile;
    }
  }

  /* /#check 링크에 ?course=과정명 파라미터 자동 추가 */
  document.querySelectorAll('a[href*="/#check"]').forEach(function (a) {
    var url = new URL(a.href, location.href);
    url.searchParams.set('course', courseKey);
    a.href = url.toString();
  });

  fetch('../data/schedule.json')
    .then(function (r) { return r.json(); })
    .then(apply)
    .catch(function () { /* fallback: hardcoded 값 유지 */ });
})();
