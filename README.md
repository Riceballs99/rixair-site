# SITE RIXAIR — site static, gestionat prin cod
Site-ul public RIXAIR (rixair.ro): catalog Clivet cu 27 produse, generat dintr-un singur fișier de date.

## Cum funcționează
```
data/produse.json    ← SURSA DE ADEVĂR (toate produsele: nume, SKU, prețuri, variante, SEO)
data/site.json       ← date firmă/contact
data/descrieri/*.html← descrierile produselor (HTML)
poze/                ← pozele originale
build.py             ← generatorul
docs/                ← SITE-UL GENERAT (asta publică GitHub Pages) — nu edita manual!
```

## Workflow: adaugi/modifici un produs
1. Editezi `data/produse.json` (copiezi un produs existent ca model; pentru variante: listă `{nume, pret, sku}`; fără preț → `"pret_tip": "la_cerere"`).
2. (opțional) Adaugi descrierea în `data/descrieri/NN.html` și poza în `poze/`.
3. Rulezi: `python build.py`
4. Publici: `git add -A && git commit -m "produs nou" && git push`
→ Site-ul se actualizează automat în ~1 minut.

## Publicare pe GitHub Pages (o singură dată)
1. Creează cont/repo pe github.com (ex. repo `rixair-site`, poate fi privat la Pages doar cu plan plătit → folosește PUBLIC).
2. În acest folder:
   ```
   git remote add origin https://github.com/UTILIZATOR/rixair-site.git
   git push -u origin main
   ```
3. Pe GitHub: Settings → Pages → Source: branch `main`, folder `/docs` → Save.
4. Site-ul apare la `https://UTILIZATOR.github.io/rixair-site/` (verificare rapidă).

## Conectare domeniu rixair.ro (la registrarul domeniului)
1. DNS: 4 înregistrări **A** pentru `rixair.ro` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` + **CNAME** `www` → `UTILIZATOR.github.io`.
2. GitHub: Settings → Pages → Custom domain: `rixair.ro` → Save → bifează **Enforce HTTPS** (SSL gratuit, automat).
3. Fișierul `docs/CNAME` există deja (rixair.ro).

## De știut
- Site **fără cookie-uri/analytics** → nu cere banner de consimțământ. Dacă adaugi GA4 mai târziu, trebuie și banner.
- Formular de contact: momentan CTA pe email/telefon (funcționează garantat pe hosting static). Se poate adăuga formular cu Formspree (gratuit ~50 trimiteri/lună) — cere-mi și îl integrez.
- Prețurile „la cerere": Sphera INVISIBLE, Hybrid TOWER/BOX, AQUA SWAN, AQUA F — se completează în `produse.json` când vin prețurile (vezi `04_Gomag_Produse/COPIE_SITE/00_MASTER_Catalog_Site.xlsx`, foaia Blocat).
- Fișele tehnice PDF nu sunt încă pe site („la cerere") — se pot adăuga ulterior în `docs/fise/`.
- Gomag: rămâne separat; dacă renunți la el, anunță furnizorul ca să nu plătești degeaba.

## v2 — Replica temei Gomag (10.06.2026)
- Design 1:1 după site-ul Gomag live: font Signika, header cu căutare+coș, meniu cu subcategorii (MONOBLOC / REFRIGERANT-Split / Split HIBRID / SINGLE SPLIT), strip Clivet, hero, carusele pe categorii, secțiunea „Prezenți în România din 1993", formular „TRIMITEȚI O SOLICITARE" (trimite pe email), secțiunea Showroom, footer teal cu ANPC/SAL/SOL.
- Pagina de produs: breadcrumb, telefoane, galerie, selector variante (prețul se schimbă din dropdown), „✓ In stoc", buton galben „CERE OFERTĂ" (pe email — nu există coș real pe site static).
- ⚠ 3 imagini mari sunt momentan hotlink de pe CDN-ul Gomag (hero, fabrica Clivet, showroom). Ca să nu depindă de Gomag: salvează-le (clic dreapta → Save image) de pe site-ul Gomag în `poze/` cu numele `hero.png`, `factory.jpg`, `showroom.png`, apoi rulează `python build.py` — generatorul le preia automat local.
- Căutarea din header e vizuală (fără funcție de căutare pe site static — se poate adăuga ulterior cu lunr.js).
