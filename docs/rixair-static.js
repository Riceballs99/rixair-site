
(function(){
var EMAIL='office@rixar.ro';
function qget(){try{return JSON.parse(localStorage.getItem('rx_cerere')||'[]')}catch(e){return[]}}
function qset(l){localStorage.setItem('rx_cerere',JSON.stringify(l));badge();}
function badge(){var n=qget().reduce(function(s,i){return s+(i.qty||1)},0);
 document.querySelectorAll('.cart-drop .count, ._showCartHeader .count').forEach(function(b){b.textContent=n;});}
function toast(m){var o=document.querySelector('.rx-toast');if(o)o.remove();var t=document.createElement('div');t.className='rx-toast';t.innerHTML=m;document.body.appendChild(t);setTimeout(function(){t.remove()},4000);}
function fmtL(p){if(p==null||isNaN(p))return 'la cerere';return p.toLocaleString('ro-RO',{minimumFractionDigits:2,maximumFractionDigits:2})+' Lei';}
function qadd(it){var l=qget(),k=null;for(var i=0;i<l.length;i++)if(l[i].sku===it.sku)k=l[i];if(k)k.qty+=it.qty;else l.push(it);qset(l);
 toast('&#10003; Ad&#259;ugat la cererea de ofert&#259; &#8212; <a href="/cos-de-cumparaturi">vezi cererea</a>');}
/* adauga in cos -> cerere */
document.addEventListener('click',function(e){
 var t=e.target.closest('[onclick*="addToCart"],[href*="addToCart"],.__productAddToCart');
 if(!t)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 var it=null;
 if(window.RXPROD){it={sku:RXPROD.sku,nume:RXPROD.nume,pret:RXPROD.pret,img:RXPROD.img,qty:1};
  var q=document.querySelector('input[name="quantity"]');if(q)it.qty=Math.max(1,parseInt(q.value)||1);
  var s=document.querySelector('.rxVar');if(s){var o=s.options[s.selectedIndex];it.sku=o.getAttribute('data-sku')||it.sku;it.varianta=o.text;var pn=(o.getAttribute('data-pret')||'').replace(/\./g,'').replace(',','.');if(pn)it.pret=parseFloat(pn);}
 } else {
  var card=t.closest('.product-box');
  if(card){var nm=card.querySelector('[data-name]');var im=card.querySelector('img');
   it={sku:'produs-'+(card.getAttribute('data-product-id')||''),nume:(nm?nm.getAttribute('data-name'):(card.textContent.trim().slice(0,80))),pret:null,img:(im?im.getAttribute('src'):''),qty:1};}
 }
 if(it)qadd(it);
},true);
/* variante -> pret */
document.addEventListener('change',function(e){
 if(!e.target.classList.contains('rxVar'))return;
 var o=e.target.options[e.target.selectedIndex];
 var f=document.querySelector('.fPrice');if(f&&o.getAttribute('data-pret'))f.textContent=' '+o.getAttribute('data-pret')+' Lei ';
},true);
/* cautare */
function norm(s){return s.toLowerCase().replace(/[ăâ]/g,'a').replace(/î/g,'i').replace(/[șş]/g,'s').replace(/[țţ]/g,'t');}
function filt(q){if(!window.RXP)return[];q=norm(q).split(/\s+/).filter(Boolean);if(!q.length)return[];
 return RXP.filter(function(p){var h=norm(p.n+' '+p.u);return q.every(function(w){return h.indexOf(w)>=0});});}
function bindSearch(inp){
 if(!inp)return; inp.setAttribute('autocomplete','off');
 var w=inp.parentElement; w.style.position='relative';
 var d=document.createElement('div'); d.className='rx-sug'; d.style.display='none'; w.appendChild(d);
 inp.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();ev.stopPropagation();location.href='/cauta/?q='+encodeURIComponent(inp.value);}},true);
 inp.addEventListener('input',function(){var r=filt(inp.value).slice(0,6);
  if(!inp.value||!r.length){d.style.display='none';return;}
  d.innerHTML=r.map(function(p){return '<a href="'+p.u+'"><img src="'+p.i+'">'+p.n+'</a>'}).join('');d.style.display='block';});
 document.addEventListener('click',function(ev){if(!w.contains(ev.target))d.style.display='none';});
}
/* pagina cerere */
function renderCerere(host){
 document.body.classList.add('rx-cos');
 var l=qget();
 if(!l.length){host.innerHTML='<h1 style="font-size:24px;margin:10px 0">Cererea mea de ofert&#259;</h1><p style="padding:20px 0">Lista e goal&#259;. Alege produse din <a href="/" style="font-weight:700">catalog</a>.</p>';return;}
 var t='<h1 style="font-size:24px;margin:10px 0">Cererea mea de ofert&#259;</h1><table class="rx-t"><tr><th></th><th>Produs</th><th>Variant&#259; / Cod</th><th>Pre&#539; orientativ</th><th>Cant.</th><th></th></tr>',tot=0,inc=true;
 l.forEach(function(i,x){if(i.pret)tot+=i.pret*i.qty;else inc=false;
  t+='<tr><td>'+(i.img?'<img src="'+i.img+'">':'')+'</td><td>'+i.nume+'</td><td>'+(i.varianta||'')+'<br><small>'+i.sku+'</small></td><td>'+fmtL(i.pret)+'</td>'+
  '<td><button class="rx-x" data-a="m" data-x="'+x+'">&#8722;</button> '+i.qty+' <button class="rx-x" style="color:#2e7d32" data-a="p" data-x="'+x+'">+</button></td>'+
  '<td><button class="rx-x" data-a="d" data-x="'+x+'">&#10005;</button></td></tr>';});
 t+='</table><p style="font-size:16px"><b>Total orientativ'+(inc?'':' (par&#539;ial)')+': '+fmtL(tot)+'</b> <small>cu TVA &#183; pre&#539;ul final se confirm&#259; prin ofert&#259;</small></p>';
 t+='<p><button class="rx-b" id="rxSend">&#9993; Trimite cererea pe email</button><button class="rx-b o" id="rxClear">Gole&#537;te</button></p>';
 t+='<p style="font-size:13px;color:#666">Se deschide emailul t&#259;u cu lista completat&#259; &#8212; adaug&#259; numele &#537;i telefonul. Sau sun&#259;-ne direct.</p>';
 host.innerHTML=t;
 host.querySelectorAll('.rx-x').forEach(function(b){b.addEventListener('click',function(){
  var l=qget(),x=+b.getAttribute('data-x'),a=b.getAttribute('data-a');
  if(a==='d')l.splice(x,1);else l[x].qty=Math.max(1,l[x].qty+(a==='p'?1:-1));
  qset(l);renderCerere(host);});});
 var sb=host.querySelector('#rxSend');if(sb)sb.addEventListener('click',function(){
  var l=qget(),b='Buna ziua,\n\nDoresc o oferta pentru:\n\n';
  l.forEach(function(i){b+='- '+i.nume+(i.varianta?' | varianta: '+i.varianta:'')+' | cod: '+i.sku+' | cantitate: '+i.qty+'\n';});
  b+='\nNume:\nTelefon:\nLocalitate / judet:\n\nMultumesc!';
  location.href='mailto:'+EMAIL+'?subject='+encodeURIComponent('Cerere de oferta (rixair.ro)')+'&body='+encodeURIComponent(b);});
 var cb=host.querySelector('#rxClear');if(cb)cb.addEventListener('click',function(){qset([]);renderCerere(host);});
}
function renderCauta(host){
 document.body.classList.add('rx-cos');
 var q=new URLSearchParams(location.search).get('q')||'';
 var r=filt(q);
 var t='<h1 style="font-size:24px;margin:10px 0">'+(q?('Rezultate pentru „'+q+'” ('+r.length+')'):'C&#259;utare')+'</h1><div class="rx-grid">';
 t+=r.map(function(p){return '<a href="'+p.u+'"><img src="'+p.i+'"><div style="min-height:54px;font-size:13.5px;margin-top:8px">'+p.n+'</div><div style="font-weight:700;color:#1583ab;margin-top:6px">'+(p.p?'de la '+p.p+' Lei':'Pre&#539; la cerere')+'</div></a>'}).join('');
 t+='</div>'+(r.length?'':'<p>Niciun rezultat. &#206;ncearc&#259;: pompa, split, boiler, ventiloconvector.</p>');
 host.innerHTML=t;
}
/* formulare -> email */
document.addEventListener('submit',function(e){
 var f=e.target; if(f.closest('.rx-sug'))return;
 e.preventDefault();e.stopPropagation();
 var b='';f.querySelectorAll('input,select,textarea').forEach(function(i){
  if(i.type==='hidden'||i.type==='submit')return;
  if(i.type==='checkbox'){if(i.checked)b+=(i.name||'optiune')+': DA\n';}
  else if(i.value)b+=(i.name||i.placeholder||'camp')+': '+i.value+'\n';});
 location.href='mailto:'+EMAIL+'?subject='+encodeURIComponent('Mesaj de pe site (rixair.ro)')+'&body='+encodeURIComponent(b);
},true);
document.addEventListener('DOMContentLoaded',function(){
 badge();
 bindSearch(document.getElementById('_autocompleteSearchMainHeader'));
 bindSearch(document.getElementById('_autocompleteSearchMobileToggle'));
 var h1=document.getElementById('rxCerereHost');if(h1)renderCerere(h1);
 var h2=document.getElementById('rxCautaHost');if(h2)renderCauta(h2);
});
})();

