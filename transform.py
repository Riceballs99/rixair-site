#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Transformarea copiei Gomag: date corecte + functii statice + produse noi + imagini locale.
   RULEAZA O SINGURA DATA peste docs/ (copia v4). Git pastreaza originalul."""
import os, re, json, glob, shutil, html as H, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
D = lambda *p: os.path.join(ROOT, *p)
DOCS = D("docs")
PR = {p["nr"]: p for p in json.load(open(D("data/produse.json"), encoding="utf-8"))}
S = json.load(open(D("data/site.json"), encoding="utf-8"))

def fmt(p):
    s = "%.2f" % float(p); a, b = s.split(".")
    return re.sub(r"(?<=\d)(?=(\d{3})+$)", ".", a) + "," + b

ID2NR = {180:1,493:2,197:3,501:4,263:5,255:6,235:7,207:8,523:9,516:10,123:11,166:12,152:13,
         409:14,413:15,425:16,429:17,433:18,489:19,284:27,289:26,305:25,321:24,326:23}
DELETE_IDS = [99,113]
BLOCKED = {11,12,13}          # pret la cerere
NOVAR = {5,6,7,8,23,24,25,26,27}  # pastram pretul, scoatem select-ul

allf = sorted(glob.glob(os.path.join(DOCS,"**","*.html"), recursive=True))

# --- gaseste fisierul fiecarui produs + imaginile lui ---
id2file, id2imgs = {}, {}
for f in allf:
    h = open(f, encoding="utf-8").read()
    m = re.search(r'data-product-id="(\d+)"', h)
    if m and "__productVersionSelect" in h or m and "addToCart({'p'" in h:
        pid = int(m.group(1))
        if pid in ID2NR or pid in DELETE_IDS:
            if "fPrice" in h and pid not in id2file:
                id2file[pid] = f
                base = set()
                for mm in re.finditer(r'files/product/(?:original|large|medium|thumbnail)/([^"\'?]+\.(?:jpg|jpeg|png|webp))', h):
                    if re.search(r'data-id="%d"' % pid, h[max(0,mm.start()-300):mm.end()+300]) or 'og:image' in h[max(0,mm.start()-200):mm.start()]:
                        base.add(mm.group(1))
                m2 = re.search(r'og:image" content="[^"]*files/product/[a-z]+/([^"?]+)', h)
                if m2: base.add(m2.group(1))
                id2imgs[pid] = base

# mapare basename imagine -> poza locala
os.makedirs(os.path.join(DOCS,"poze-rx"), exist_ok=True)
img_map = {}
for pid, nr in ID2NR.items():
    p = PR[nr]
    local = os.path.basename(p["poza"])
    src = D("poze", local)
    if os.path.exists(src):
        dst = os.path.join(DOCS,"poze-rx",local)
        if not os.path.exists(dst): shutil.copy(src, dst)
        for b in id2imgs.get(pid, []): img_map[b] = "/poze-rx/"+local

def del_card(h, pid):
    """sterge blocul <div class="product-box ... -g-product-box-PID"> (balansat)"""
    out, pos = h, 0
    while True:
        i = out.find('-g-product-box-%d"' % pid, pos)
        if i < 0: break
        j = out.rfind('<div', 0, i)
        # mergi inapoi pana la div-ul cu class="product-box
        while j >= 0 and 'product-box' not in out[j:out.find('>', j)]:
            j = out.rfind('<div', 0, j)
        if j < 0: pos = i+1; continue
        # scan balansat
        k, depth = j, 0
        for mm in re.finditer(r'<div\b|</div>', out[j:]):
            depth += 1 if mm.group(0) == '<div' else -1
            if depth == 0:
                k = j + mm.end(); break
        out = out[:j] + out[k:]
        pos = j
    return out

def price_card(h, pid, txt, blank_s=False):
    h = re.sub(r'(-g-product-box-final-price-%d"[^>]*>)\s*[^<]*' % pid, r'\g<1>%s' % txt, h)
    if blank_s:
        h = re.sub(r'(<s class="price-full -g-product-box-full-price-%d">).*?(</s>)' % pid, r'\1\2', h, flags=re.S)
    return h

deleted_files = []
for pid in DELETE_IDS:
    f = id2file.get(pid)
    if f and os.path.exists(f): deleted_files.append("/"+os.path.relpath(f,DOCS).replace(os.sep,"/")); os.remove(f)

INJ = '<link rel="stylesheet" href="/rixair-static.css"><script src="/rixair-search-data.js"></script><script src="/rixair-static.js"></script>'

report = {"cards_del":0,"prices_fixed":0,"selects":0,"imgs":0,"pages":0}
allf = sorted(glob.glob(os.path.join(DOCS,"**","*.html"), recursive=True))
for f in allf:
    h = open(f, encoding="utf-8").read(); orig = h
    # 1. sterge cardurile produselor eliminate
    for pid in DELETE_IDS:
        if '-g-product-box-%d"' % pid in h:
            h = del_card(h, pid); report["cards_del"] += 1
    # 2. corecteaza preturile pe carduri
    for pid, nr in ID2NR.items():
        if '-g-product-box-final-price-%d"' % pid not in h: continue
        p = PR[nr]
        if nr in BLOCKED: txt = "Pre&#539; la cerere"
        else:
            mn = min(v["pret"] for v in p["variante"]) if p["variante"] else p.get("pret_de_la")
            txt = "de la %s Lei" % fmt(mn)
        h = price_card(h, pid, txt, blank_s=True); report["prices_fixed"] += 1
    # 3. pagina de produs: pret detaliu + select + RXPROD
    m = re.search(r'data-product-id="(\d+)"', h)
    pid = int(m.group(1)) if m else None
    if pid in ID2NR and f == id2file.get(pid):
        nr = ID2NR[pid]; p = PR[nr]
        if nr in BLOCKED:
            dtxt = "Pre&#539; la cerere"
        else:
            mn = min(v["pret"] for v in p["variante"]) if p["variante"] else p.get("pret_de_la")
            dtxt = ("de la %s Lei" % fmt(mn)) if (p["variante"] or nr in NOVAR) else "%s Lei" % fmt(mn)
        h = re.sub(r'(class="fPrice -g-product-final-price-%d">)\s*[^<]*' % pid, r'\g<1> %s ' % dtxt, h)
        # selectul de versiuni
        selre = re.compile(r'<select[^>]*__productVersionSelect%d[^>]*>.*?</select>' % pid, re.S)
        if p["variante"] and nr not in BLOCKED:
            opts = "".join('<option data-pret="%s" data-sku="%s">%s</option>' % (fmt(v["pret"]), H.escape(v["sku"]), H.escape(v["nume"])) for v in p["variante"])
            h = selre.sub('<select class="input-s rxVar" style="max-width:280px">%s</select>' % opts, h)
        else:
            h = selre.sub('<span class="rx-note">Mai multe m&#259;rimi disponibile &#8212; configura&#539;ia exact&#259; se stabile&#537;te la ofertare.</span>', h)
        report["selects"] += 1
        rx = {"id":pid,"sku":p["sku"],"nume":p["nume_lung"],"pret":(None if nr in BLOCKED else (min(v["pret"] for v in p["variante"]) if p["variante"] else p.get("pret_de_la"))),"img":"/poze-rx/"+os.path.basename(p["poza"])}
        h = h.replace("</body>", '<script>window.RXPROD=%s;</script></body>' % json.dumps(rx, ensure_ascii=False))
    # 4. linkuri spre paginile sterse -> scoate ancora, lasa textul
    for df in deleted_files:
        h = re.sub(r'<a[^>]*href="%s"[^>]*>(.*?)</a>' % re.escape(df), r'\1', h, flags=re.S)
    # 5. imagini locale
    for b, loc in img_map.items():
        n = h.count(b)
        if n:
            h = re.sub(r'https?://gomagcdn\.ro/domains2/wwwrixairro/files/product/[a-z]+/%s' % re.escape(b), loc, h)
            report["imgs"] += n
    # 6. injectare statica
    if "rixair-static.js" not in h: h = h.replace("</body>", INJ+"</body>")
    if h != orig:
        open(f, "w", encoding="utf-8").write(h); report["pages"] += 1
print("T1/T2/T4:", report, "| sterse:", deleted_files)
