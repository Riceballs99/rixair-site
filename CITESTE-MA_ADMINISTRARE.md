# Administrare produse (backend pe GitHub)

## Cum funcționează
- **Baza de date**: `data/produse.json` (nume, SKU, prețuri, variante, stoc, vizibilitate)
- **Motorul**: `sync.py` — rescrie prețurile/stocul pe toate paginile site-ului
- **Automatizarea**: `.github/workflows/sync.yml` — la orice modificare a `produse.json` pe GitHub, sincronizarea rulează singură și site-ul se actualizează în ~1 minut
- **Panoul**: `https://rixair.ro/admin/` — tabel cu toate produsele: schimbi preț/stoc → „Salvează în site" → gata

## Stoc per produs (câmpul `stoc` în produse.json)
- `in_stoc` — „In stoc" (implicit)
- `la_comanda` — „La comandă"
- `ascuns` — produsul dispare de pe listări + din căutare

## Folosire de pe PC (fără browser)
1. Modifici `data/produse.json`
2. Dublu-click `SINCRONIZEAZA.bat`
3. Dublu-click `PUBLICA.bat`

## Panoul /admin/ — prima configurare (după publicarea pe GitHub)
1. GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token
2. Repository access: DOAR repo-ul site-ului; Permissions: **Contents → Read and write**
3. Deschizi `rixair.ro/admin/`, lipești token-ul + numele repo-ului (ex: `rixair/rixair-site`)
4. Token-ul rămâne salvat doar în browserul tău (nu e pe site, nu e public)

## Important
- NU edita prețuri direct în fișierele HTML — vor fi suprascrise la următoarea sincronizare
- Pagina /admin/ e blocată pentru Google (robots + noindex)