/* rxLazyFix: incarca imaginile lazy daca lazysizes nu a pornit */
setTimeout(function(){document.querySelectorAll('img[data-src]').forEach(function(i){
 if(!i.getAttribute('src')||i.naturalWidth===0){var d=i.getAttribute('data-src');if(d)i.setAttribute('src',d);}
 var ds=i.getAttribute('data-srcset');if(ds)i.setAttribute('srcset',ds);});},800);

/* rxHero */
(function(){var w=document.querySelector('.rx-hero');if(!w)return;var im=[...w.querySelectorAll('img')],x=0;
function go(d){im[x].style.display='none';x=(x+d+im.length)%im.length;im[x].style.display='block';}
w.querySelector('.rx-ha.l').addEventListener('click',function(){go(-1)});
w.querySelector('.rx-ha.r').addEventListener('click',function(){go(1)});
setInterval(function(){go(1)},6000);})();

/* rxKenBurns */
(function(){var w=document.querySelector('.rx-kb');if(!w)return;
var im=[...w.querySelectorAll('img')],dots=[...w.querySelectorAll('.rx-dots span')],x=0,t;
function show(n){im[x].classList.remove('on');dots[x].classList.remove('on');x=(n+im.length)%im.length;im[x].classList.add('on');dots[x].classList.add('on');}
function next(){show(x+1)} function auto(){clearInterval(t);t=setInterval(next,6500)}
w.querySelector('.rx-ha.l').addEventListener('click',function(){show(x-1);auto()});
w.querySelector('.rx-ha.r').addEventListener('click',function(){show(x+1);auto()});
dots.forEach(function(d,i){d.addEventListener('click',function(){show(i);auto()})});
auto();})();
