/* ┌──────────────────────────────────────────────┐
   │  시험 설정 — 매 시험마다 여기만 수정          │
   └──────────────────────────────────────────────┘ */
const EXAM = {
  주관:     '한국자동차관리협동조합',
  시험명:   '카케어전문시공사 자격시험',
  날짜:     '2026-03-29',          // YYYY-MM-DD
  시작시간: '10:00',               // HH:MM
  종료시간: '11:30',               // HH:MM
  장소:     '한국카케어전문학원',
  정보: [
    { label: '평가 방식', value: '객관식 + 서술형' },
    { label: '문항',      value: '60문항 · 100점 만점' },
    { label: '시험 시간', value: '90분' },
    { label: '합격 기준', value: '60점 이상' },
  ]
};
/* ── 설정 끝 ── */

const examStart = new Date(EXAM.날짜 + 'T' + EXAM.시작시간 + ':00');
const examEnd   = new Date(EXAM.날짜 + 'T' + EXAM.종료시간 + ':00');
const dateStr   = examStart.toLocaleDateString('ko-KR', { year:'numeric', month:'numeric', day:'numeric', weekday:'short' });

document.getElementById('org').textContent      = EXAM.주관;
document.getElementById('title').textContent    = EXAM.시험명;
document.getElementById('subtitle').textContent = dateStr + ' · ' + EXAM.장소;

var infoRow = document.getElementById('infoRow');
EXAM.정보.forEach(function(item) {
  var div = document.createElement('div');
  div.className = 'info-item';
  div.innerHTML = '<div class="label">' + item.label + '</div><div class="value">' + item.value + '</div>';
  infoRow.appendChild(div);
});

var timerEl = document.getElementById('timer');
var labelEl = document.getElementById('timerLabel');
var subEl   = document.getElementById('timerSub');

function pad(n) { return String(n).padStart(2, '0'); }

function update() {
  var now = new Date();

  if (now < examStart) {
    var diff = examStart - now;
    labelEl.textContent = '시험 시작까지';
    timerEl.textContent = pad(Math.floor(diff/3600000)) + ':' + pad(Math.floor((diff%3600000)/60000)) + ':' + pad(Math.floor((diff%60000)/1000));
    timerEl.className = 'timer';
    subEl.textContent = EXAM.시작시간 + ' 시험 시작';
  } else if (now <= examEnd) {
    var remain = examEnd - now;
    var totalMin = Math.floor(remain / 60000);
    labelEl.textContent = '남은 시간';
    timerEl.textContent = pad(Math.floor(remain/3600000)) + ':' + pad(Math.floor((remain%3600000)/60000)) + ':' + pad(Math.floor((remain%60000)/1000));
    timerEl.className = totalMin <= 5 ? 'timer danger' : totalMin <= 15 ? 'timer warning' : 'timer';
    subEl.textContent = '종료 ' + EXAM.종료시간;
  } else {
    labelEl.textContent = '';
    timerEl.textContent = '시험 종료';
    timerEl.className = 'timer';
    timerEl.style.color = '#f5c842';
    subEl.textContent = '답안지를 제출해 주세요';
  }
}

update();
setInterval(update, 1000);
