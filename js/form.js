// ===== 과정 목록 동적 로드 (courses.json) =====
(function() {
  var container = document.querySelector('.survey-courses');
  if (!container) return;
  var costBox = document.getElementById('survey-cost');

  function parseCost(str) {
    if (!str) return 0;
    return parseInt(str.replace(/[^0-9]/g, '')) || 0;
  }

  function buildLabel(c) {
    var start  = c.startDate ? c.startDate.slice(5) : '';
    var end    = c.endDate   ? c.endDate.slice(5)   : '';
    var period = c.startDate ? c.startDate.slice(0,4) + '-' + start + ' - ' + end : '';
    var total  = parseCost(c.totalCost);
    var self   = parseCost(c.selfCost);
    return '<label class="survey-course"><input type="radio" name="q-course" value="' + c.name +
      '" data-start="' + (c.startDate || '') + '" data-end="' + (c.endDate || '') + '" data-total="' + total + '" data-self="' + self + '" data-weektype="' + (c.weekType || '') + '"><span class="sc-name">' +
      c.name + '</span><span class="sc-meta">' + period + '</span></label>';
  }

  function preselectCourse() {
    var params = new URLSearchParams(location.search);
    var preselect = params.get('course');
    if (!preselect) return;
    var startParam = params.get('start');
    var radios = Array.from(container.querySelectorAll('input[name="q-course"]'));
    var nameMatches = radios.filter(function(r) { return r.value === preselect; });
    if (!nameMatches.length) return;
    var target = startParam
      ? (nameMatches.find(function(r) { return r.dataset.start === startParam; }) || nameMatches[0])
      : nameMatches[0];
    target.checked = true;
    target.dispatchEvent(new Event('change', { bubbles: true }));
  }

  var cddRoot  = document.getElementById('mobile-course-dd');
  var cddBtn   = document.getElementById('cdd-btn');
  var cddLabel = document.getElementById('cdd-label');
  var cddPanel = document.getElementById('cdd-panel');

  function buildDDItem(c) {
    var el = document.createElement('div');
    var start = c.startDate ? c.startDate.slice(5) : '';
    var end   = c.endDate   ? c.endDate.slice(5)   : '';
    var shortName = c.name.replace(/^자동차/, '');
    el.className = 'cdd-item';
    el.dataset.value    = c.name;
    el.dataset.total    = parseCost(c.totalCost);
    el.dataset.self     = parseCost(c.selfCost);
    el.dataset.start    = c.startDate || '';
    el.dataset.end      = c.endDate   || '';
    el.dataset.weektype = c.weekType  || '';
    el.innerHTML = '<span class="cdd-name">' + shortName + '</span>' +
                   (start ? '<span class="cdd-date">' + start + (end ? ' ~ ' + end : '') + '</span>' : '');
    el.addEventListener('click', function() { selectDDItem(el); });
    return el;
  }

  function buildDDGroup(label) {
    var el = document.createElement('div');
    el.className = 'cdd-group';
    el.textContent = label;
    return el;
  }

  function selectDDItem(el) {
    cddLabel.textContent = el.querySelector('.cdd-name').textContent;
    cddLabel.classList.remove('placeholder');
    cddPanel.querySelectorAll('.cdd-item').forEach(function(i) { i.classList.remove('selected'); });
    el.classList.add('selected');
    cddRoot.classList.remove('open');
    var val = el.dataset.value;
    var radios = Array.from(container.querySelectorAll('input[name="q-course"]'));
    var target = radios.find(function(r) { return r.value === val; });
    if (target) { target.checked = true; target.dispatchEvent(new Event('change', { bubbles: true })); }
  }

  function syncCDD() {
    var checked = container.querySelector('input[name="q-course"]:checked');
    if (!checked || !cddLabel) return;
    cddLabel.textContent = checked.value.replace(/^자동차/, '');
    cddLabel.classList.remove('placeholder');
    if (cddPanel) {
      cddPanel.querySelectorAll('.cdd-item').forEach(function(i) {
        i.classList.toggle('selected', i.dataset.value === checked.value);
      });
    }
  }

  if (cddBtn) {
    cddBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      cddRoot.classList.toggle('open');
    });
    document.addEventListener('click', function() { cddRoot.classList.remove('open'); });
    cddPanel.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  container.addEventListener('change', function(e) {
    if (e.target.name === 'q-course') syncCDD();
  });

  fetch('data/courses.json')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var courses = (d.courses || []).filter(function(c) { return !!c.name; });
      if (!courses.length) { preselectCourse(); return; }

      var weekday = courses.filter(function(c) { return c.weekType === '평일반'; });
      var weekend = courses.filter(function(c) { return c.weekType === '주말반'; });
      // 각 반 내에서 개강일 오름차순 정렬
      function byStart(a, b) { return (a.startDate || "").localeCompare(b.startDate || ""); }
      weekday.sort(byStart);
      weekend.sort(byStart);

      container.querySelectorAll('.survey-course, .sc-group-label:not(.survey-sublabel)').forEach(function(el) { el.remove(); });

      var html = '';
      weekday.forEach(function(c) { html += buildLabel(c); });
      if (weekend.length) {
        html += '<div class="sc-group-label">주말반</div>';
        weekend.forEach(function(c) { html += buildLabel(c); });
      }
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      while (tmp.firstChild) container.insertBefore(tmp.firstChild, costBox);

      if (cddPanel) {
        cddPanel.innerHTML = '';
        if (weekday.length) {
          cddPanel.appendChild(buildDDGroup('평일반'));
          weekday.forEach(function(c) { cddPanel.appendChild(buildDDItem(c)); });
        }
        if (weekend.length) {
          cddPanel.appendChild(buildDDGroup('주말반'));
          weekend.forEach(function(c) { cddPanel.appendChild(buildDDItem(c)); });
        }
      }

      preselectCourse();
    })
    .catch(preselectCourse);
})();

// ===== 문의하기 폼 =====
(function() {
  var panel      = document.getElementById('check-panel');
  var step1      = document.getElementById('check-step1');
  var step3      = document.getElementById('check-step3');
  var form = document.getElementById('survey-form');
  if (!panel || !form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name   = form.querySelector('[name="name"]').value.trim();
    var phone  = form.querySelector('[name="phone"]').value.trim();
    var course = panel.querySelector('input[name="q-course"]:checked');

    var errEl = form.querySelector('.sf-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'sf-error';
      errEl.style.cssText = 'color:#dc2626;font-size:0.875rem;margin-top:0.5rem;text-align:center';
      form.appendChild(errEl);
    }

    if (!course) { errEl.textContent = '희망 교육과정을 선택해 주세요.'; return; }
    if (!name || !phone) { errEl.textContent = '이름과 연락처를 입력해 주세요.'; return; }
    errEl.textContent = '';

    var payload = {
      name:      name,
      phone:     phone,
      course:    course.value,
      weektype:  course.dataset.weektype  || '',
      startdate: course.dataset.start     || '',
      enddate:   course.dataset.end       || '',
      message:   (form.querySelector('[name="message"]') || {}).value || ''
    };

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '전송 중...'; }

    fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r) {
      if (!r.ok) throw new Error('server');
      step1.style.display = 'none';
      step3.style.display = 'block';
    })
    .catch(function() {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '메시지 보내기'; }
      errEl.textContent = '전송에 실패했습니다. 잠시 후 다시 시도하거나 010-2519-8585로 전화해 주세요.';
    });
  });
})();
