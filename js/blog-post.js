// 블로그 글 상세
var postSlug = document.querySelector('article.blog-post')?.dataset.slug || '';

// 댓글
function loadComments() {
  fetch('/api/blog/comments?post=' + postSlug)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var list = document.getElementById('commentList');
      var count = document.getElementById('commentCount');
      if (!data || data.length === 0) {
        list.innerHTML = '<div class="comment-empty">아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요.</div>';
        count.textContent = '';
        return;
      }
      count.textContent = '(' + data.length + ')';
      list.innerHTML = data.map(function(c) {
        return '<div class="comment-item"><div class="comment-item-header"><span class="comment-author">' + escHtml(c.author) + '</span><span class="comment-date">' + c.created_at + '</span></div><div class="comment-body">' + escHtml(c.body) + '</div></div>';
      }).join('');
    }).catch(function() {});
}

document.getElementById('commentForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var f = e.target;
  fetch('/api/blog/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post: postSlug, author: f.author.value, password: f.password.value, body: f.body.value })
  }).then(function(r) {
    if (r.ok) { f.body.value = ''; loadComments(); }
    else { r.text().then(function(t) { alert(t || '댓글 작성에 실패했습니다.'); }); }
  }).catch(function() { alert('네트워크 오류'); });
});

function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

loadComments();

// 조회수
fetch('/api/blog/views?post=' + postSlug, { method: 'POST' }).catch(function(){});
fetch('/api/blog/views?post=' + postSlug)
  .then(function(r) { return r.json(); })
  .then(function(d) {
    var el = document.getElementById('viewCount');
    if (el) el.textContent = '조회 ' + (d.views || 0);
  }).catch(function(){});

// 공유
document.querySelectorAll('[data-share]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var action = btn.dataset.share;
    // 공유 반응 서버 기록 (관리자 문자 알림용)
    fetch('/api/blog/share?post=' + encodeURIComponent(postSlug) + '&type=' + action, { method: 'POST' }).catch(function() {});
    if (action === 'kakao') {
      if (window.Kakao && Kakao.isInitialized()) {
        Kakao.Share.sendDefault({ objectType: 'feed', content: { title: document.title, description: '', imageUrl: '', link: { mobileWebUrl: location.href, webUrl: location.href } } });
      } else { copyLink(); }
    } else if (action === 'twitter') {
      window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(document.title));
    } else if (action === 'facebook') {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.href));
    } else if (action === 'copy') {
      copyLink();
    }
  });
});

function copyLink() {
  navigator.clipboard.writeText(location.href).then(function() {
    var msg = document.getElementById('copiedMsg');
    if (msg) { msg.classList.add('show'); setTimeout(function() { msg.classList.remove('show'); }, 2000); }
  });
}
