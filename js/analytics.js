(function () {
  if (typeof gtag !== 'function') return;

  // 현재 페이지 정보 (모든 이벤트에 포함)
  var PAGE = {
    title: document.title,
    path:  location.pathname,
  };

  function send(name, params) {
    gtag('event', name, Object.assign({ page_title: PAGE.title, page_path: PAGE.path }, params || {}));
  }

  // ── 클릭 이벤트 ──────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button, .faq-q, .prog-card, .course-item .c-main, .curriculum-tab');
    if (!el) return;

    var href = el.getAttribute('href') || '';
    var cls  = el.className || '';
    var text = (el.innerText || el.textContent || '').trim().slice(0, 60);

    // 전화 클릭
    if (href.startsWith('tel:')) {
      var telLoc = cls.indexOf('fixed') !== -1 ? 'fixed_bar' : 'cta';
      send('phone_click', { location: telLoc });
      return;
    }

    // 탑바 "과정 보기 →"
    if (el.id === 'topbar-course-link') {
      send('topbar_click', { label: '과정보기' });
      return;
    }

    // 네비게이션 메뉴
    if (cls.indexOf('nav-link') !== -1) {
      send('nav_click', { label: text });
      return;
    }

    // 히어로 무료 상담 신청
    if (cls.indexOf('hero-btn-primary') !== -1) {
      send('consultation_click', { button: '무료상담신청_hero' });
      return;
    }

    // 히어로 교육분야 보기
    if (cls.indexOf('hero-btn-secondary') !== -1) {
      send('hero_secondary_click', { label: text });
      return;
    }

    // 하단 고정 상담 신청
    if (cls.indexOf('fixed-btn') !== -1) {
      send('consultation_click', { button: '상담신청_fixed' });
      return;
    }

    // 교육분야 카드 (index)
    if (cls.indexOf('prog-card') !== -1) {
      var progName = (el.querySelector('.prog-name') || {}).innerText || text;
      send('program_card_click', { program: progName.trim() });
      return;
    }

    // 과정 신청하기 (index 모집과정)
    if (cls.indexOf('c-btn--active') !== -1) {
      var item = el.closest('.course-item');
      var cname = item ? ((item.querySelector('.c-name') || {}).innerText || '') : '';
      send('course_apply_click', { course: cname.trim() });
      return;
    }

    // 시간표보기
    if (cls.indexOf('timetable-link') !== -1) {
      send('timetable_click', { href: href });
      return;
    }

    // FAQ 항목 열기
    if (cls.indexOf('faq-q') !== -1) {
      send('faq_open', { question: text.replace('▾', '').trim() });
      return;
    }

    // 커리큘럼 탭 (polishing-steam)
    if (cls.indexOf('curriculum-tab') !== -1) {
      send('curriculum_tab_click', { tab: text });
      return;
    }

    // work 페이지 — 과정 상세보기
    if (el.id === 'cta-course-btn') {
      send('course_detail_click', { href: href, label: text });
      return;
    }

    // work/courses 페이지 — 상담 CTA (무료 상담 신청, 온라인 상담 신청)
    if (cls.indexOf('cta-btn') !== -1) {
      send('consultation_click', { button: text });
      return;
    }

    // work 페이지 내 다른 교육분야 이동
    if (el.closest('.footer-col') && href.indexOf('work/') !== -1) {
      send('work_nav_click', { label: text, href: href });
      return;
    }

    // 이미지 포함 링크 — 내부 페이지 이동 (앞서 어떤 조건도 안 걸린 a 태그)
    if (el.tagName === 'A' && href && !href.startsWith('#') && !href.startsWith('http')) {
      var imgEl = el.querySelector('img');
      send('internal_link_click', {
        label:    imgEl ? (imgEl.getAttribute('alt') || '이미지링크') : text,
        href:     href,
        has_image: !!imgEl,
      });
    }
  });

  // ── 폼 / 단계 이벤트 ─────────────────────────────────────

  // 수강료 계산 단계별
  document.addEventListener('change', function (e) {
    if (e.target.name === 'q-course') {
      send('cost_calc_course', { course: e.target.value });
    }
    if (e.target.name === 'q-status') {
      send('cost_calc_status', { status: e.target.value });
    }
    if (e.target.name === 'q-discount') {
      var courseEl = document.querySelector('input[name="q-course"]:checked');
      send('cost_calc_complete', {
        course:   courseEl ? courseEl.value : '',
        discount: e.target.value,
      });
    }
  });

  // 상담 문의하기 (step2 진입)
  var next1b = document.getElementById('check-next1b');
  if (next1b) {
    next1b.addEventListener('click', function () {
      var courseEl = document.querySelector('input[name="q-course"]:checked');
      send('consultation_form_open', { course: courseEl ? courseEl.value : '' });
    });
  }

  // 폼 제출 완료
  document.addEventListener('submit', function (e) {
    if (!e.target || e.target.id !== 'survey-form') return;
    var courseEl   = document.querySelector('input[name="q-course"]:checked');
    var statusEl   = document.querySelector('input[name="q-status"]:checked');
    var discountEl = document.querySelector('input[name="q-discount"]:checked');
    send('generate_lead', {
      course:   courseEl   ? courseEl.value   : '',
      status:   statusEl   ? statusEl.value   : '',
      discount: discountEl ? discountEl.value : '',
    });
  });

  // ── 섹션 노출 ─────────────────────────────────────────────
  var sectionMap = {
    'about':    '학원소개',
    'programs': '교육분야',
    'schedule': '모집과정',
    'check':    '수강료계산',
    'reviews':  '수강후기',
    'faq':      'FAQ',
  };

  if ('IntersectionObserver' in window) {
    var seen = {};
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        if (!id || seen[id]) return;
        seen[id] = true;
        send('section_view', { section: sectionMap[id] || id });
      });
    }, { threshold: 0.3 });

    Object.keys(sectionMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    // work/courses 페이지 — CTA 섹션 노출
    var ctaSec = document.querySelector('.course-cta');
    if (ctaSec && !ctaSec.id) {
      ctaSec.id = '_cta_sec';
      obs.observe(ctaSec);
      sectionMap['_cta_sec'] = 'CTA섹션';
    }
  }

  // ── 스크롤 깊이 ───────────────────────────────────────────
  var scrollMarks = { 25: false, 50: false, 75: false, 100: false };
  window.addEventListener('scroll', function () {
    var pct = Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100);
    [25, 50, 75, 100].forEach(function (mark) {
      if (!scrollMarks[mark] && pct >= mark) {
        scrollMarks[mark] = true;
        send('scroll_depth', { percent: mark });
      }
    });
  }, { passive: true });

})();
