// Onglet Documents : ajout, recherche, renommage, suppression (stockage local du navigateur).
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrer } from "./outils.js";

let env, APP;
before(async () => { env = await demarrer(); APP = await env.sauvegardeApp(); });
after(async () => { await env.arreter(); });

const fichier = (name, txt = "x") => ({ name, mimeType: "application/pdf", buffer: Buffer.from(txt) });

describe("Documents perso", () => {
  it("ajoute plusieurs fichiers dans une catégorie, les liste et les garde après rechargement", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    await p.click(".nav-tab[onclick*=\"'documents'\"]");
    await p.selectOption("#docCatAjout", "CAPEPS");
    await p.setInputFiles("#docInput", [fichier("Formation.pdf"), fichier("Citoyenneté.pdf")]);
    await p.waitForFunction(() => document.querySelectorAll(".doc-ligne").length === 2);
    assert.equal(await p.locator(".doc-ligne").count(), 2);
    await p.reload(); await p.click(".nav-tab[onclick*=\"'documents'\"]");
    await p.waitForFunction(() => document.querySelectorAll(".doc-ligne").length === 2);
    assert.equal(await p.locator(".doc-ligne").count(), 2);
    assert.deepEqual(p.erreurs, []);
  });
  it("la recherche filtre, un nom piégé n'injecte pas de HTML, la suppression fonctionne", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    await p.click(".nav-tab[onclick*=\"'documents'\"]");
    await p.setInputFiles("#docInput", [fichier("Programme.pdf"), fichier("<img src=x onerror=window.__pwn=1>.pdf")]);
    await p.waitForFunction(() => document.querySelectorAll(".doc-ligne").length === 2);
    assert.equal(await p.evaluate(() => window.__pwn), undefined);
    await p.fill("#docRecherche", "progr");
    await p.waitForFunction(() => document.querySelectorAll(".doc-ligne").length === 1);
    p.on("dialog", (d) => d.accept());
    await p.click(".doc-ligne button[title=Supprimer]");
    await p.waitForFunction(() => document.querySelectorAll(".doc-ligne").length === 0);
  });
  it("les documents ne sont jamais synchronisés ni exportés avec les données EPS", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    assert.equal(await p.evaluate(() => isEpsKey("doc-derniere-cat")), false);
  });
});
