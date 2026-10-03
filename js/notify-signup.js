(function () {
  'use strict';

  var modal = document.getElementById('notify-modal');
  if (!modal) return;

  var form = document.getElementById('notify-form');
  var doneBox = document.getElementById('notify-done');
  var courseLabel = document.getElementById('notify-course-label');
  var roundLabel = document.getElementById('notify-round-label');
  var nameInput = document.getElementById('notify-name');
  var phoneInput = document.getElementById('notify-phone');
  var agreeInput = document.getElementById('notify-agree');
  var errorEl = document.getElementById('notify-error');
  var submitBtn = document.getElementById('notify-submit');

  var currentCtx = { slug: '', name: '', round: '' };

  function formatPhone(v) {
    var d = (v || '').replace(/\D/g, '').slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
    if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  }

  function isValidPhone(v) {
    var d = (v || '').replace(/\D/g, '');
    return /^01[016789]\d{7,8}$/.test(d);
  }

  function openModal(ctx) {
    currentCtx = ctx;
    courseLabel.textContent = ctx.name || '과정';
    roundLabel.textContent = ctx.round || '2026-?차';
    errorEl.textContent = '';
    form.hidden = false;
    doneBox.hidden = true;
    form.reset();
    agreeInput.checked = true;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { phoneInput.focus(); }, 50);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.notify-btn');
    if (btn) {
      e.preventDefault();
      openModal({
        slug: btn.getAttribute('data-course-slug') || '',
        name: btn.getAttribute('data-course-name') || '',
        round: btn.getAttribute('data-next-round') || ''
      });
      return;
    }
    if (e.target.closest('[data-notify-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  phoneInput.addEventListener('input', function () {
    var pos = phoneInput.selectionStart;
    var prevLen = phoneInput.value.length;
    phoneInput.value = formatPhone(phoneInput.value);
    var newLen = phoneInput.value.length;
    phoneInput.setSelectionRange(pos + (newLen - prevLen), pos + (newLen - prevLen));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.textContent = '';

    var phone = phoneInput.value.trim();
    if (!isValidPhone(phone)) {
      errorEl.textContent = '올바른 휴대폰 번호를 입력해 주세요.';
      phoneInput.focus();
      return;
    }
    if (!agreeInput.checked) {
      errorEl.textContent = '개인정보 수집·이용에 동의해 주세요.';
      return;
    }

    submitBtn.disabled = true;
    var prevText = submitBtn.textContent;
    submitBtn.textContent = '신청 중...';

    fetch('/api/notify-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: (nameInput.value || '').trim(),
        phone: phone.replace(/\D/g, ''),
        courseSlug: currentCtx.slug,
        courseName: currentCtx.name,
        nextRound: currentCtx.round,
        source: 'index-planned'
      })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) {
          errorEl.textContent = (res.body && res.body.error) || '신청에 실패했습니다. 잠시 후 다시 시도해 주세요.';
          return;
        }
        form.hidden = true;
        doneBox.hidden = false;
        if (window.gtag) {
          window.gtag('event', 'notify_signup', {
            course: currentCtx.slug,
            round: currentCtx.round
          });
        }
      })
      .catch(function () {
        errorEl.textContent = '신청에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = prevText;
      });
  });
})();
