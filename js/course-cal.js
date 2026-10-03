/* course-cal.js — HRD-Net schedule.json 기반 달력 렌더링
 * 과정 페이지 <body data-course-name="..."> 에 과정명 지정
 * fetch('../data/schedule.json') → 매칭 → 달력·시간 자동 렌더링
 */
(function () {
  var body = document.body;
  var courseName = body.getAttribute('data-course-name');
  if (!courseName) return;

  function run(courses) {
    var cd = null;
    for (var i = 0; i < courses.length; i++) {
      if (courses[i].name === courseName) { cd = courses[i]; break; }
    }
    if (!cd) { console.warn('course-cal: 과정 없음 —', courseName); return; }
    renderTime(cd);
    renderRound(cd);
    renderCalendar(cd);
    updateContactLinks(cd);
  }

  /* fetch 실패 시 페이지 내 course-json fallback */
  function fallback() {
    var el = document.getElementById('course-json');
    if (!el) return;
    try { run([JSON.parse(el.textContent)]); } catch(e) {}
  }

  fetch('../data/schedule.json')
    .then(function (r) { return r.json(); })
    .then(run)
    .catch(fallback);

  /* ── 수업시간 자동 반영 ── */
  function renderTime(cd) {
    var el = document.getElementById('cal-time-val');
    if (el && cd.dailyTime) el.textContent = cd.dailyTime;
  }

  /* ── course-en 차수 업데이트 ── */
  function renderRound(cd) {
    if (!cd.round || !cd.schedule || !cd.schedule.length) return;
    var roundLabel = cd.round;

    /* 헤더 course-en */
    var enEl = document.querySelector('.course-en');
    if (enEl) {
      var text = enEl.textContent;
      var sep = text.indexOf(' · ');
      if (sep !== -1) enEl.textContent = text.slice(0, sep) + ' · ' + roundLabel;
    }

    /* 훈련 일정 과정명 옆 차수 */
    var nameEl = document.querySelector('.cal-course-name');
    if (nameEl && !nameEl.querySelector('.cal-course-round')) {
      var span = document.createElement('span');
      span.className = 'cal-course-round';
      span.textContent = '(' + roundLabel + ')';
      span.style.cssText = 'margin-left:6px;';
      var dateEl = nameEl.querySelector('.cal-course-date');
      nameEl.insertBefore(span, dateEl || null);
    }
  }

  /* ── 달력 렌더링 ── */
  function renderCalendar(cd) {
    var calEl = document.getElementById('cal-months');
    if (!calEl) return;
    /* 위젯이 이미 주입한 경우 스킵 */
    if (calEl.querySelector('.cal-month')) return;

    var smap = {};
    var lastTrainDate = null;
    var weekendTrainCount = 0, weekdayTrainCount = 0;

    (cd.schedule || []).forEach(function (s) {
      smap[s.date] = s.type;
      if (s.type === '훈련') {
        lastTrainDate = s.date;
        var dow = new Date(s.date).getDay();
        if (dow === 0 || dow === 6) weekendTrainCount++; else weekdayTrainCount++;
      }
    });

    /* 주말 과정 여부: 훈련일이 주말에만 있거나 주말 훈련일이 더 많은 경우 */
    var isWeekendCourse = weekendTrainCount > 0 && weekendTrainCount >= weekdayTrainCount;

    /* 마지막 훈련일 → 수료 (noGraduation 과정은 제외, 끝까지 훈련 표시) */
    if (lastTrainDate && !cd.noGraduation) smap[lastTrainDate] = '수료';

    var todayStr = new Date().toISOString().slice(0, 10);

    function pad(n) { return String(n).padStart(2, '0'); }

    /* dailyTime/lunchTime으로 1일 교육시간 계산 (없으면 8) */
    function dailyHours(cd) {
      function span(t) {
        if (!t || t.indexOf('~') < 0) return 0;
        var p = t.split('~');
        function m(s) { var a = s.split(':'); return (+a[0]) * 60 + (+a[1] || 0); }
        return (m(p[1]) - m(p[0])) / 60;
      }
      var work = span(cd.dailyTime);
      if (!work) return 8;
      return work - span(cd.lunchTime);
    }

    /* 훈련 일수 카운트 (수료 포함) */
    function countTrain(year, month) {
      var days = new Date(year, month, 0).getDate();
      var n = 0;
      for (var d = 1; d <= days; d++) {
        var t = smap[year + '-' + pad(month) + '-' + pad(d)];
        if (t === '훈련' || t === '수료') n++;
      }
      return n;
    }

    function buildMonth(year, month, label) {
      var firstDay = new Date(year, month - 1, 1).getDay();
      var daysInMonth = new Date(year, month, 0).getDate();
      var trainCount = countTrain(year, month);

      var h = '<div class="cal-month">';
      h += '<div class="cal-month-header">' + label + '<span>훈련 ' + trainCount + '일</span></div>';
      h += '<div class="cal-grid"><div class="cal-dow-row">';
      ['일', '월', '화', '수', '목', '금', '토'].forEach(function (d) {
        h += '<div class="cal-dow">' + d + '</div>';
      });
      h += '</div>';

      var cells = [];
      for (var i = 0; i < firstDay; i++) cells.push(null);
      for (var d = 1; d <= daysInMonth; d++) cells.push(d);
      while (cells.length % 7 !== 0) cells.push(null);

      for (var w = 0; w < cells.length / 7; w++) {
        h += '<div class="cal-week">';
        for (var c = 0; c < 7; c++) {
          var dn = cells[w * 7 + c];
          if (dn === null) { h += '<div class="cal-day"></div>'; continue; }
          var ds = year + '-' + pad(month) + '-' + pad(dn);
          var type = smap[ds];
          var cls = ['cal-day'];
          var isWeekend = (c === 0 || c === 6);
          if (c === 0) cls.push('cal-day--sun');
          if (c === 6) cls.push('cal-day--sat');
          var lbl = '';
          if (type === '수료') { cls.push('cal-day--grad'); lbl = '수료'; }
          else if (type === '훈련') { cls.push('cal-day--train'); lbl = '훈련'; }
          else if (type === '휴강' && (isWeekendCourse ? isWeekend : !isWeekend)) { cls.push('cal-day--off'); lbl = '휴강'; }
          else { cls.push('cal-day--outside'); }
          if (ds === todayStr) cls.push('cal-day--today');
          h += '<div class="' + cls.join(' ') + '"><span class="cal-day-num">' + dn + '</span>';
          if (lbl) h += '<span class="cal-day-label">' + lbl + '</span>';
          h += '</div>';
        }
        h += '</div>';
      }
      var dailyTime = cd.dailyTime || '09:00~18:00';
      h += '</div><div class="cal-summary">총 <strong>' + trainCount + '일</strong> · ' + dailyTime + ' · 1일 ' + dailyHours(cd) + '시간</div></div>';
      return h;
    }

    /* 과정 기간의 월 범위 계산 */
    var dates = Object.keys(smap).sort();
    if (!dates.length) return;
    var firstDate = new Date(dates[0]);
    var lastDate = new Date(dates[dates.length - 1]);

    var html = '';
    var y = firstDate.getFullYear(), m = firstDate.getMonth() + 1;
    var endY = lastDate.getFullYear(), endM = lastDate.getMonth() + 1;
    while (y < endY || (y === endY && m <= endM)) {
      html += buildMonth(y, m, y + '년 ' + m + '월');
      m++;
      if (m > 12) { m = 1; y++; }
    }
    calEl.innerHTML = html;
  }

  /* /#check 상담신청 링크에 ?course=과정명&start=시작날짜 파라미터 자동 추가 */
  function updateContactLinks(cd) {
    var startDate = (cd.schedule && cd.schedule.length) ? cd.schedule[0].date : '';
    document.querySelectorAll('a[href*="/#check"]').forEach(function (a) {
      var url = new URL(a.href, location.href);
      url.searchParams.set('course', courseName);
      if (startDate) url.searchParams.set('start', startDate);
      a.href = url.toString();
    });
  }
})();
