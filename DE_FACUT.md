# RIXAIR — De făcut (backlog)

## Site / funcțional
- [ ] **Checkout custom pe site** — pagină de plată proprie cu Stripe Payment Element (design 100% al nostru, câmpuri card stilizate); înlocuiește redirecționarea către checkout.stripe.com. Necesită: funcție nouă pe PaymentIntent + pagina /plata/.
- [ ] **Branding checkout Stripe actual** (interimar) — Stripe Dashboard → Settings → Branding: logo RIXAIR, accent #1583ab, buton #f4c340. (de făcut de proprietar, 5 min)
- [ ] **Notificări email la comandă nouă** — cont Resend (gratuit 3000/lună) + verificare domeniu (după DNS) + email frumos în română către office@rixar.ro și client. Tot atunci: șabloane RO pentru emailurile de cont (reset parolă) prin SMTP custom în Supabase.
- [ ] **Design nou calculator** — în lucru extern (predat: calculator/index.html + PREDARE_DESIGN.md); la primire: implementare pe site cu păstrarea logicii + rx-prodlink.
- [ ] Design general site — handoff extern (PREDARE_DESIGN.md)

## Lansare
- [ ] **DNS rixair.ro** — 4×A: 185.199.108.153 / .109 / .110 / .111 + CNAME www → rixair-ro.github.io; apoi: Enforce HTTPS în GitHub Pages, SITE_URL=https://rixair.ro în secretele Supabase, verificare video hero pe domeniul real
- [ ] **Stripe live** — activare cont cu datele firmei (CUI RO 40039921, J35/3638/2018, IBAN) → schimbat cheile sandbox→live în Supabase Secrets + webhook nou pe live
- [ ] Parola contului admin (andreioprescu2017@gmail.com) — reîncearcă „Am uitat parola" (limita de email a expirat); formularul de resetare e funcțional acum

## De la business (blocante pentru produse)
- [ ] 5 prețuri lipsă: Sphera INVISIBLE (rezervor 150L inclus?), cazan FE 24.4, confirmare Hybrid TOWER (4.532 suspect), AQUA SWAN 200/270L, AQUA F 190L
- [ ] 2 imagini decorative de salvat din Gomag în SITE_RIXAIR/poze/: clivet-blue6673.png, randare-01-20251212-crop.png
- [ ] Prețuri pentru variantele „la cerere” (Hydro/Hybrid/VCV) — se completează în /admin/ pe măsură ce vin
