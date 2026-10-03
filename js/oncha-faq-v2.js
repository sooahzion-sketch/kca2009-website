// 온차 취업 연계 안내 v2 — FAQ 아코디언
// CSP(script-src 'self')가 인라인 스크립트를 차단하므로 반드시 외부 파일로 둔다.
document.querySelectorAll('.wf-faq-q').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.closest('.wf-faq-item');
    var isOpen = item.classList.contains('open');

    document.querySelectorAll('.wf-faq-item.open').forEach(function (i) {
      i.classList.remove('open');
    });

    if (!isOpen) item.classList.add('open');
  });
});
