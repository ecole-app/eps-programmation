// Appli installable (PWA) et affichage téléphone.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { demarrer } from "./outils.js";

let env, APP;
before(async () => { env = await demarrer(); APP = await env.sauvegardeApp(); });
after(async () => { await env.arreter(); });
const tel = (extra = {}) => env.page("index.html", { largeur: 390, hauteur: 844, mobile: true, stockage: { "eps-v2": APP }, ...extra });

describe("Appli installable", () => {
  it("manifeste complet, icônes présentes, liens dans la page", async () => {
    const m = JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
    assert.equal(m.display, "standalone");
    assert.equal(m.scope, "./");
    assert.ok(m.icons.some((i) => i.sizes === "512x512" && i.purpose === "maskable"));
    for (const i of m.icons) await readFile(new URL("../" + i.src, import.meta.url));
    const p = await tel();
    assert.equal(await p.locator('link[rel="manifest"]').count(), 1);
    assert.equal(await p.locator('link[rel="apple-touch-icon"]').count(), 1);
  });
  it("le service worker s'installe et garde le site pour le hors-ligne", async () => {
    const p = await tel({ sw: true });
    const ok = await p.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      for (let i = 0; i < 50; i++) { const c = await caches.open("eps-programmation-v3"); if ((await c.keys()).length >= 6) return [reg.scope, (await c.keys()).length]; await new Promise((r) => setTimeout(r, 100)); }
      return [reg.scope, 0];
    });
    assert.match(ok[0], /\/$/);
    assert.ok(ok[1] >= 6);
  });
});

describe("Téléphone", () => {
  it("barre du bas à la place des onglets, la feuille Plus ouvre les autres pages", async () => {
    const p = await tel();
    assert.equal(await p.locator(".nav-tabs").isVisible(), false);
    await p.click('#bnav button[data-page="baremes"]');
    assert.ok(await p.locator("#page-baremes").evaluate((e) => e.classList.contains("active")));
    assert.match(await p.locator('#bnav button.on').textContent(), /Barèmes/);
    await p.click('#bnav button[data-page="plus"]');
    await p.click('.plus-grid button:has-text("Planning")');
    assert.ok(await p.locator("#page-planning").evaluate((e) => e.classList.contains("active")));
    assert.match(await p.locator('#bnav button.on').textContent(), /Plus/);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth), 390);
    assert.deepEqual(p.erreurs, []);
  });
  it("planning : une classe à la fois", async () => {
    const p = await tel();
    await p.evaluate(() => navMobile("planning"));
    const visibles = () => p.locator(".periode-row >> nth=0").evaluate((r) => [...r.children].filter((c) => getComputedStyle(c).display !== "none").length);
    assert.equal(await visibles(), 2);
    await p.click('#plCl button:has-text("4e")');
    assert.equal(await p.locator(".grid-head .gh-cell").evaluateAll((cs) => cs.filter((c) => getComputedStyle(c).display !== "none").map((c) => c.textContent).join()), "Cycle,4e");
  });
  it("l'adresse #page ouvre directement la bonne page (raccourcis de l'appli)", async () => {
    const p = await tel();
    await p.goto(p.url().split("#")[0] + "#appreciations"); await p.waitForTimeout(400);
    assert.ok(await p.locator("#page-appreciations").evaluate((e) => e.classList.contains("active")));
  });
  it("sur ordinateur, rien ne change : onglets en haut, pas de barre du bas", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    assert.equal(await p.locator(".nav-tabs").isVisible(), true);
    assert.equal(await p.locator("#bnav").isVisible(), false);
  });
  it("taille d'affichage : A+ agrandit et le réglage est gardé", async () => {
    const p = await tel();
    await p.evaluate(() => zoomApp(0.2));
    assert.equal(await p.evaluate(() => document.documentElement.style.zoom), "1.2");
    assert.equal(await p.evaluate(() => localStorage.getItem("eps-zoom")), "1.2");
    assert.deepEqual(p.erreurs, []);
  });
});
