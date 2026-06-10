
var RROOT=document.body.getAttribute('data-root')||'';
/* ---- cos cerere oferta ---- */
function qget(){try{return JSON.parse(localStorage.getItem('rx_cerere')||'[]')}catch(e){return[]}}
function qset(l){localStorage.setItem('rx_cerere',JSON.stringify(l));qbadge();}
function qbadge(){var n=qget().reduce(function(s,i){return s+(i.qty||1)},0);var b=document.getElementById('qb');if(b){b.textContent=n;b.style.display=n?'flex':'none';}}
function qadd(it){var l=qget();var k=null;for(var i=0;i<l.length;i++)if(l[i].sku===it.sku)k=l[i];if(k)k.qty+=it.qty;else l.push(it);qset(l);
 toast('✓ Adăugat la cererea de ofertă — <a href="'+RROOT+'cerere.html">vezi cererea</a>');}
function toast(m){var o=document.querySelector('.toast');if(o)o.remove();var t=document.createElement('div');t.className='toast';t.innerHTML=m;document.body.appendChild(t);setTimeout(function(){t.remove()},4000);}
function cardadd(ev,el){ev.preventDefault();ev.stopPropagation();qadd(JSON.parse(el.getAttribute('data-p')));}
/* ---- pagina produs ---- */
function qinc(d){var n=document.getElementById('qn');var v=Math.max(1,parseInt(n.textContent)+d);n.textContent=v;}
function vch(s){var o=s.options[s.selectedIndex];document.getElementById('pp').innerHTML='<b>'+o.getAttribute('data-pret')+' Lei</b>';}
function padd(){var qty=parseInt(document.getElementById('qn').textContent);var it={sku:PROD.sku,nume:PROD.nume,pret:PROD.pret,img:PROD.img,qty:qty};
 var s=document.querySelector('.vsel');if(s){var o=s.options[s.selectedIndex];it.sku=o.getAttribute('data-sku');it.varianta=o.text;it.pret=parseFloat(o.getAttribute('data-prnum'));}
 qadd(it);}
/* ---- pagina cerere ---- */
function fmtL(p){if(p==null||isNaN(p))return 'la cerere';return p.toLocaleString('ro-RO',{minimumFractionDigits:2,maximumFractionDigits:2})+' Lei';}
function qrender(){var w=document.getElementById('qlist');if(!w)return;var l=qget();
 if(!l.length){w.innerHTML='<p style="padding:30px 0">Cererea ta de ofertă e goală. Alege produse din <a href="index.html" style="color:#1583ab;font-weight:700">catalog</a>.</p>';document.getElementById('qact').style.display='none';return;}
 var t='<table class="qtab"><tr><th></th><th>Produs</th><th>Variantă / Cod</th><th>Preț orientativ</th><th>Cant.</th><th></th></tr>';var tot=0,inc=true;
 l.forEach(function(i,x){if(i.pret)tot+=i.pret*i.qty;else inc=false;
  t+='<tr><td>'+(i.img?'<img src="'+i.img+'">':'')+'</td><td>'+i.nume+'</td><td>'+(i.varianta||'')+'<br><small>'+i.sku+'</small></td><td>'+fmtL(i.pret)+'</td>'+
  '<td><button class="qdel" onclick="qch('+x+',-1)">−</button> '+i.qty+' <button class="qdel" style="color:#2e7d32" onclick="qch('+x+',1)">+</button></td>'+
  '<td><button class="qdel" title="Șterge" onclick="qrm('+x+')">✕</button></td></tr>';});
 t+='</table><p style="font-size:16px"><b>Total orientativ'+(inc?'':' (parțial — unele produse au preț la cerere)')+': '+fmtL(tot)+'</b> <small>cu TVA · prețul final se confirmă prin ofertă</small></p>';
 w.innerHTML=t;document.getElementById('qact').style.display='block';}
