(function(){
  var btn=document.querySelector('.menu-btn'),nav=document.getElementById('nav');
  btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o);});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');btn.setAttribute('aria-expanded','false');}});
  var toast=document.querySelector('.toast'),t;
  function show(m){toast.textContent=m;toast.classList.add('on');clearTimeout(t);t=setTimeout(function(){toast.classList.remove('on')},2500);}
  function fallback(s){var a=document.createElement('textarea');a.value=s;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');show('복사되었습니다');}catch(e){show(s);}document.body.removeChild(a);}
  document.querySelectorAll('.copy').forEach(function(b){b.addEventListener('click',function(){
    var s=b.getAttribute('data-copy');
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(s).then(function(){show('복사되었습니다: '+s)},function(){fallback(s)});}else fallback(s);
  });});
})();
(function(){
  var ps=document.querySelectorAll('.panel');
  ps.forEach(function(p){p.addEventListener('click',function(){ps.forEach(function(q){q.classList.remove('on')});p.classList.add('on');});});
  var tb=document.getElementById('topbar');
  function f(){tb.classList.toggle('solid',window.scrollY>40);} window.addEventListener('scroll',f,{passive:true}); f();
})();
/* 교회소식·설교 아카이브: data/board.json 을 읽어 다시 그림(실패하면 HTML 안의 정적 카드 그대로 사용) */
(function(){
  var grid=document.getElementById('vgrid'); if(!grid) return;
  var cur='all';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function apply(){grid.querySelectorAll('.vcard').forEach(function(c){c.hidden=!(cur==='all'||c.getAttribute('data-cat')===cur);});}
  document.querySelectorAll('.fbtn').forEach(function(b){b.addEventListener('click',function(){
    cur=b.getAttribute('data-f');
    document.querySelectorAll('.fbtn').forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on);});
    apply();
  });});
  if(!window.fetch||location.protocol==='file:') return;
  fetch('data/board.json',{cache:'no-cache'}).then(function(r){if(!r.ok) throw 0; return r.json();}).then(function(d){
    if(!d||!d.items||!d.items.length) return;
    var lab={}; (d.categories||[]).forEach(function(c){lab[c.id]=c.label;});
    grid.innerHTML=d.items.map(function(it){
      var meta=[it.kind,it.scripture?'본문 '+it.scripture:'',it.preacher].filter(Boolean).join(' · ');
      return '<article class="vcard" data-cat="'+esc(it.category)+'"><a href="'+esc(it.url)+'" target="_blank" rel="noopener">'+
        '<span class="thumb'+(it.is_short?' short':'')+'"><img loading="lazy" src="'+esc(it.thumb)+'" alt="" width="480" height="360"><i class="play" aria-hidden="true"></i></span>'+
        '<span class="vbody"><span class="vcat c-'+esc(it.category)+'">'+esc(lab[it.category]||'')+'</span><b class="vtitle">'+esc(it.title)+'</b>'+
        (meta?'<span class="vmeta">'+esc(meta)+'</span>':'')+'<span class="vdate">'+esc((it.date_kst||'').replace(/-/g,'.'))+'</span>'+
        (it.summary?'<span class="vsum">'+esc(it.summary)+'</span>':'')+'</span></a></article>';
    }).join('');
    if(d.notices&&d.notices.length){
      document.getElementById('notices').innerHTML=d.notices.map(function(n){
        var foot=[n.date?n.date.replace(/-/g,'.'):'',n.link?'<a href="'+esc(n.link)+'" target="_blank" rel="noopener">자세히 보기 →</a>':''].filter(Boolean).join(' · ');
        return '<article class="notice"><span class="ntag">'+esc(n.tag||'소식')+'</span><h3>'+esc(n.title)+'</h3><p>'+esc(n.body)+'</p>'+(foot?'<p class="ndate">'+foot+'</p>':'')+'</article>';
      }).join('');
    }
    var u=document.getElementById('board-upd'); if(u&&d.updated_kst) u.textContent='(목록 갱신: '+d.updated_kst.slice(0,10).replace(/-/g,'.')+')';
    apply();
  }).catch(function(){});
})();
