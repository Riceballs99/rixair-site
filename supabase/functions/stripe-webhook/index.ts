// Primeste evenimente de la Stripe; la plata reusita salveaza comanda in tabelul comenzi.
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const whSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // doar pe server; ocoleste RLS pentru insert
);

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, whSecret);
  } catch {
    return new Response("semnatura invalida", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const full = await stripe.checkout.sessions.retrieve(s.id, { expand: ["line_items"] });
    const produse = (full.line_items?.data ?? []).map((li) => ({
      descriere: li.description,
      cantitate: li.quantity,
      suma: (li.amount_total ?? 0) / 100,
    }));
    await db.from("comenzi").insert({
      email: s.customer_details?.email ?? s.customer_email ?? "",
      nume: s.customer_details?.name ?? null,
      telefon: s.customer_details?.phone ?? null,
      adresa: s.customer_details?.address ?? null,
      produse,
      total: (s.amount_total ?? 0) / 100,
      status: "platita",
      stripe_session: s.id,
    });
  }
  return new Response("ok", { headers: { "Content-Type": "text/plain" } });
});
