#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generator site RIXAIR v3 — replica Gomag + butoane functionale. Ruleaza: python3 build.py -> docs/"""
import os, json, re, shutil, html, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
D = lambda *p: os.path.join(ROOT, *p)
S = json.load(open(D("data/site.json"), encoding="utf-8"))
PR = json.load(open(D("data/produse.json"), encoding="utf-8"))
DOCS = D("docs")
shutil.rmtree(DOCS, ignore_errors=True)
for d in ["", "produse", "categorie", "assets"]: os.makedirs(os.path.join(DOCS, d), exist_ok=True)

def fmt(p):
    s = "%.2f" % float(p); a, b = s.split(".")
    return re.sub(r"(?<=\d)(?=(\d{3})+$)", ".", a) + "," + b
def esc(t): return html.escape(str(t))
def pmin(p):
    if p["variante"]: return min(v["pret"] for v in p["variante"])
    return p.get("pret_de_la")

try:
    from PIL import Image
    def icopy(src, dst):
        im = Image.open(src)
        if max(im.size) > 1000:
            r = 1000.0/max(im.size); im = im.resize((int(im.width*r), int(im.height*r)), Image.LANCZOS)
        im.convert("RGB").save(dst, quality=84, optimize=True) if dst.lower().endswith((".jpg",".jpeg")) else im.save(dst, optimize=True)
except ImportError:
    def icopy(src, dst): shutil.copy(src, dst)
for f in os.listdir(D("poze")): icopy(D("poze", f), os.path.join(DOCS, "assets", f))

