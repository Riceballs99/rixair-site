#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Faza 3: domenii escapate, stub-uri gomag, preturi instant, lazyload fix, descrieri produse, poze optimizate."""
import os, re, json, glob, shutil

ROOT = os.path.dirname(os.path.abspath(__file__)); D = lambda *p: os.path.join(ROOT, *p)
DOCS = D("docs")
PR = {p["nr"]: p for p in json.load(open(D("data/produse.json"), encoding="utf-8"))}

ID2NR = {180:1,493:2,197:3,501:4,263:5,255:6,235:7,207:8,523:9,516:10,123:11,166:12,152:13,
         409:14,413:15,425:16,429:17,433:18,489:19,284:27,289:26,305:25,321:24,326:23}

# ---------- 1. scoate toate formele de domeniu gomag ----------
PATS = [
 (re.compile(r'https?:\\/\\/wwwrixairro\.gomag\.ro'), ''),     # escapat JSON
 (re.compile(r'https?://wwwrixairro\.gomag\.ro'), ''),          # absolut ramas
 (re.compile(r'//wwwrixairro\.gomag\.ro'), ''),                 # protocol-relative
 (re.compile(r'wwwrixairro\.gomag\.ro'), 'rixair.ro'),          # bare (config)
]
files = glob.glob(os.path.join(DOCS,"**","*.html"), recursive=True) + glob.glob(os.path.join(DOCS,"**","*.js"), recursive=True) + glob.glob(os.path.join(DOCS,"**","*.css"), recursive=True)
cnt = 0
for f in files:
    try: h = open(f, encoding="utf-8").read()
    except: continue
    o = h
    for rx, rep in PATS: h = rx.sub(rep, h)
    if h != o: open(f, "w", encoding="utf-8").write(h); cnt += 1
print("domenii curatate in", cnt, "fisiere")

# ---------- 2. stub-uri pentru apelurile gomag (raspuns instant, fara redirect) ----------
open(os.path.join(DOCS,"widget.js"), "w").write("/* stub static */")
os.makedirs(os.path.join(DOCS,"request"), exist_ok=True)
open(os.path.join(DOCS,"request","data"), "w").write("{}")
open(os.path.join(DOCS,"request","product"), "w").write("{}")

# ---------- 3. preturi instant: scoate -g-hide de pe blocurile de pret ----------
n = 0
for f in glob.glob(os.path.join(DOCS,"**","*.html"), recursive=True):
    h = open(f, encoding="utf-8").read(); o = h
    h = h.replace('class="price -g-hide ', 'class="price ')
    if h != o: open(f, "w", encoding="utf-8").write(h); n += 1
print("preturi instant pe", n, "pagini")

# ---------- 4. fallback lazyload + CSS ----------
css = open(os.path.join(DOCS,"rixair-static.css"), encoding="utf-8").read()
if ".price" not in css:
    css += "\n.price{display:block!important;visibility:visible!important;opacity:1!important}\n"
    open(os.path.join(DOCS,"rixair-static.css"), "w", encoding="utf-8").write(css)
js = open(os.path.join(DOCS,"rixair-static.js"), encoding="utf-8").read()
if "rxLazyFix" not in js:
    js += """
/* rxLazyFix: incarca imaginile lazy daca lazysizes nu a pornit */
setTimeout(function(){document.querySelectorAll('img[data-src]').forEach(function(i){
 if(!i.getAttribute('src')||i.naturalWidth===0){var d=i.getAttribute('data-src');if(d)i.setAttribute('src',d);}
 var ds=i.getAttribute('data-srcset');if(ds)i.setAttribute('srcset',ds);});},800);
"""
    open(os.path.join(DOCS,"rixair-static.js"), "w", encoding="utf-8").write(js)

# ---------- 5. descrierile noastre in paginile de produs ----------
def balanced_div(h, start):
    depth = 0
    for mm in re.finditer(r'<div\b|</div>', h[start:]):
        depth += 1 if mm.group(0)=='<div' else -1
        if depth == 0: return start+mm.end()
    return start
done = 0
for f in glob.glob(os.path.join(DOCS,"**","*.html"), recursive=True):
    h = open(f, encoding="utf-8").read()
    m = re.search(r'data-product-id="(\d+)"', h)
    if not m: continue
    pid = int(m.group(1))
    if pid not in ID2NR or "rx-desc-done" in h: continue
    if "rxVar" not in h and "rx-note" not in h: continue  # doar paginile de detaliu
    p = PR[ID2NR[pid]]
    dm = re.search(r'<div class="landing-content[^"]*_descriptionTab[^"]*"[^>]*>', h)
    if not dm: continue
    end = balanced_div(h, dm.start())
    desc = open(D(p["descriere"]), encoding="utf-8").read()
    h = h[:dm.end()] + '<div class="rx-desc-done" style="padding:22px">' + desc + '</div></div>' + h[end:]
    open(f, "w", encoding="utf-8").write(h); done += 1
print("descrieri injectate:", done)

# ---------- 6. poze-rx optimizate ----------
try:
    from PIL import Image
    tot = 0
    for fn in os.listdir(os.path.join(DOCS,"poze-rx")):
        fp = os.path.join(DOCS,"poze-rx",fn)
        im = Image.open(fp)
        if max(im.size) > 1000:
            r = 1000.0/max(im.size); im = im.resize((int(im.width*r), int(im.height*r)), Image.LANCZOS)
        if fn.lower().endswith((".jpg",".jpeg")): im.convert("RGB").save(fp, quality=84, optimize=True)
        else: im.save(fp, optimize=True)
        tot += 1
    print("poze optimizate:", tot)
except ImportError: print("PIL lipsa - poze neoptimizate")

# ---------- 7. linkuri interne moarte (inventar) ----------
exist = set()
for f in glob.glob(os.path.join(DOCS,"**","*"), recursive=True):
    if os.path.isfile(f): exist.add("/"+os.path.relpath(f,DOCS).replace(os.sep,"/"))
from urllib.parse import unquote
missing = {}
for f in glob.glob(os.path.join(DOCS,"**","*.html"), recursive=True):
    h = open(f, encoding="utf-8").read()
    for m in re.findall(r'(?:href|src|action)="(/[^"#?]+)', h):
        m = unquote(m)
        if m.startswith(("/poze-rx","/domains2","/themes","/theme/")): continue
        cands = [m.rstrip("/")+"/index.html", m, m.rstrip("/")+".html"]
        if not any(c in exist for c in cands):
            missing.setdefault(m, 0); missing[m] += 1
print("LINKURI MOARTE (top):")
for k, v in sorted(missing.items(), key=lambda x: -x[1])[:25]: print("  %4d  %s" % (v, k))
