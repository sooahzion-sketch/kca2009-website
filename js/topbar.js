(function(){
  var link = document.getElementById('topbar-course-link');
  var textEl = document.getElementById('topbar-text');
  if(!link || !textEl) return;
  var today = new Date(); today.setHours(0,0,0,0);
  var year = today.getFullYear();
  var best = null, bestDate = null, bestName = '', bestType = '';
  document.querySelectorAll('.course-item').forEach(function(item){
    var a = item.querySelector('[onclick].c-main');
    if(!a) return;
    var ds = item.getAttribute('data-start');
    if(!ds) return;
    var parts = ds.split('.');
    var d = new Date(year, parseInt(parts[0],10)-1, parseInt(parts[1],10));
    if(d >= today && (!bestDate || d < bestDate)){
      bestDate = d;
      var nameEl = item.querySelector('.c-name');
      bestName = nameEl ? nameEl.textContent : '';
      var typeEl = item.querySelector('.c-tag:last-of-type');
      bestType = typeEl ? typeEl.textContent : '';
      var m = a.getAttribute('onclick').match(/location\.href='([^']+)'/);
      if(m) best = m[1];
    }
  });
  if(bestDate && bestName) {
    var mon = bestDate.getMonth() + 1;
    var day = bestDate.getDate();
    textEl.innerHTML = '<strong>' + mon + '/' + day + ' 개강</strong> — ' + bestName + ' ' + bestType + ' 모집 중';
  }
  if(best) link.setAttribute('href', best);
})();
