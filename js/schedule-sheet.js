// ===== 교육과정 날짜 표시 — 구글 시트(과정 | 반 | 시작일 | 종료일)를 읽어 각 과정 카드에 표시 =====
// 구글 시트 > 파일 > 공유 > 웹에 게시 > CSV 로 받은 링크를 아래에 넣으세요.
// (비워두면 data/일정.txt 를 대신 읽음)
var KCA_SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSujpNO0flnhY6_FnzU31_WgU8qxv5jxdijt0p9SwCR_OBu_OJebErFrx3oJqi3nLrJeDlyyRtkraMP/pub?gid=0&single=true&output=csv';

(function () {
  var COURSES = ['광택', '덴트', '랩핑', '썬팅'];
  var CLASSES = ['평일반', '주말반'];
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var DAYS = ['일', '월', '화', '수', '목', '금', '토'];

  // "2026-11-03", "2026. 11. 3", "11/3", "11.3", "11월 3일" → Date
  function parseDate(s) {
    if (!s) return null;
    var n = (s.match(/\d+/g) || []).map(Number);
    var y, m, d;
    if (n.length >= 3 && n[0] > 999) { y = n[0]; m = n[1]; d = n[2]; }
    else if (n.length >= 2) {
      m = n[0]; d = n[1]; y = today.getFullYear();
      // 연도 없이 적었는데 두 달 넘게 지난 날짜면 내년으로 봄 (12월에 1월 일정 적는 경우)
      if (new Date(y, m - 1, d) < new Date(today.getTime() - 60 * 864e5)) y += 1;
    } else return null;
    var dt = new Date(y, m - 1, d);
    return isNaN(dt) ? null : dt;
  }
  function fmt(dt) {
    return (dt.getMonth() + 1) + '.' + String(dt.getDate()).padStart(2, '0') + '(' + DAYS[dt.getDay()] + ')';
  }
  // "평일", "평일반", "주말" → 평일반/주말반, 그 외는 빈 값
  function toClass(s) {
    s = s || '';
    if (s.indexOf('평일') > -1) return '평일반';
    if (s.indexOf('주말') > -1) return '주말반';
    return '';
  }

  var src = KCA_SHEET_CSV
    ? KCA_SHEET_CSV + (KCA_SHEET_CSV.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now()
    : 'data/일정.txt?t=' + Date.now();

  fetch(src)
    .then(function (r) { return r.ok ? r.text() : ''; })
    .catch(function () { return ''; })
    .then(function (txt) {
      // 칸 순서는 제목 줄(과정/반/시작일/종료일)로 찾음 — 제목이 없으면 과정, 반, 시작일, 종료일 순서로 봄
      var col = { course: 0, cls: 1, start: 2, end: 3 };
      var list = {};
      COURSES.forEach(function (c) { list[c] = []; });

      txt.split(/\r?\n/).forEach(function (line) {
        line = line.trim();
        if (!line || line.charAt(0) === '#') return;
        var p = line.split(KCA_SHEET_CSV ? ',' : /[|｜]/).map(function (x) { return x.replace(/^"|"$/g, '').trim(); });

        if (p.indexOf('과정') > -1 && p.indexOf('시작일') > -1) {
          col = { course: p.indexOf('과정'), cls: p.indexOf('반'), start: p.indexOf('시작일'), end: p.indexOf('종료일') };
          return;
        }
        var key = COURSES.filter(function (c) { return (p[col.course] || '').indexOf(c) > -1; })[0];
        var start = parseDate(p[col.start]);
        if (!key || !start) return;
        var end = col.end > -1 ? parseDate(p[col.end]) : null;
        if ((end || start) < today) return; // 끝난 일정은 숨김
        list[key].push({ cls: col.cls > -1 ? toClass(p[col.cls]) : '', start: start, end: end });
      });

      document.querySelectorAll('#schedule .course-item').forEach(function (item) {
        var name = (item.querySelector('.c-name') || {}).textContent || '';
        var key = COURSES.filter(function (c) { return name.indexOf(c) > -1; })[0];
        if (!key) return;
        var all = list[key].sort(function (a, b) { return a.start - b.start; });

        // 카드 아래를 평일반 | 주말반 두 칸으로 나눠 표시 — 일정 없는 반은 "일정 문의"
        function slot(label, mod, it) {
          var tag = it && it.start <= today ? '<em>진행 중</em>' : '';
          return '<div class="c-slot c-slot--' + mod + (it ? '' : ' c-slot--none') + '">' +
            '<span class="c-cls">' + label + tag + '</span>' +
            (it
              ? '<span class="c-start">' + fmt(it.start) + '</span>' + (it.end ? '<span class="c-end">~ ' + fmt(it.end) + '</span>' : '<span class="c-end">개강</span>')
              : '<span class="c-start">일정 문의</span><span class="c-end">&nbsp;</span>') +
            '</div>';
        }
        var box = document.createElement('div');
        box.className = 'c-dates';
        var html = CLASSES.map(function (c) {
          return slot(c, c === '평일반' ? 'weekday' : 'weekend', all.filter(function (x) { return x.cls === c; })[0]);
        }).join('');
        // 반을 적지 않은 일정이 있으면 첫 번째 것만 아래 칸에 덧붙임
        var etc = all.filter(function (x) { return !x.cls; })[0];
        if (etc) html += slot('일정', 'etc', etc);
        box.innerHTML = html;
        var body = item.querySelector('.c-center') || item.querySelector('.c-body');
        if (body) body.appendChild(box);
      });
    });
})();
