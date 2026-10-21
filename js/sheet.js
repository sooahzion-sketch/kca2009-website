// 구글 시트(과정 | 반 | 시작일 | 종료일) → kcaSchedule(function(data){...})
// data = { list:[{course,cls,start,end,ongoing}], by:{광택:{평일반:item|null,주말반:item|null}, ...}, fmt }
var KCA_SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSujpNO0flnhY6_FnzU31_WgU8qxv5jxdijt0p9SwCR_OBu_OJebErFrx3oJqi3nLrJeDlyyRtkraMP/pub?gid=0&single=true&output=csv';
function kcaSchedule(cb) {
  var COURSES = ['광택', '덴트', '랩핑', '썬팅'], DAYS = ['일','월','화','수','목','금','토'];
  var today = new Date(); today.setHours(0,0,0,0);
  function parseDate(s) {
    var n = ((s || '').match(/\d+/g) || []).map(Number), y, m, d;
    if (n.length >= 3 && n[0] > 999) { y = n[0]; m = n[1]; d = n[2]; }
    else if (n.length >= 2) { m = n[0]; d = n[1]; y = today.getFullYear(); if (new Date(y, m-1, d) < new Date(today - 60*864e5)) y++; }
    else return null;
    var dt = new Date(y, m-1, d); return isNaN(dt) ? null : dt;
  }
  function fmt(dt, short) { return (dt.getMonth()+1) + '.' + String(dt.getDate()).padStart(2,'0') + (short ? '' : '(' + DAYS[dt.getDay()] + ')'); }
  fetch(KCA_SHEET_CSV + '&t=' + Date.now()).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }).then(function (txt) {
    var col = { course:0, cls:1, start:2, end:3 }, list = [], by = {};
    COURSES.forEach(function (c) { by[c] = { '평일반': null, '주말반': null }; });
    txt.split(/\r?\n/).forEach(function (line) {
      var p = line.split(',').map(function (x) { return x.replace(/^"|"$/g, '').trim(); });
      if (p.indexOf('과정') > -1 && p.indexOf('시작일') > -1) { col = { course:p.indexOf('과정'), cls:p.indexOf('반'), start:p.indexOf('시작일'), end:p.indexOf('종료일') }; return; }
      var course = COURSES.filter(function (c) { return (p[col.course] || '').indexOf(c) > -1; })[0];
      var start = parseDate(p[col.start]); if (!course || !start) return;
      var end = parseDate(p[col.end]); if ((end || start) < today) return;
      var c = p[col.cls] || '', cls = c.indexOf('평일') > -1 ? '평일반' : c.indexOf('주말') > -1 ? '주말반' : '';
      list.push({ course:course, cls:cls, start:start, end:end, ongoing:start <= today });
    });
    list.sort(function (a, b) { return a.start - b.start; });
    list.forEach(function (it) { if (it.cls && !by[it.course][it.cls]) by[it.course][it.cls] = it; });
    cb({ list:list, by:by, fmt:fmt, today:today });
  });
}

// 졸업생 수 (data/stats.json) → .kca-graduates
fetch('data/stats.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) {
  if (d.graduates_total) document.querySelectorAll('.kca-graduates').forEach(function (s) { s.textContent = d.graduates_total.toLocaleString(); });
}).catch(function () {});
