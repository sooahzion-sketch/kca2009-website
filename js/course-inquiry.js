/* 과정 상세페이지 하단 상담 폼.
 *
 * ⚠️ 이 파일이 외부 스크립트인 이유: 사이트 CSP(script-src 'self' …)가 인라인 <script>를
 *    차단한다. 페이지 안에 직접 넣으면 조용히 실행되지 않고, 폼이 기본 GET 제출로 떨어져
 *    ?name=…&phone=… 쿼리만 붙은 채 새로고침된다(2026-07-31 실측).
 *
 * 과정 정보는 폼의 data-* 속성에서 읽는다 — 페이지마다 값만 바꿔 재사용할 수 있다.
 * 개강 D-day도 CSP 때문에 여기서 함께 처리한다.
 */
(function () {
  'use strict';

  // ── 개강 D-day (data-start="YYYY-MM-DD") ──
  var dday = document.getElementById('narrow-dday');
  if (dday && dday.dataset.start) {
    var p = dday.dataset.start.split('-');
    var start = new Date(+p[0], +p[1] - 1, +p[2]);
    var n = new Date();
    var today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    var days = Math.round((start - today) / 86400000);
    if (days > 0) dday.textContent = 'D−' + days;
    else if (days === 0) dday.textContent = '개강일';
    else dday.textContent = '개강';
  }

  // ── 상담 폼 ──
  var form = document.getElementById('course-inq-form');
  if (!form) return;

  var errEl = document.getElementById('inq-error');
  var step1 = document.getElementById('inq-step1');
  var step2 = document.getElementById('inq-step2');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.querySelector('[name="name"]').value.trim();
    var phone = form.querySelector('[name="phone"]').value.trim();
    if (!name || !phone) {
      errEl.textContent = '이름과 연락처를 입력해 주세요.';
      return;
    }
    errEl.textContent = '';

    var btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = '전송 중...';

    fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        phone: phone,
        course: form.dataset.course || '',
        weektype: form.dataset.weektype || '',
        startdate: form.dataset.start || '',
        enddate: form.dataset.end || '',
        message: (form.querySelector('[name="message"]') || {}).value || ''
      })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('server');
        step1.style.display = 'none';
        step2.style.display = 'block';
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = '상담 신청하기';
        errEl.textContent = '전송에 실패했습니다. 잠시 후 다시 시도하거나 010-2519-8585로 전화해 주세요.';
      });
  });
})();