function qch(x,d){var l=qget();l[x].qty=Math.max(1,l[x].qty+d);qset(l);qrender();}
function qrm(x){var l=qget();l.splice(x,1);qset(l);qrender();}
function qclear(){qset([]);qrender();}
function qsend(){var l=qget();if(!l.length)return;var b='Buna ziua,\n\nDoresc o oferta pentru:\n\n';
 l.forEach(function(i){b+='- '+i.nume+(i.varianta?' | varianta: '+i.varianta:'')+' | cod: '+i.sku+' | cantitate: '+i.qty+'\n';});
 b+='\nNume:\nTelefon:\nLocalitate / judet:\nSuprafata (mp), daca e cazul:\n\nMultumesc!';
 location.href='mailto:office@rixar.ro?subject='+encodeURIComponent('Cerere de oferta (site rixair.ro)')+'&body='+encodeURIComponent(b);}
/* ---- cautare ---- */
function snorm(s){return s.toLowerCase().replace(/[ăâ]/g,'a').replace(/î/g,'i').replace(/ș/g,'s').replace(/ț/g,'t');}
function sfilter(q){if(!window.RXP)return[];q=snorm(q).split(/\s+/).filter(Boolean);if(!q.length)return[];
 return RXP.filter(function(p){var h=snorm(p.n+' '+p.s);return q.every(function(w){return h.indexOf(w)>=0});});}
function skey(ev,inp){if(ev.key==='Enter'){location.href=RROOT+'cautare.html?q='+encodeURIComponent(inp.value);return;}
 var r=sfilter(inp.value).slice(0,6);var d=inp.closest('.srchw').querySelector('.sug');
 if(!inp.value||!r.length){d.style.display='none';return;}
 d.innerHTML=r.map(function(p){return '<a href="'+RROOT+'produse/'+p.s+'.html"><img src="'+RROOT+'assets/'+p.i+'">'+p.n+'</a>'}).join('');d.style.display='block';}
function srun(){var w=document.getElementById('sres');if(!w)return;var q=new URLSearchParams(location.search).get('q')||'';
 document.getElementById('sq').value=q;var r=sfilter(q);
 document.getElementById('sttl').textContent=q?('Rezultate pentru „'+q+'” ('+r.length+')'):'Caută în site';
 w.innerHTML=r.map(function(p){return '<a class="card" href="produse/'+p.s+'.html"><div class="im"><img loading="lazy" src="assets/'+p.i+'"></div><div class="nm">'+p.n+'</div><div class="pr">'+(p.p?'de la '+p.p+' Lei':'Preț la cerere')+'</div><div class="ft"><span class="stoc">✓ In stoc</span></div></a>'}).join('')||'<p style="padding:20px 0">Niciun rezultat. Încearcă alt termen (ex: „pompa", „split", „boiler").</p>';}
/* ---- carusel + taburi + hero ---- */
function carmove(b,d){var c=b.parentElement.querySelector('.car');c.scrollBy({left:d*c.clientWidth*0.8,behavior:'smooth'});}
function tab(e,i){var p=e.closest('.ptabs');p.querySelectorAll('.tabs span').forEach(function(s,j){s.classList.toggle('on',j==i)});p.querySelectorAll('.tabc').forEach(function(c,j){c.classList.toggle('on',j==i)});}
var HS=window.HSLIDES||[],hsx=0,hst=null;
function hgo(d){if(!HS.length)return;hsx=(hsx+d+HS.length)%HS.length;document.getElementById('himg').src=HS[hsx];}
function hauto(){if(HS.length>1)hst=setInterval(function(){hgo(1)},6000);}
function sols(f){var b='';f.querySelectorAll('input,select,textarea').forEach(function(i){if(i.type=='checkbox'){if(i.checked&&i.name)b+=i.name+': DA\n';}else if(i.value&&i.name)b+=i.name+': '+i.value+'\n';});location.href='mailto:office@rixar.ro?subject='+encodeURIComponent('Solicitare echipamente Clivet (site)')+'&body='+encodeURIComponent(b);return false;}
document.addEventListener('DOMContentLoaded',function(){qbadge();qrender();srun();hauto();
 document.addEventListener('click',function(e){var d=document.querySelector('.sug');if(d&&!e.target.closest('.srchw'))d.style.display='none';});});
