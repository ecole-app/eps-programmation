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

// Fausse base en ligne partagée par deux « appareils » (deux contextes de navigateur séparés).
const FAUSSE_BASE = `(function(){
  const store = window.__BASE || (window.__BASE = {});
  function ref(path){
    return {
      id: path.split('/').pop(),
      get: async () => { const pre = path + '/'; const docs = Object.keys(store).filter(k => k.startsWith(pre) && !k.slice(pre.length).includes('/')).map(k => mk(k)); return { docs, forEach: f => docs.forEach(f) }; },
      set: async (d, o) => { store[path] = o && o.merge ? Object.assign({}, store[path] || {}, d) : d; },
      delete: async () => { delete store[path]; },
      collection: (n) => col(path + '/' + n),
      doc: (i) => ref(path + '/' + i)
    };
  }
  function mk(k){ return { id: k.split('/').pop(), data: () => store[k], ref: ref(k) }; }
  function col(path){ const r = ref(path); return { get: r.get, doc: (i) => ref(path + '/' + i) }; }
  window.__fausseDb = { collection: (n) => col(n) };
})();`;

describe("Documents synchronisés entre appareils", () => {
  it("un document ajouté sur le téléphone arrive sur le PC, le renommage et la suppression suivent", async () => {
    const base = {};
    const ouvrir = async () => {
      const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
      await p.evaluate((src) => { eval(src); cloudDb = window.__fausseDb; cloudReady = true; }, FAUSSE_BASE);
      return p;
    };
    const tel = await ouvrir();
    await tel.click(".nav-tab[onclick*=\"'documents'\"]");
    const gros = "A".repeat(1300 * 1024); // 3 morceaux
    await tel.setInputFiles("#docInput", [fichier("Fiche.pdf", gros)]);
    await tel.waitForFunction(() => window.__BASE && Object.keys(window.__BASE).some((k) => k.startsWith("eps-docs/") && !k.includes("/parts/")), null, { timeout: 15000 });
    const copie = await tel.evaluate(() => JSON.parse(JSON.stringify(window.__BASE)));
    assert.equal(Object.keys(copie).filter((k) => k.includes("/parts/")).length, 3);

    const pc = await ouvrir();
    await pc.evaluate((c) => { Object.assign(window.__BASE, c); }, copie);
    await pc.evaluate(() => docCloudSync());
    const taille = await pc.evaluate(async () => (await docTout())[0].blob.size);
    assert.equal(taille, 1300 * 1024);

    // renommage sur le PC, vu par le téléphone
    await pc.evaluate(async () => { const d = (await docTout())[0]; d.name = "Neuf.pdf"; d.upd = Date.now() + 10; await docEcrire(d); await docCloudMeta(d); });
    const copie2 = await pc.evaluate(() => JSON.parse(JSON.stringify(window.__BASE)));
    await tel.evaluate((c) => { Object.keys(window.__BASE).forEach((k) => delete window.__BASE[k]); Object.assign(window.__BASE, c); }, copie2);
    await tel.evaluate(() => docCloudSync());
    assert.equal(await tel.evaluate(async () => (await docTout())[0].name), "Neuf.pdf");

    // suppression sur le PC, le téléphone la répercute
    await pc.evaluate(async () => { const d = (await docTout())[0]; await docCloudSupprimer(d.id); });
    const copie3 = await pc.evaluate(() => JSON.parse(JSON.stringify(window.__BASE)));
    await tel.evaluate((c) => { Object.keys(window.__BASE).forEach((k) => delete window.__BASE[k]); Object.assign(window.__BASE, c); }, copie3);
    await tel.evaluate(() => docCloudSync());
    assert.equal(await tel.evaluate(async () => (await docTout()).length), 0);
    assert.deepEqual(tel.erreurs, []);
  });
  it("un fichier de plus de 5 Mo reste sur l'appareil", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    const r = await p.evaluate(async () => {
      cloudReady = true; cloudDb = {};
      const d = { id: "g1", name: "Gros.pdf", size: 6 * 1048576, blob: new Blob(["x"]) };
      return await docCloudEnvoyer(d);
    });
    assert.equal(r, false);
  });
});

