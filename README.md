# SITE RIXAIR — copie 1:1 a site-ului Gomag, gestionată local + GitHub
`docs/` = COPIA COMPLETĂ a site-ului wwwrixairro.gomag.ro (10.06.2026): 64 pagini (home, 26 produse, categorii, blog, pagini utilitare) + tema Gomag „fashion" completă (CSS, jQuery, gomag.js, animații, meniu mobil) + fonturi + imaginile same-origin.

## Preview local
În folderul `docs/`: `python -m http.server 8000` → deschide http://localhost:8000
(NU deschide index.html direct cu dublu-click — linkurile tip `/pompe-de-caldura` au nevoie de un server.)

## Publicare GitHub Pages
1. Repo public pe github.com → `git remote add origin https://github.com/UTILIZATOR/rixair-site.git` → `git push -u origin main`
2. Settings → Pages → branch `main`, folder `/docs`
3. Domeniu: DNS A → 185.199.108/109/110/111.153 + Custom domain `rixair.ro` + Enforce HTTPS (CNAME există în docs/)

## CE ȘTIM despre copie (citește înainte de modificări)
- **Datele de produs sunt cele VECHI de pe Gomag** — inclusiv erorile cunoscute: prețuri-test (Sphera 123/231/468, Hibrid 678), Edge F la 3.999 (corect: 15.797), produsul „EDGE F" care e de fapt boilerul ACS. Corecturile = pasul următor (referință: `04_Gomag_Produse/COPIE_SITE/00_MASTER_Catalog_Site.xlsx`).
- **Funcții care loveau serverul Gomag** (coș/checkout, căutare, wishlist, formulare POST, newsletter) NU funcționează pe hosting static — design/animații/meniuri DA. Re-cablarea lor pe static: logica gata scrisă în `generator_v3/` (coș de cerere ofertă pe email, căutare client-side) — se poate porta la cerere.
- **Imaginile de produs** vin hotlink de pe `gomagcdn.ro` (merg cât există contul Gomag). Unele referințe către `rixar.ro/uploads/...` erau rupte și pe site-ul original (domeniul nu e conectat). Localizarea imaginilor = de făcut după decizia finală.
- Sursa copiei: `Downloads/rixair_site_copy.json` (14 MB) — păstreaz-o ca backup.

## Structură
```
docs/                  ← site-ul (copie 1:1) — GitHub Pages publică de aici
generator_v3/build.py  ← generatorul vechi (NU-l rula peste docs/ — l-ar suprascrie)
data/                  ← produse.json cu datele CORECTE (pt. corecturi viitoare)
poze/                  ← pozele locale de produs
```
