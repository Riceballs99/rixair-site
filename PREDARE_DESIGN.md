# RIXAIR — Predare pentru lucru la design

## Acces
- **Repo (site-ul complet, referinta):** https://github.com/rixair-ro/rixair-site
- Pentru drept de push: invitatie de colaborator (GitHub -> repo -> Settings -> Collaborators)

## Cum rulezi site-ul local
1. `git clone https://github.com/rixair-ro/rixair-site.git`
2. Windows: dublu-click `PORNESTE_PREVIEW.bat` -> http://localhost:8080
   Mac/Linux: `python3 -m http.server 8080 -d docs`

## Unde e design-ul
- `docs/rixair-static.css` — stilurile noastre (header, cos, butoane, banner) — fisierul principal de lucru
- `docs/themes/fashion/css/` — tema de baza (mostenita) — doar daca e necesar
- `docs/calculator/index.html` — calculatorul HVAC, COMPLET self-contained (HTML+CSS+JS intr-un singur fisier)
- `docs/cont/`, `docs/admin/`, `docs/plata-reusita.html` — pagini cu CSS inline propriu
- `docs/poze-rx/` — logo + imagini proprii

**Brand:** font Signika (Google Fonts) · albastru #1583ab / #0d7193 · galben #f4c340 · verde #2e7d32

## REGULI CRITICE — ce NU se atinge
1. NU edita preturi/stocuri/variante in HTML — sunt generate din `data/produse.json` de `sync.py`; editarile manuale se suprascriu.
2. Nu umbla la: `data/`, `sync.py`, `supabase/`, `.github/`, `docs/request/`, `docs/rixair-search-data.js`
3. Nu sterge/redenumi clase `rx-*` (cos, preturi, cautare) sau `-g-*` (scripturi mostenite). Restilizarea lor in CSS e libera.
4. `docs/rixair-static.js` = logica site-ului — modificari doar cu intrebare prealabila.
5. La schimbari CSS/JS creste versiunea `?v=NN` din linkuri (cache busting).

## Workflow
Branch separat (`design/...`) -> Pull Request -> aprobarea proprietarului. `main`/docs se publica automat pe GitHub Pages.

## Nota despre calculator
`docs/calculator/index.html` e independent: se poate deschide direct in browser, fara server. Logica de calcul si legaturile catre produse (scriptul `rx-prodlink` din finalul fisierului) trebuie pastrate functionale; restul (stiluri, layout, tipografie) e liber de redesenat.
