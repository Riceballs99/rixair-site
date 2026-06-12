// Creeaza o sesiune Stripe Checkout din cosul clientului.
// Preturile sunt validate pe server contra catalogului produse.json publicat pe site
// (clientul nu poate trimite preturi false).
import Stripe from "npm:stripe@17";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const CATALOG_URL = Deno.env.get("CATALOG_URL") ?? "https://raw.githubusercontent.com/rixair-ro/rixair-site/main/data/produse.json";
const SITE = Deno.env.get("SITE_URL") ?? "http://localhost:8080";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { items, email } = await req.json(); // items: [{sku, qty}]
    if (!Array.isArray(items) || !items.length) throw new Error("cos gol");

    const catalog = await (await fetch(CATALOG_URL)).json();
    const skuMap = new Map<string, { nume: string; pret: number | null; produs: string }>();
    for (const p of catalog) {
      for (const v of (p.variante ?? [])) skuMap.set(v.sku, { nume: v.nume, pret: v.pret, produs: p.nume });
      if (p.sku && !skuMap.has(p.sku)) skuMap.set(p.sku, { nume: p.nume, pret: p.pret_de_la ?? null, produs: p.nume });
    }

    const line_items = items.map((it: { sku: string; qty: number }) => {
      const v = skuMap.get(it.sku);
      if (!v) throw new Error("produs necunoscut: " + it.sku);
      if (!v.pret) throw new Error("produs fara pret online: " + it.sku);
      return {
        quantity: Math.max(1, Math.min(99, it.qty | 0)),
        price_data: {
          currency: "ron",
          unit_amount: Math.round(v.pret * 100),
          product_data: { name: v.produs + " — " + v.nume, metadata: { sku: it.sku } },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: email || undefined,
      success_url: SITE + "/plata-reusita.html?s={CHECKOUT_SESSION_ID}",
      cancel_url: SITE + "/cos-de-cumparaturi",
      metadata: { skus: JSON.stringify(items) },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
