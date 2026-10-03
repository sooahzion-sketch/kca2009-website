(function(){
  /* ── course-json 파싱 ── */
  var raw = document.getElementById('course-json');
  var CD = {};
  try { CD = JSON.parse(raw.textContent); } catch(e) {}

  /* ── 훈련 정보 테이블 렌더링 ── */
  (function renderInfoBlocks(){
    var el = document.getElementById('course-info-blocks');
    if(!el) return;
    var h = '';

    /* 시간표 구성 */
    if(CD.subjects && CD.subjects.length){
      h += '<h4 class="cmt-title">시간표 구성</h4>';
      h += '<table class="cmt-table"><thead>';
      h += '<tr><th colspan="2">장소</th><th colspan="2">교과목</th></tr>';
      h += '<tr><th>장소명</th><th>편성시간</th><th>교과목명</th><th>편성시간</th></tr>';
      h += '</thead><tbody>';
      var maxR = Math.max((CD.locations||[]).length, CD.subjects.length);
      for(var i=0;i<maxR;i++){
        var loc=(CD.locations||[])[i]||{}, sub=CD.subjects[i]||{};
        h += '<tr>';
        h += '<td>'+(loc.name||'')+'</td><td>'+(loc.hours||'')+'</td>';
        h += '<td>'+(sub.name||'')+'</td><td>'+(sub.hours||'')+'</td>';
        h += '</tr>';
      }
      h += '</tbody></table>';
    }

    /* 훈련교재 */
    if(CD.textbooks && CD.textbooks.length){
      h += '<h4 class="cmt-title">훈련교재</h4>';
      h += '<table class="cmt-table"><thead><tr><th>교재명</th><th>저자</th><th>발행년도</th><th>구입여부</th><th>교재지급방법</th></tr></thead><tbody>';
      CD.textbooks.forEach(function(t){
        h += '<tr><td>'+t.name+'</td><td>'+t.author+'</td><td>'+t.year+'</td><td>'+t.supplyType+'</td><td>'+t.method+'</td></tr>';
      });
      h += '</tbody></table>';
    }

    /* 훈련강사 */
    if(CD.instructors && CD.instructors.length){
      h += '<h4 class="cmt-title">훈련강사</h4>';
      h += '<table class="cmt-table"><thead><tr><th>성명</th><th>전공</th><th>자격</th><th>편성시간</th></tr></thead><tbody>';
      CD.instructors.forEach(function(i){
        h += '<tr>';
        h += '<td>'+i.name+'</td>';
        h += '<td>'+(i.major||'—')+'</td>';
        h += '<td>'+(i.license||'—')+'</td>';
        h += '<td>'+(i.hours||'—')+'</td>';
        h += '</tr>';
      });
      h += '</tbody></table>';
    }

    el.innerHTML = h;
  })();
})();
