#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Faza 2: rename boiler, produse noi, pagina cerere/cautare, JS static, sitemap."""
import os, re, json, glob, shutil, html as H, datetime

ROOT = os.path.dirname(os.path.abspath(__file__)); D = lambda *p: os.path.join(ROOT, *p)
DOCS = D("docs")
PR = {p["nr"]: p for p in json.load(open(D("data/produse.json"), encoding="utf-8"))}
S = json.load(open(D("data/site.json"), encoding="utf-8"))
def fmt(p):
    s = "%.2f" % float(p); a,b = s.split(".")
    return re.sub(r"(?<=\d)(?=(\d{3})+$)", ".", a)+","+b

BOILER = D("docs","producție-apă-caldă","boiler-acm-cu-serpentină-clivet-acs-200-300-500-1000-litri.html")
NAME19 = PR[19]["nume_lung"]

# ---------- 1. RENAME boiler (pagina 489) ----------
h = open(BOILER, encoding="utf-8").read()
h = h.replace("<title>EDGE F</title>", "<title>%s</title>" % H.escape(PR[19]["seo_title"]))
h = re.sub(r'(<h1 class="title">\s*<span>\s*)EDGE F(\s*</span>)', r'\g<1>%s\g<2>' % H.escape(NAME19), h)
h = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>%s' % H.escape(PR[19]["seo_meta"]), h)
h = re.sub(r'(og:title" content=")[^"]*', r'\g<1>%s' % H.escape(NAME19), h)
h = h.replace('"name": "EDGE F"', '"name": %s' % json.dumps(NAME19, ensure_ascii=False)).replace('"name":"EDGE F"', '"name":%s' % json.dumps(NAME19, ensure_ascii=False))
open(BOILER, "w", encoding="utf-8").write(h)

# numele pe carduri (toate paginile): in blocul -g-product-box-489 + data-name
def card_block(h, pid):
    i = h.find('-g-product-box-%d"' % pid)
    if i < 0: return None
    j = h.rfind('<div', 0, i)
    while j >= 0 and 'product-box' not in h[j:h.find('>', j)]:
        j = h.rfind('<div', 0, j)
    k, depth = j, 0
    for mm in re.finditer(r'<div\b|</div>', h[j:]):
        depth += 1 if mm.group(0)=='<div' else -1
        if depth == 0: k = j+mm.end(); break
    return (j, k)
ren = 0
for f in glob.glob(os.path.join(DOCS,"**","*.html"), recursive=True):
    h = open(f, encoding="utf-8").read(); o = h
    span = card_block(h, 489)
    if span:
        blk = h[span[0]:span[1]]
        blk2 = blk.replace('>EDGE F<', '>%s<' % H.escape(NAME19)).replace('data-name="EDGE F"', 'data-name="%s"' % H.escape(NAME19)).replace('title="EDGE F"', 'title="%s"' % H.escape(NAME19))
        if blk2 != blk: h = h[:span[0]] + blk2 + h[span[1]:]; ren += 1
    h = h.replace('alt="EDGE F"', 'alt="%s"' % H.escape(NAME19))
    if h != o: open(f, "w", encoding="utf-8").write(h)
print("rename EDGE F->Boiler pe", ren, "carduri")

# ---------- 2. PRODUSE NOI (clone din pagina boiler) ----------
TPL = open(BOILER, encoding="utf-8").read()
NEW = [
 (20, "boiler-cu-pompa-de-caldura-aqua-swan-200l", 9020),
 (21, "boiler-cu-pompa-de-caldura-aqua-swan-270l", 9021),
 (22, "boiler-cu-pompa-de-caldura-aqua-f-dsdh-p-190l", 9022),
]
def balanced_div(h, start):
    k, depth = start, 0
    for mm in re.finditer(r'<div\b|</div>', h[start:]):
        depth += 1 if mm.group(0)=='<div' else -1
        if depth == 0: return start+mm.end()
    return start