def heroimg(key, localname):
    if os.path.exists(D("poze", localname)): return "{R}assets/" + localname
    return S["img_cdn"][key]

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Signika',sans-serif;color:#333;background:#fff;line-height:1.45}
a{color:#333;text-decoration:none}img{max-width:100%}
.ct{max-width:1420px;margin:0 auto;padding:0 24px}
.hdr{background:#fff;padding:14px 0}
.hdr .ct{display:flex;align-items:center;gap:30px}
.hdr .logo img{height:52px}
.srchw{flex:1;max-width:420px;margin:0 auto;position:relative}
.srch{display:flex;align-items:center;border:1px solid #e3e3e3;border-radius:26px;padding:4px 18px;background:#fff;gap:10px}
.srch input{border:none;outline:none;flex:1;font-family:inherit;font-size:14px;padding:7px 0;color:#333}
.sug{display:none;position:absolute;top:105%;left:0;right:0;background:#fff;border:1px solid #e7e7e7;border-radius:14px;box-shadow:0 10px 26px rgba(0,0,0,.13);z-index:60;overflow:hidden}
.sug a{display:flex;gap:10px;align-items:center;padding:9px 14px;font-size:13.5px;border-bottom:1px solid #f5f5f5}
.sug a:hover{background:#f5fafd}
.sug img{width:38px;height:38px;object-fit:contain}
.hico{margin-left:auto;display:flex;gap:10px}
.hico a{width:46px;height:46px;border-radius:14px;background:#eef7ee;display:flex;align-items:center;justify-content:center;font-size:19px;position:relative}
#qb{display:none;position:absolute;top:-6px;right:-6px;background:#e2574c;color:#fff;font-size:11px;font-weight:700;width:20px;height:20px;border-radius:50%;align-items:center;justify-content:center}
.nav{background:#fff;border-bottom:1px solid #f0f0f0}
.nav .ct{display:flex;gap:26px}
.nav>.ct>div{position:relative}
.nav a.top{display:inline-block;padding:13px 0;font-weight:600;font-size:14.5px;letter-spacing:.2px}
.nav .car{font-size:10px;color:#999}
.dd{display:none;position:absolute;top:100%;left:0;background:#fff;border:1px solid #ececec;border-radius:0 0 12px 12px;min-width:330px;box-shadow:0 10px 24px rgba(0,0,0,.09);z-index:40}
.nav>.ct>div:hover .dd{display:block}
.dd a{display:block;padding:11px 18px;font-size:14px;border-bottom:1px solid #f5f5f5}
.dd a:hover{background:#f5fafd;color:#1593d2}
.strip{background:#0d2d4e url('{NAVBG}') center/cover;padding:14px 0}
.strip img{height:38px;display:block}
.hero{position:relative}
.hero img{width:100%;display:block;max-height:560px;object-fit:cover}
.hero .harr{position:absolute;top:46%;width:46px;height:46px;border-radius:50%;background:rgba(120,120,120,.55);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;z-index:5}
.hero .harr.l{left:18px}.hero .harr.r{right:18px}
h2.sec{font-size:27px;font-weight:600;color:#4a4a4a;margin:42px 0 20px}
.carw{position:relative}
.car{display:grid;grid-auto-flow:column;grid-auto-columns:calc(25% - 12px);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:6px}
.car::-webkit-scrollbar{display:none}
.car>a{scroll-snap-align:start}
.arr{position:absolute;top:42%;width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid #e7e7e7;box-shadow:0 2px 10px rgba(0,0,0,.10);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;font-size:18px;color:#666}
.arr.l{left:-14px}.arr.r{right:-14px}
.card{background:#fff;border:1px solid #efefef;border-radius:20px;padding:16px;display:flex;flex-direction:column;min-height:430px;transition:box-shadow .15s}
.card:hover{box-shadow:0 6px 22px rgba(0,0,0,.10)}
.card .im{height:235px;display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.card .im img{max-height:228px;object-fit:contain}
.card .nm{font-size:14.5px;color:#333;line-height:1.35;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;min-height:58px}
.card .pr{font-weight:700;font-size:15.5px;margin:10px 0 4px}
.card .ft{display:flex;align-items:center;justify-content:space-between;margin-top:auto}
.stoc{color:#1593d2;font-weight:700;font-size:14.5px}
.dots{width:46px;height:46px;background:#f4f4f4;color:#8a8a8a;display:flex;align-items:center;justify-content:center;font-size:19px;border-radius:12px 12px 28px 12px;border:none;cursor:pointer}
.dots:hover{background:#f4c340;color:#fff}
.ctx{max-width:900px;margin:60px auto 0;text-align:center;padding:0 24px;font-size:15.5px}
.ctx .t1{font-weight:700;font-size:17px;color:#333;border-bottom:3px solid #1583ab;display:inline-block;padding-bottom:8px;margin-bottom:22px}
.ctx p{margin:4px 0}
.ctx .b{color:#1583ab;font-weight:700}
.fw{position:relative;margin-top:44px}
.fw img{width:100%;display:block;min-height:330px;max-height:480px;object-fit:cover}
.fw .ov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.45)}
.fw .ov h2{font-size:44px;font-weight:700}
.fw .ov p{font-size:22px;margin-top:6px}
.frm{max-width:560px;margin:54px auto;padding:0 24px;text-align:center}
.frm h2{font-size:21px;font-weight:700}
.frm h3{font-size:19px;font-weight:400;margin:4px 0 18px}
.frm .sub{font-size:14.5px;margin-bottom:26px}
.frm form{text-align:left}
.frm label{display:block;font-size:14px;margin:15px 0 6px}
.frm input,.frm select,.frm textarea{width:100%;border:1px solid #ddd;border-radius:20px;padding:10px 16px;font-family:inherit;font-size:14px;background:#fff}
.frm textarea{border-radius:14px;min-height:70px}
.frm .chk{display:flex;gap:9px;align-items:flex-start;font-size:14px;margin:8px 0;font-weight:600}
.frm .chk input{width:auto;margin-top:3px}
.frm .send{display:block;margin:22px auto 0;background:#1583ab;color:#fff;border:none;border-radius:24px;padding:12px 30px;font-weight:700;font-size:14px;letter-spacing:.4px;cursor:pointer;font-family:inherit}
footer{background:#0d7193;color:#e8f2f7;margin-top:60px;padding:46px 0 22px}
footer .ct{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:30px}
footer h4{color:#fff;font-size:16.5px;font-weight:700;margin-bottom:16px}
footer a{color:#e8f2f7;display:block;padding:5px 0;font-size:14.5px}
footer a:hover{text-decoration:underline}
footer .dt{font-size:14px;line-height:1.7}
.fsoc{text-align:center;margin:26px 0 0}
.fsoc a{display:inline-block;width:38px;height:38px;border-radius:50%;border:1px solid #bcd8e5;color:#fff;line-height:38px;font-weight:700}
.fbot{border-top:1px solid #2c89aa;margin-top:24px;padding:16px 24px 0;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;max-width:1420px;margin-left:auto;margin-right:auto}
.fbot .cc{font-size:13px;color:#cfe5ee}
.badg{display:flex;gap:10px}
.badg a{background:#fff;color:#0d3a6b;font-size:10.5px;font-weight:700;border-radius:6px;padding:7px 12px;text-align:center;line-height:1.3}
.badg a span{display:block;background:#163e93;color:#fff;border-radius:4px;margin-top:4px;padding:1px 6px;font-size:9.5px}
.bc{font-size:13.5px;padding:16px 0 4px;color:#333}
.bc a{margin-right:4px}
.bc .cur{text-decoration:underline;font-weight:600}
.instr{text-align:center;font-size:14.5px;margin:20px auto 8px;max-width:980px;padding:0 24px}
.instr a{font-weight:700}
.pgrid{display:grid;grid-template-columns:1.05fr 1fr;gap:44px;margin-top:18px}
.pgrid .gal{display:flex;align-items:flex-start;justify-content:center}
.pgrid .gal img{max-height:560px;object-fit:contain}
h1.pt{font-size:25px;font-weight:600;line-height:1.3}
.pprice{font-size:25px;margin:20px 0 14px}.pprice b{font-weight:700}
.vlab{font-size:14.5px;font-weight:600;margin-bottom:7px}
select.vsel{max-width:340px;width:100%;border:1px solid #ddd;border-radius:18px;padding:9px 14px;font-family:inherit;font-size:13.5px}
.pstoc{margin:16px 0 4px;font-size:15px}
.pliv{font-size:14px;margin-bottom:18px}
.qty{display:inline-flex;border:1px solid #e3e3e3;border-radius:12px;overflow:hidden;vertical-align:middle;margin-right:14px}
.qty button{width:42px;height:46px;display:flex;align-items:center;justify-content:center;font-size:17px;color:#888;background:#fff;border:none;cursor:pointer;font-family:inherit}
.qty .n{width:42px;height:46px;display:flex;align-items:center;justify-content:center;border-left:1px solid #e3e3e3;border-right:1px solid #e3e3e3;color:#333}
.buy{display:inline-flex;align-items:center;gap:8px;background:#f4c340;color:#fff;font-weight:700;font-size:14px;letter-spacing:.4px;border-radius:12px;padding:14px 26px;vertical-align:middle;border:none;cursor:pointer;font-family:inherit}
.buy:hover{background:#e8b52e}
.pmail{display:block;margin-top:12px;font-size:13.5px;color:#1583ab;text-decoration:underline}
.pcod{margin:20px 0;font-size:14.5px;border-top:1px solid #f0f0f0;padding-top:16px}
.tabs{margin-top:46px;border-bottom:1px solid #e8e8e8;display:flex;gap:26px}
.tabs span{padding:10px 2px;font-weight:600;font-size:15.5px;cursor:pointer;color:#888;border-bottom:3px solid transparent}
.tabs span.on{color:#1583ab;border-color:#1583ab}
.tabc{padding:24px 0;display:none}.tabc.on{display:block}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(265px,1fr));gap:16px;margin:10px 0 40px}
.toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:#2e7d32;color:#fff;padding:13px 22px;border-radius:30px;font-size:14.5px;z-index:100;box-shadow:0 6px 20px rgba(0,0,0,.25)}
.toast a{color:#fff;text-decoration:underline;font-weight:700}
/* pagina cerere */
.qtab{width:100%;border-collapse:collapse;font-size:14.5px;margin:14px 0}
.qtab th{background:#f5fafd;text-align:left;padding:11px;border-bottom:2px solid #d7e3ee;font-size:13.5px}
.qtab td{padding:11px;border-bottom:1px solid #f0f0f0;vertical-align:middle}
.qtab img{width:54px;height:54px;object-fit:contain}
.qdel{background:none;border:none;color:#e2574c;font-size:17px;cursor:pointer}
.qbtn{background:#1583ab;color:#fff;border:none;border-radius:24px;padding:12px 26px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;margin-right:10px}
.qbtn.alt{background:#fff;color:#1583ab;border:2px solid #1583ab}
@media(max-width:1000px){.car{grid-auto-columns:calc(50% - 8px)}.pgrid{grid-template-columns:1fr}.fw .ov h2{font-size:30px}}
@media(max-width:620px){.car{grid-auto-columns:85%}.srchw{display:none}}
"""

JS = r"""
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
 location.href='mailto:%EMAIL%?subject='+encodeURIComponent('Cerere de oferta (site rixair.ro)')+'&body='+encodeURIComponent(b);}
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
function sols(f){var b='';f.querySelectorAll('input,select,textarea').forEach(function(i){if(i.type=='checkbox'){if(i.checked&&i.name)b+=i.name+': DA\n';}else if(i.value&&i.name)b+=i.name+': '+i.value+'\n';});location.href='mailto:%EMAIL%?subject='+encodeURIComponent('Solicitare echipamente Clivet (site)')+'&body='+encodeURIComponent(b);return false;}
document.addEventListener('DOMContentLoaded',function(){qbadge();qrender();srun();hauto();
 document.addEventListener('click',function(e){var d=document.querySelector('.sug');if(d&&!e.target.closest('.srchw'))d.style.display='none';});});
"""

NAVH = []
for n in S["nav"]:
    sub = ""
    if n["sub"]:
        sub = '<div class="dd">' + "".join('<a href="{R}categorie/%s.html">%s</a>' % (s[1], esc(s[0])) for s in n["sub"]) + "</div>"
    car = ' <span class="car">▼</span>' if n["sub"] else ""
    NAVH.append('<div><a class="top" href="{R}categorie/%s.html">%s%s</a>%s</div>' % (n["slug"], esc(n["nume"]), car, sub))
NAVH = "".join(NAVH)

def page(title, meta, body, rel="", canonical="", extra="", noindex=False):
    h = ['<!DOCTYPE html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
         "<title>%s</title>" % esc(title), '<meta name="description" content="%s">' % esc(meta)]
    if noindex: h.append('<meta name="robots" content="noindex">')
    if canonical: h.append('<link rel="canonical" href="%s">' % canonical)
    h.append('<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Signika:wght@400;600;700&display=swap" rel="stylesheet">')
    h.append('<link rel="stylesheet" href="%sstyle.css">' % rel); h.append(extra)
    h.append('</head><body data-root="%s">' % rel)
    h.append(('<div class="hdr"><div class="ct"><a class="logo" href="{R}index.html"><img src="{R}assets/logo.png" alt="RIXAIR"></a>'
              '<div class="srchw"><div class="srch"><input placeholder="Cauta in site..." onkeyup="skey(event,this)">'
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></div><div class="sug"></div></div>'
              '<div class="hico"><a href="{R}cerere.html" title="Cererea mea de ofertă">🛍<span id="qb"></span></a></div></div></div>'))
    h.append('<div class="nav"><div class="ct">%s</div></div>' % NAVH)
    h.append('<div class="strip"><div class="ct"><img src="{R}assets/clivet-logo.png" alt="Clivet"></div></div>')
    h.append(body)
    h.append(('<footer><div class="ct"><div><h4>Magazinul meu</h4><a href="{R}despre-noi.html">Despre noi</a><a href="{R}termeni-si-conditii.html">Termeni si Conditii</a>'
              '<a href="{R}politica-confidentialitate.html">Politica de Confidentialitate</a><a href="{R}politica-livrare.html">Politica de livrare</a><a href="{R}contact.html">Contact</a></div>'
              '<div><h4>Clienti</h4><a href="{R}metode-plata.html">Metode de Plata</a><a href="{R}politica-retur.html">Politica de Retur</a><a href="{R}garantia-produselor.html">Garantia Produselor</a><a href="https://anpc.ro/" rel="nofollow">ANPC</a></div>'
              '<div><h4>Date comerciale</h4><div class="dt">%s<br>CUI: %s<br>%s<br>Sediu: %s<br>Showroom: %s<br>Tel: <a style="display:inline;padding:0" href="tel:%s">%s</a> · <a style="display:inline;padding:0" href="tel:%s">%s</a><br>Email: <a style="display:inline;padding:0" href="mailto:%s">%s</a></div></div></div>'
              '<div class="fsoc"><a href="https://www.facebook.com/" title="Facebook">f</a></div>'
              '<div class="fbot"><span class="cc">Toate drepturile rezervate © %d %s</span>'
              '<span class="badg"><a href="https://anpc.ro/ce-este-sal/" rel="nofollow">ANPC — SOLUTIONAREA ALTERNATIVA A LITIGIILOR<span>DETALII</span></a>'
              '<a href="https://ec.europa.eu/consumers/odr" rel="nofollow">SOLUTIONAREA ONLINE A LITIGIILOR<span>DETALII</span></a></span></div></footer>') % (
        esc(S["firma"]), S["cui"], S["reg_com"], esc(S["sediu"]), esc(S["showroom"]), S["telefon_link"], S["telefon"], S["telefon2_link"], S["telefon2"], S["email"], S["email"], datetime.date.today().year, esc(S["firma"])))
    h.append('<script src="%ssearch-data.js"></script><script src="%sscript.js"></script></body></html>' % (rel, rel))
    return "".join(h).replace("{R}", rel)

def qjson(p):
    m = pmin(p)
    d = {"sku": p["sku"], "nume": p["nume_lung"], "pret": m, "img": "{R}assets/" + os.path.basename(p["poza"]), "qty": 1}
    if p["variante"]: d["varianta"] = p["variante"][0]["nume"]; d["sku"] = p["variante"][0]["sku"]
    return d

def card(p, rel):
    img = rel + "assets/" + os.path.basename(p["poza"])
    m = pmin(p)
    pr = "de la %s Lei" % fmt(m) if m else "Preț la cerere"
    qd = qjson(p); qd["img"] = qd["img"].replace("{R}", rel)
    return ('<a class="card" href="%sproduse/%s.html"><div class="im"><img loading="lazy" src="%s" alt="%s"></div>'
            '<div class="nm">%s</div><div class="pr">%s</div><div class="ft"><span class="stoc">✓ In stoc</span>'
            '<button class="dots" title="Adaugă la cererea de ofertă" data-p="%s" onclick="cardadd(event,this)">🛍</button></div></a>') % (
        rel, p["slug"], img, esc(p["nume"]), esc(p["nume_lung"]), pr, esc(json.dumps(qd, ensure_ascii=False)))

def carousel(title, items, rel):
    return ('<h2 class="sec">%s</h2><div class="carw"><div class="arr l" onclick="carmove(this,-1)">‹</div><div class="car">%s</div>'
            '<div class="arr r" onclick="carmove(this,1)">›</div></div>') % (esc(title), "".join(card(p, rel) for p in items))

open(os.path.join(DOCS, "style.css"), "w", encoding="utf-8").write(CSS.replace("{NAVBG}", S["img_cdn"]["navbg"]))
open(os.path.join(DOCS, "script.js"), "w", encoding="utf-8").write(JS.replace("%EMAIL%", S["email"]))
# search data
sd = [{"n": p["nume_lung"], "s": p["slug"], "i": os.path.basename(p["poza"]), "p": (fmt(pmin(p)) if pmin(p) else None)} for p in PR]
open(os.path.join(DOCS, "search-data.js"), "w", encoding="utf-8").write("window.RXP=" + json.dumps(sd, ensure_ascii=False) + ";")

# ---------- INDEX ----------
pompe = [p for p in PR if p["cat"] in ("monobloc", "refrigerant-split", "split-hibrid-gaz")]
vcv = [p for p in PR if p["cat"] == "ventiloconvectoare"]
ac = [p for p in PR if p["cat"] == "single-split"]
apa = [p for p in PR if p["cat"] == "productie-apa-calda"]
FORM = ('<div class="frm" id="solicitare"><h2>TRIMITEȚI O SOLICITARE</h2><h3>PENTRU ECHIPAMENTE CLIVET</h3>'
        '<p class="sub">Pentru proiecte individuale cu parametrii tehnici aparte.<br>Vă asistăm în <b>alegerea echipamentului care corespunde întocmai nevoilor dumneavoastră</b>.</p>'
        '<form onsubmit="return sols(this)">'
        '<label>Numele și Prenumele dvs.*</label><input required name="Nume">'
        '<label>Numărul dvs. de telefon*</label><input required name="Telefon">'
        '<label>Adresa de email*</label><input required type="email" name="Email">'
        '<label>Sunteți persoană fizică sau reprezentați o firmă:*</label><select name="Tip client"><option>Persoană fizică</option><option>Firmă</option></select>'
        '<label>Numele firmei :</label><input name="Firma">'
        '<label>Tipul de imobil / clădire :*</label><select name="Tip imobil"><option>Casă / Vilă</option><option>Apartament</option><option>Ansamblu rezidențial</option><option>Clădire comercială / birouri</option><option>Hală industrială</option><option>Altele</option></select>'
        '<label>TOTALUL SPAȚIULUI (mp)*</label><input required name="Suprafata (mp)">'
        '<label>Câte nivele are imobilul / clădirea ?*</label><input required name="Nivele">'
        '<label>Nr. încăperi / partiții :*</label><input required name="Incaperi">'
        '<label>Înălțime încăperi (h) :</label><input name="Inaltime">'
        '<label>În ce stadiu se află imobilul / clădirea ?*</label><select name="Stadiu"><option>În construcție</option><option>Renovare</option><option>Finalizat / locuit</option></select>'
        '<label>Veți folosi și Gaz ?*</label><select name="Gaz"><option>Nu</option><option>Da</option></select>'
        '<label>De câte echipamente aveți nevoie ?</label><input name="Nr echipamente">'
        '<label>Echipamentele care vă interesează :</label>'
        '<div class="chk"><input type="checkbox" name="Pompe de Caldura"> Pompe de Caldură</div>'
        '<div class="chk"><input type="checkbox" name="Productie Apa Calda (DHW)"> Producție Apa Calda (DHW)</div>'
        '<div class="chk"><input type="checkbox" name="Ventilatie / AC"> Ventilație (aer condiționat, recuperare căldură)</div>'
        '<div class="chk"><input type="checkbox" name="Ventiloconvectoare"> Ventiloconvectoare</div>'
        '<label>Data limită la care aveți nevoie de echipament :</label><input name="Data limita">'
        '<label>Observații suplimentare :</label><textarea name="Observatii"></textarea>'
        '<div class="chk"><input required type="checkbox"> Sunt de acord cu prelucrarea datelor personale conform <b>&nbsp;Politicii de Confidentialitate</b>.</div>'
        '<button class="send" type="submit">TRIMITETI SOLICITAREA</button></form></div>')
h1img = heroimg("hero", "hero.png").replace("{R}", "")
slides = [h1img]
if os.path.exists(D("poze", "hero2.png")): slides.append("assets/hero2.png")
body = ['<div class="hero"><img id="himg" src="%s" alt="Clivet">%s</div>' % (slides[0],
        ('<div class="harr l" onclick="hgo(-1)">‹</div><div class="harr r" onclick="hgo(1)">›</div>' if len(slides) > 1 else ""))]
body.append('<script>window.HSLIDES=%s;</script>' % json.dumps(slides))
body.append('<div class="ct">')
body.append(carousel("Pompe de Caldură", pompe, ""))
body.append(carousel("Ventiloconvectoare", vcv, ""))
body.append(carousel("Aer Condiționat", ac, ""))
body.append(carousel("Producție Apă Caldă", apa, ""))
body.append("</div>")
body.append(('<div class="ctx"><div class="t1">SISTEME CERTIFICATE, PROIECTATE SĂ FACĂ FAȚĂ ORICĂROR CONDIȚII CLIMATICE.</div>'
             '<p class="b">Prezenți în România încă din anul 1993.</p>'
             '<p><span class="b">Echipamentele Clivet se regăsesc în toate sectoarele din Romania :</span></p>'
             '<p class="b">Comercial, Industrial și Rezidențial.</p>'
             '<p>Certificări : <b>Eurovent, ISO, HP Keymark, ErP, SG Ready, TUV Sud, CE</b></p>'
             '<p class="b">Peste 1000 de proiecte în România.</p></div>'))
body.append('<div class="fw"><img src="%s" alt="Fabrica Clivet"><div class="ov"><h2>Clivet</h2><p>Inovație Eficiență Performanță</p></div></div>' % heroimg("factory", "factory.jpg").replace("{R}", ""))
body.append(FORM)
body.append('<div class="fw"><img src="%s" alt="Showroom Clivet"><div class="ov"><h2>Showroom Clivet</h2><p>%s</p></div></div>' % (heroimg("showroom", "showroom.png").replace("{R}", ""), esc(S["showroom"])))
ldorg = {"@context":"https://schema.org","@type":"Organization","name":S["firma"],"brand":"RIXAIR","url":S["domeniu"],"logo":S["domeniu"]+"/assets/logo.png","telephone":S["telefon_link"],"email":S["email"],"address":{"@type":"PostalAddress","streetAddress":S["showroom"],"addressLocality":"Moșnița Nouă","addressRegion":"Timiș","addressCountry":"RO"}}
open(os.path.join(DOCS,"index.html"),"w",encoding="utf-8").write(page(
 "RIXAIR — Distribuitor oficial Clivet | Pompe de căldură, AC, climatizare Timișoara", S["descriere"],
 "".join(body), rel="", canonical=S["domeniu"]+"/", extra='<script type="application/ld+json">%s</script>' % json.dumps(ldorg, ensure_ascii=False)))

# ---------- CATEGORII ----------
CATS = {"pompe-de-caldura": pompe, "monobloc": [p for p in PR if p["cat"]=="monobloc"],
 "refrigerant-split": [p for p in PR if p["cat"]=="refrigerant-split"], "split-hibrid-gaz": [p for p in PR if p["cat"]=="split-hibrid-gaz"],
 "ventiloconvectoare": vcv, "aer-conditionat": ac, "single-split": ac, "productie-apa-calda": apa}
for slug, items in CATS.items():
    nm = S["cat_nume"].get(slug, slug)
    b = '<div class="ct"><div class="bc"><a href="../index.html">Home</a> / <span class="cur">%s</span></div><h2 class="sec">%s</h2><div class="cgrid">%s</div></div>' % (esc(nm), esc(nm), "".join(card(p, "../") for p in items))
    open(os.path.join(DOCS,"categorie",slug+".html"),"w",encoding="utf-8").write(page(
     "%s | RIXAIR — Clivet" % nm, "Catalog %s Clivet — RIXAIR, distribuitor oficial. Livrare din stoc Timișoara." % nm, b, rel="../", canonical=S["domeniu"]+"/categorie/"+slug+".html"))

# ---------- PRODUSE ----------
CATNAV = {"monobloc":("pompe-de-caldura","POMPE DE CĂLDURĂ","monobloc","MONOBLOC"),
 "refrigerant-split":("pompe-de-caldura","POMPE DE CĂLDURĂ","refrigerant-split","REFRIGERANT-Split"),
 "split-hibrid-gaz":("pompe-de-caldura","POMPE DE CĂLDURĂ","split-hibrid-gaz","Split HIBRID"),
 "single-split":("aer-conditionat","AER CONDIȚIONAT","single-split","SINGLE SPLIT"),
 "ventiloconvectoare":("ventiloconvectoare","Ventiloconvectoare","ventiloconvectoare","Ventiloconvectoare"),
 "productie-apa-calda":("productie-apa-calda","PRODUCȚIE APĂ CALDĂ","productie-apa-calda","Boilere ACM")}
for p in PR:
    url = S["domeniu"]+"/produse/"+p["slug"]+".html"
    desc_html = open(D(p["descriere"]), encoding="utf-8").read()
    img = "../assets/" + os.path.basename(p["poza"])
    c1, c1n, c2, c2n = CATNAV[p["cat"]]
    m = pmin(p)
    if p["variante"]:
        opts = "".join('<option data-pret="%s" data-prnum="%s" data-sku="%s">%s</option>' % (fmt(v["pret"]), v["pret"], esc(v["sku"]), esc(v["nume"])) for v in p["variante"])
        vsel = '<div class="vlab">Modelul Si Capacitatea :</div><select class="vsel" onchange="vch(this)">%s</select>' % opts
        pdisp = '<b>%s Lei</b>' % fmt(p["variante"][0]["pret"])
    else:
        vsel = ""
        pdisp = '<b>%s Lei</b>' % fmt(m) if m else '<b>Preț la cerere</b>'
    ld = {"@context":"https://schema.org","@type":"Product","name":p["nume_lung"],"sku":p["sku"],"brand":{"@type":"Brand","name":"Clivet"},"image":S["domeniu"]+"/assets/"+os.path.basename(p["poza"]),"url":url}
    if p["variante"]:
        prs=[v["pret"] for v in p["variante"]]; ld["offers"]={"@type":"AggregateOffer","priceCurrency":"RON","lowPrice":min(prs),"highPrice":max(prs),"offerCount":len(prs),"availability":"https://schema.org/InStock"}
    elif m: ld["offers"]={"@type":"Offer","priceCurrency":"RON","price":m,"availability":"https://schema.org/InStock"}
    prodjs = {"sku": p["sku"], "nume": p["nume_lung"], "pret": m, "img": "../assets/" + os.path.basename(p["poza"])}
    mailto = "mailto:%s?subject=%s" % (S["email"], esc("Cerere oferta: " + p["nume_lung"][:80]).replace(" ", "%20"))
    b = ['<div class="ct"><div class="bc"><a href="../index.html">Home</a> / <a href="../categorie/%s.html">%s</a> / <a href="../categorie/%s.html">%s</a> /<br><span class="cur">%s</span></div>' % (c1, c1n, c2, c2n, esc(p["nume_lung"]))]
    b.append(('<div class="instr"><b>Sunteți în pagina de produs</b> — selectați <b>MODELUL ȘI CAPACITATEA</b>, dacă este cazul, apoi adăugați produsul la cererea de ofertă.<br>'
              'Pentru <b>întrebări, nelămuriri</b>, vă rugăm să ne contactați telefonic : <a href="tel:%s">%s</a> sau <a href="tel:%s">%s</a>.</div>') % (S["telefon2_link"], S["telefon2"], S["telefon_link"], S["telefon"]))
    b.append('<div class="pgrid"><div class="gal"><img src="%s" alt="%s"></div><div>' % (img, esc(p["nume_lung"])))
    b.append('<h1 class="pt">%s</h1><div class="pprice" id="pp">%s</div>%s' % (esc(p["nume_lung"]), pdisp, vsel))
    b.append('<div class="pstoc stoc">✓ In stoc</div><div class="pliv"><b>Durata de livrare:</b> LIVRARE IMEDIATA din stocul din Timisoara</div>')
    b.append('<div><span class="qty"><button onclick="qinc(-1)">−</button><span class="n" id="qn">1</span><button onclick="qinc(1)">+</button></span><button class="buy" onclick="padd()">🛍 ADAUGĂ LA CERERE</button></div>')
    b.append('<a class="pmail" href="%s">✉ sau trimite direct un email pentru acest produs</a>' % mailto)
    b.append('<div class="pcod">Cod Produs: <b>%s</b></div></div></div>' % esc(p["sku"]))
    b.append('<script>var PROD=%s;</script>' % json.dumps(prodjs, ensure_ascii=False))
    b.append(('<div class="ct"><div class="ptabs"><div class="tabs"><span class="on" onclick="tab(this,0)">Descriere</span><span onclick="tab(this,1)">Informatii producator</span></div>'
              '<div class="tabc on">%s</div><div class="tabc"><p><b>Clivet S.p.A.</b> — producător italian de sisteme de climatizare și pompe de căldură, Feltre (BL), Italia. Echipamente certificate Eurovent, HP Keymark, ErP, CE.</p></div></div></div>') % desc_html)
    open(os.path.join(DOCS,"produse",p["slug"]+".html"),"w",encoding="utf-8").write(page(
     p["seo_title"], p["seo_meta"], "".join(b), rel="../", canonical=url, extra='<script type="application/ld+json">%s</script>' % json.dumps(ld, ensure_ascii=False)))

# ---------- CERERE + CAUTARE ----------
open(os.path.join(DOCS,"cerere.html"),"w",encoding="utf-8").write(page(
 "Cererea mea de ofertă | RIXAIR","Lista produselor pentru care ceri ofertă RIXAIR.",
 ('<div class="ct"><h2 class="sec">Cererea mea de ofertă</h2><div id="qlist"></div>'
  '<div id="qact" style="display:none;padding-bottom:40px"><button class="qbtn" onclick="qsend()">✉ Trimite cererea pe email</button>'
  '<button class="qbtn alt" onclick="qclear()">Golește lista</button>'
  '<p style="margin-top:14px;font-size:13.5px;color:#666">Se deschide emailul tău cu lista completată — adaugă numele și telefonul și trimite. Sau sună-ne direct: <a href="tel:%s"><b>%s</b></a></p></div></div>') % (S["telefon_link"], S["telefon"]),
 rel="", noindex=True))
open(os.path.join(DOCS,"cautare.html"),"w",encoding="utf-8").write(page(
 "Căutare | RIXAIR","Caută produse Clivet pe RIXAIR.",
 ('<div class="ct"><h2 class="sec" id="sttl">Caută în site</h2>'
  '<div class="srchw" style="max-width:520px;margin:0 0 22px"><div class="srch"><input id="sq" placeholder="Cauta in site..." onkeyup="if(event.key===\'Enter\')location.href=\'cautare.html?q=\'+encodeURIComponent(this.value)">'
  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></div></div>'
  '<div class="cgrid" id="sres"></div></div>'),
 rel="", noindex=True))

# ---------- pagini statice ----------
def sp(slug, title, inner):
    open(os.path.join(DOCS, slug+".html"), "w", encoding="utf-8").write(page(
     title+" | RIXAIR", title+" — RIXAIR, distribuitor oficial Clivet.",
     '<div class="ct"><h2 class="sec">%s</h2><div style="max-width:860px;font-size:15px;line-height:1.7;padding-bottom:30px">%s</div></div>' % (esc(title), inner),
     rel="", canonical=S["domeniu"]+"/"+slug+".html"))
sp("contact","Contact", ('<p><b>Telefon:</b> <a href="tel:%s">%s</a> sau <a href="tel:%s">%s</a><br><b>Email:</b> <a href="mailto:%s">%s</a><br><b>Showroom:</b> %s<br><b>Sediu social:</b> %s</p>'
 '<p style="margin-top:14px">Pentru o ofertă corectă, spune-ne: suprafața locuinței, zona (județul), tipul de încălzire actual și produsul care te interesează.</p>'
 '<p style="margin-top:14px"><a class="buy" style="text-decoration:none" href="mailto:%s?subject=Cerere%%20oferta">✉ CERE OFERTĂ</a></p>') % (S["telefon_link"],S["telefon"],S["telefon2_link"],S["telefon2"],S["email"],S["email"],esc(S["showroom"]),esc(S["sediu"]),S["email"]))
sp("despre-noi","Despre noi", '<p>%s este distribuitor oficial <b>Clivet</b> în România din 2018, cu showroom în %s.</p><p style="margin-top:10px">Acoperim întreaga gamă rezidențială și comercială Clivet: pompe de căldură aer-apă (monobloc și split), sisteme hibride cu gaz, aer condiționat, ventiloconvectoare și boilere pentru apă caldă menajeră. Oferim consultanță și dimensionare înainte de cumpărare, echipamente originale cu garanție și punere în funcțiune prin parteneri autorizați.</p>' % (esc(S["firma"]), esc(S["showroom"])))
sp("termeni-si-conditii","Termeni si Conditii", '<p><b>Operator site:</b> %s, CUI %s, %s.</p><p style="margin-top:10px">Prețurile afișate includ TVA, sunt orientative și pot fi actualizate; oferta fermă se transmite la cerere. Imaginile sunt cu titlu de prezentare. Specificațiile tehnice aparțin producătorului Clivet.</p><p style="margin-top:10px">Soluționarea litigiilor: <a href="https://anpc.ro/" rel="nofollow"><b>ANPC</b></a> · <a href="https://anpc.ro/ce-este-sal/" rel="nofollow"><b>SAL</b></a> · <a href="https://ec.europa.eu/consumers/odr" rel="nofollow"><b>SOL (ODR)</b></a></p>' % (esc(S["firma"]), S["cui"], S["reg_com"]))
sp("politica-confidentialitate","Politica de Confidentialitate", '<p>Acest site nu folosește cookie-uri de urmărire. Lista „cererea mea de ofertă" se salvează doar în browserul tău (stocare locală), nu pe serverele noastre. Datele transmise voluntar prin email/telefon (nume, contact, detalii proiect) sunt folosite exclusiv pentru întocmirea ofertei și nu sunt transmise terților. Poți cere oricând ștergerea lor la %s.</p>' % S["email"])
sp("politica-livrare","Politica de livrare", '<p>Produsele aflate în stoc se livrează <b>imediat din stocul din Timișoara</b>, în toată țara. Termenul și costul exact de livrare se confirmă la ofertare, în funcție de produs (greutate/volum) și destinație. Pentru detalii: <a href="tel:%s"><b>%s</b></a>.</p>' % (S["telefon_link"], S["telefon"]))
sp("politica-retur","Politica de Retur", '<p>Condițiile de retur se comunică împreună cu oferta și factura, conform OUG 34/2014 pentru consumatori (drept de retragere 14 zile pentru contracte la distanță, cu excepțiile legale). Pentru initierea unui retur: <a href="mailto:%s"><b>%s</b></a>.</p>' % (S["email"], S["email"]))
sp("metode-plata","Metode de Plata", '<p>Plata se face pe bază de factură (ordin de plată / transfer bancar). Detaliile complete de plată se transmit împreună cu oferta. Contact: <a href="mailto:%s"><b>%s</b></a> · <a href="tel:%s"><b>%s</b></a>.</p>' % (S["email"], S["email"], S["telefon_link"], S["telefon"]))
sp("garantia-produselor","Garantia Produselor", '<p>Toate echipamentele sunt <b>originale Clivet</b> și beneficiază de garanția producătorului. Condițiile de garanție (durată per produs, cerința de punere în funcțiune de personal autorizat) se comunică împreună cu oferta și certificatul de garanție.</p>')
open(os.path.join(DOCS,"404.html"),"w",encoding="utf-8").write(page("Pagina nu există | RIXAIR","Pagina nu există.",'<div class="ct"><h2 class="sec">Pagina nu există</h2><p style="padding-bottom:40px">Mergi la <a href="/index.html"><b>catalog</b></a> sau <a href="/contact.html"><b>contact</b></a>.</p></div>', noindex=True))

# ---------- sitemap / robots / CNAME ----------
urls = [S["domeniu"]+"/"] + [S["domeniu"]+"/"+x+".html" for x in ["contact","despre-noi","termeni-si-conditii","politica-confidentialitate","politica-livrare","politica-retur","metode-plata","garantia-produselor"]]
urls += [S["domeniu"]+"/categorie/%s.html" % s for s in CATS]
urls += [S["domeniu"]+"/produse/%s.html" % p["slug"] for p in PR]
today = datetime.date.today().isoformat()
open(os.path.join(DOCS,"sitemap.xml"),"w",encoding="utf-8").write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+"".join("<url><loc>%s</loc><lastmod>%s</lastmod></url>" % (u,today) for u in urls)+"</urlset>")
open(os.path.join(DOCS,"robots.txt"),"w",encoding="utf-8").write("User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n" % S["domeniu"])
open(os.path.join(DOCS,"CNAME"),"w").write("rixair.ro\n")
open(os.path.join(DOCS,".nojekyll"),"w").write("")
print("BUILD v3 OK: %d produse, butoane functionale (cautare, cerere, qty, slider)" % len(PR))
