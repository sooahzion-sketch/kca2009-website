// 온차 취업 연계 안내 페이지 — FAQ 아코디언
// CSP(script-src 'self')가 인라인 스크립트를 차단하므로 반드시 외부 파일로 둔다.
document.querySelectorAll('.oc-faq-q').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.closest('.oc-faq-item');
    var isOpen = item.classList.contains('open');

    document.querySelectorAll('.oc-faq-item.open').forEach(function (i) {
      i.classList.remove('open');
    });

    if (!isOpen) item.classList.add('open');
  });
});
