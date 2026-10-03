// ── 3장 미리 로드 (IntersectionObserver) ──
(function(){
  var items = Array.from(document.querySelectorAll('.gallery-item'));

  function loadImg(item) {
    var img = item && item.querySelector('img[data-src]');
    if (!img) return;
    img.addEventListener('load', function(){ img.classList.add('img-loaded'); });
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    if (img.complete) img.classList.add('img-loaded');
  }

  // 초기: 1~3번째(index 1,2,3) 미리 로드
  [1, 2, 3].forEach(function(i){ loadImg(items[i]); });

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      var idx = items.indexOf(entry.target);
      for (var i = idx; i <= Math.min(idx + 3, items.length - 1); i++) {
        loadImg(items[i]);
      }
    });
  }, { rootMargin: '0px 0px 400px 0px' });

  items.forEach(function(item){ observer.observe(item); });
})();

// ── 첫 번째 이미지 fade-in ──
(function(){
  var img = document.querySelector('.gallery-item img[src]');
  if (!img) return;
  if (img.complete) { img.classList.add('img-loaded'); }
  else { img.addEventListener('load', function(){ img.classList.add('img-loaded'); }); }
})();

// ── EXIF 메타정보 읽기 ──
document.querySelectorAll('.gallery-item').forEach(function(item){
  var img = item.querySelector('img');
  var meta = item.querySelector('.gallery-meta');
  if(!img || !meta) return;
  function readExif(){
    if (typeof EXIF === 'undefined') return;
    EXIF.getData(img, function(){
      var date  = EXIF.getTag(this, 'DateTimeOriginal') || EXIF.getTag(this, 'DateTime');
      var make  = EXIF.getTag(this, 'Make') || '';
      var model = EXIF.getTag(this, 'Model') || '';
      var f     = EXIF.getTag(this, 'FNumber');
      var exp   = EXIF.getTag(this, 'ExposureTime');
      var iso   = EXIF.getTag(this, 'ISOSpeedRatings');
      var w     = EXIF.getTag(this, 'PixelXDimension');
      var h     = EXIF.getTag(this, 'PixelYDimension');
      var parts = [];
      if(date){ var d = date.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1.$2.$3'); parts.push('<span>' + d + '</span>'); }
      if(make || model) parts.push('<span>' + (make + ' ' + model).trim() + '</span>');
      if(f)   parts.push('<span>f/' + (Math.round(f * 10) / 10) + '</span>');
      if(exp) parts.push('<span>' + (exp < 1 ? '1/' + Math.round(1/exp) : exp) + 's</span>');
      if(iso) parts.push('<span>ISO ' + iso + '</span>');
      if(w && h) parts.push('<span>' + w + ' × ' + h + '</span>');
      if(parts.length) meta.innerHTML = parts.join('<span class="meta-dot">·</span>');
    });
  }
  if(img.complete) readExif();
  else img.addEventListener('load', readExif);
});

// ── 필터 ──
(function(){
  var btns = document.querySelectorAll('.filter-btn');
  var items = document.querySelectorAll('.gallery-item');
  var empty = document.getElementById('gallery-empty');

  function filterGallery(cat){
    var visible = 0;
    items.forEach(function(item){
      if(cat === 'all' || item.dataset.cat === cat){
        item.classList.remove('hidden'); visible++;
      } else {
        item.classList.add('hidden');
      }
    });
    empty.classList.toggle('show', visible === 0);
  }

  function activateFilter(cat){
    btns.forEach(function(b){ b.classList.remove('active'); });
    var target = document.querySelector('.filter-btn[data-filter="' + cat + '"]');
    if(target) target.classList.add('active');
    filterGallery(cat);
    window.scrollTo({ top: document.getElementById('gallery-sec').offsetTop - 60, behavior: 'smooth' });
  }

  btns.forEach(function(btn){
    btn.addEventListener('click', function(){ activateFilter(btn.dataset.filter); });
  });

  document.querySelectorAll('.gallery-cat-tag[data-filter]').forEach(function(tag){
    tag.style.cursor = 'pointer';
    tag.addEventListener('click', function(e){
      e.stopPropagation();
      activateFilter(tag.dataset.filter);
    });
  });
})();