for nr, slug, nid in NEW:
    p = PR[nr]; h = TPL
    nm = p["nume_lung"]
    # identitate
    h = re.sub(r'<title>[^<]*</title>', '<title>%s</title>' % H.escape(p["seo_title"]), h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>%s' % H.escape(p["seo_meta"]), h)
    h = re.sub(r'(<h1 class="title">\s*<span>\s*)[^<]*(</span>)', r'\g<1>%s\g<2>' % H.escape(nm), h)
    h = re.sub(r'(og:title" content=")[^"]*', r'\g<1>%s' % H.escape(nm), h)
    h = re.sub(r'(canonical" href=")[^"]*', r'\g<1>/producție-apă-caldă/%s.html' % slug, h)
    h = re.sub(r'(og:url" content=")[^"]*', r'\g<1>https://rixair.ro/producție-apă-caldă/%s.html' % slug, h)
    h = h.replace(NAME19, nm).replace(H.escape(NAME19), H.escape(nm))
    h = h.replace("CLV-ACS-200X", p["sku"])
    h = re.sub(r'data-product-id="489"', 'data-product-id="%d"' % nid, h)
    h = re.sub(r"addToCart\(\{'p': 489", "addToCart({'p': %d" % nid, h)
    # pret la cerere + fara select
    h = re.sub(r'(class="fPrice -g-product-final-price-\d+">)\s*[^<]*', r'\g<1> Pre&#539; la cerere ', h)
    h = re.sub(r'<select class="input-s rxVar"[^>]*>.*?</select>', '<span class="rx-note">Pre&#539;ul se comunic&#259; la ofertare &#8212; suna&#539;i sau trimite&#539;i cererea.</span>', h, flags=re.S)
    # imagine locala
    loc = os.path.basename(p["poza"])
    if os.path.exists(D("poze", loc)):
        shutil.copy(D("poze", loc), os.path.join(DOCS,"poze-rx",loc))
        h = re.sub(r'/poze-rx/[^"\')]+', '/poze-rx/'+loc, h)
        h = re.sub(r'https?://gomagcdn\.ro/[^"\')]+files/product/[^"\')]+', '/poze-rx/'+loc, h)
    # descriere: primul _descriptionTab — inlocuieste continutul
    m = re.search(r'<div class="landing-content[^"]*_descriptionTab[^"]*"[^>]*>', h)
    if m:
        end = balanced_div(h, m.start())
        desc = open(D(p["descriere"]), encoding="utf-8").read()
        h = h[:m.end()] + '<div style="padding:20px">' + desc + '</div></div>' + h[end:]
    # ld+json: scoate Product vechi, pune unul corect
    h = re.sub(r'<script type="application/ld\+json">\s*\{[^<]*?"Product"[^<]*?</script>', '', h, flags=re.S)
    ld = {"@context":"https://schema.org","@type":"Product","name":nm,"sku":p["sku"],"brand":{"@type":"Brand","name":"Clivet"},"image":"https://rixair.ro/poze-rx/"+loc,"url":"https://rixair.ro/producție-apă-caldă/%s.html" % slug}
    h = h.replace("</head>", '<script type="application/ld+json">%s</script></head>' % json.dumps(ld, ensure_ascii=False))
    h = re.sub(r'window\.RXPROD=\{[^}]*\}', 'window.RXPROD=%s' % json.dumps({"id":nid,"sku":p["sku"],"nume":nm,"pret":None,"img":"/poze-rx/"+loc}, ensure_ascii=False), h)
    open(os.path.join(DOCS,"producție-apă-caldă", slug+".html"), "w", encoding="utf-8").write(h)
print("3 pagini noi create")

# carduri noi in listari (clona cardului 489)
for lst in [os.path.join(DOCS,"producție-apă-caldă","index.html"), os.path.join(DOCS,"boilere-acm","index.html")]:
    if not os.path.exists(lst): continue
    h = open(lst, encoding="utf-8").read()
    span = card_block(h, 489)
    if not span: continue
    tpl = h[span[0]:span[1]]
    add = ""
    for nr, slug, nid in NEW:
        p = PR[nr]; nm = p["nume_lung"]; loc = os.path.basename(p["poza"])
        c = tpl.replace("489", str(nid))
        c = re.sub(r'href="[^"]*boiler-acm[^"]*"', 'href="/producție-apă-caldă/%s.html"' % slug, c)
        c = c.replace('>%s<' % H.escape(NAME19), '>%s<' % H.escape(nm)).replace(NAME19, nm).replace(H.escape(NAME19), H.escape(nm))
        c = re.sub(r'(final-price-%d"[^>]*>)\s*[^<]*' % nid, r'\g<1>Pre&#539; la cerere', c)
        c = re.sub(r'/poze-rx/[^"\')]+', '/poze-rx/'+loc, c)
        add += c
    h = h[:span[1]] + add + h[span[1]:]
    open(lst, "w", encoding="utf-8").write(h)
print("carduri noi adaugate in listari")

# ---------- 3. pagina COS -> cerere + pagina CAUTARE ----------
cos = os.path.join(DOCS,"cos-de-cumparaturi","index.html")
h = open(cos, encoding="utf-8").read()
if "rxCerereHost" not in h:
    h = h.replace('<div class="cart-title-holder">', '<div id="rxCerereHost" style="max-width:1100px;margin:0 auto;padding:24px"></div><div class="cart-title-holder rx-hide">', 1)
    open(cos, "w", encoding="utf-8").write(h)
os.makedirs(os.path.join(DOCS,"cauta"), exist_ok=True)
hc = h.replace("rxCerereHost","rxCautaHost")
hc = re.sub(r'<title>[^<]*</title>', '<title>C&#259;utare | RIXAIR</title>', hc)
open(os.path.join(DOCS,"cauta","index.html"), "w", encoding="utf-8").write(hc)

# ---------- 4. search data + JS + CSS ----------
id2nr = {180:1,493:2,197:3,501:4,263:5,255:6,235:7,207:8,523:9,516:10,123:11,166:12,152:13,409:14,413:15,425:16,429:17,433:18,489:19,284:27,289:26,305:25,321:24,326:23}
# fisier per id
id2file = {}
for f in glob.glob(os.path.join(DOCS,"**","*.html"), recursive=True):
    hh = open(f, encoding="utf-8").read()
    m = re.search(r'data-product-id="(\d+)"', hh)
    if m and "fPrice" in hh and "rxVar" in hh or m and "fPrice" in hh and "rx-note" in hh:
        pid = int(m.group(1))
        if pid in id2nr and pid not in id2file: id2file[pid] = "/"+os.path.relpath(f,DOCS).replace(os.sep,"/")
sd = []
for pid, nr in id2nr.items():
    p = PR[nr]
    mn = None if nr in (11,12,13) else (min(v["pret"] for v in p["variante"]) if p["variante"] else p.get("pret_de_la"))
    sd.append({"n": p["nume_lung"], "u": id2file.get(pid, "/"), "i": "/poze-rx/"+os.path.basename(p["poza"]), "p": (fmt(mn) if mn else None)})
for nr, slug, nid in NEW:
    p = PR[nr]
    sd.append({"n": p["nume_lung"], "u": "/producție-apă-caldă/%s.html" % slug, "i": "/poze-rx/"+os.path.basename(p["poza"]), "p": None})
open(os.path.join(DOCS,"rixair-search-data.js"), "w", encoding="utf-8").write("window.RXP=%s;" % json.dumps(sd, ensure_ascii=False))

open(os.path.join(DOCS,"rixair-static.css"), "w", encoding="utf-8").write("""
.rx-note{display:inline-block;background:#f5fafd;border:1px solid #cfe0f0;border-radius:10px;padding:9px 14px;font-size:13.5px;color:#1583ab;margin:6px 0}
.rx-toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:#2e7d32;color:#fff;padding:13px 22px;border-radius:30px;font-size:14.5px;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,.25)}
.rx-toast a{color:#fff;text-decoration:underline;font-weight:700}
.rx-sug{position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e7e7e7;border-radius:12px;box-shadow:0 10px 26px rgba(0,0,0,.14);z-index:99998;overflow:hidden}
.rx-sug a{display:flex;gap:10px;align-items:center;padding:9px 13px;font-size:13.5px;border-bottom:1px solid #f5f5f5;color:#333;text-decoration:none}
.rx-sug a:hover{background:#f5fafd}.rx-sug img{width:36px;height:36px;object-fit:contain}
.rx-hide,body.rx-cos .cart-box,body.rx-cos .-g-checkout-summary,body.rx-cos .cart-amount,body.rx-cos .cart-title-holder{display:none!important}
table.rx-t{width:100%;border-collapse:collapse;font-size:14.5px;margin:14px 0;font-family:inherit}
table.rx-t th{background:#f5fafd;text-align:left;padding:11px;border-bottom:2px solid #d7e3ee}
table.rx-t td{padding:11px;border-bottom:1px solid #f0f0f0;vertical-align:middle}
table.rx-t img{width:54px;height:54px;object-fit:contain}
.rx-b{background:#1583ab;color:#fff;border:none;border-radius:24px;padding:12px 26px;font-weight:700;font-size:14px;cursor:pointer;margin-right:10px}
.rx-b.o{background:#fff;color:#1583ab;border:2px solid #1583ab}
.rx-x{background:none;border:none;color:#e2574c;font-size:17px;cursor:pointer}
.rx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin:18px 0}
.rx-grid a{border:1px solid #eee;border-radius:14px;padding:12px;text-align:center;color:#333;text-decoration:none;background:#fff}
.rx-grid img{max-height:150px;object-fit:contain}
""")

email = S["email"]
open(os.path.join(DOCS,"rixair-static.js"), "w", encoding="utf-8").write(r"""
(function(){
var EMAIL='%EMAIL%';
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
""".replace("%EMAIL%", email))

# ---------- 5. sitemap regen ----------
urls = []
for f in glob.glob(os.path.join(DOCS,"**","*.html"), recursive=True):
    rel = "/"+os.path.relpath(f,DOCS).replace(os.sep,"/")
    if any(x in rel for x in ["/cauta/","/cos-de-cumparaturi","/wishlist","/cont-home","/lista-marci"]): continue
    rel = rel.replace("/index.html","/") if rel.endswith("/index.html") else rel
    if rel == "/": pass
    urls.append("https://rixair.ro"+(rel if rel!="//" else "/"))
urls = sorted(set(urls)); today = datetime.date.today().isoformat()
open(os.path.join(DOCS,"sitemap.xml"),"w",encoding="utf-8").write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+"".join('<url><loc>%s</loc><lastmod>%s</lastmod></url>'%(u,today) for u in urls)+"</urlset>")
print("sitemap:", len(urls), "URL-uri")
print("GATA faza 2")
