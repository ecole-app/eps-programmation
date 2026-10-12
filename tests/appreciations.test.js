// Appréciations : élèves de la classe, genre automatique, EPS seulement, génération (classique et IA simulée).
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrer, ANNEE } from "./outils.js";

let env;
before(async () => { env = await demarrer(); });
after(async () => { await env.arreter(); });

const STOCK = {
  ["eleves-" + ANNEE]: { "5e": ["Zitouni", "Rayane"], "6e": ["Lina"], "3e": [] },
  ["genres-" + ANNEE]: { "5e": { Zitouni: "M", Rayane: "F" }, "6e": { Lina: "F" } },
};
const json = (obj, status = 200) => (route) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(obj) });

for (const f of ["appreciations.html", "appreciations-ia.html"]) {
  describe(f, () => {
    it("menu des élèves de la classe choisie + choix « Autre prénom »", async () => {
      const p = await env.page(f, { stockage: STOCK });
      await p.selectOption("#classe", "5e");
      const opts = await p.$$eval("#prenom-select option", (o) => o.map((x) => x.value));
      assert.deepEqual(opts, ["", "Zitouni", "Rayane", "__autre__"]);
      assert.equal(await p.isVisible("#prenom"), false);
      await p.selectOption("#prenom-select", "__autre__");
      assert.equal(await p.isVisible("#prenom"), true);
    });
    it("classe sans élèves : champ libre, pas de menu", async () => {
      const p = await env.page(f, { stockage: STOCK });
      await p.selectOption("#classe", "3e");
      assert.equal(await p.isVisible("#prenom-select"), false);
      assert.equal(await p.isVisible("#prenom"), true);
    });
    it("choisir l'élève règle le genre (Rayane = fille)", async () => {
      const p = await env.page(f, { stockage: STOCK });
      await p.selectOption("#classe", "5e");
      await p.selectOption("#prenom-select", "Rayane");
      assert.equal(await p.evaluate(() => genre), "F");
      await p.selectOption("#prenom-select", "Zitouni");
      assert.equal(await p.evaluate(() => genre), "M");
    });
    it("matière : EPS uniquement", async () => {
      const p = await env.page(f, { stockage: STOCK });
      for (const cl of ["6e", "5e", "4e", "3e"]) {
        await p.selectOption("#classe", cl);
        assert.deepEqual(await p.$$eval("#matiere option", (o) => o.map((x) => x.value)), ["EPS"]);
      }
    });
    it("mots-clés EPS ajoutés présents (positifs et à travailler)", async () => {
      const p = await env.page(f);
      const k = await p.evaluate(() => [MAT.EPS.pos.map((c) => c.k), MAT.EPS.neg.map((c) => c.k)]);
      assert.ok(k[0].includes("progres_e") && k[0].includes("coop_e"));
      assert.ok(k[1].includes("echauf_n") && k[1].includes("decour_e"));
    });
    it("chaque mot-clé EPS a une phrase (version classique)", async () => {
      const p = await env.page(f);
      const manque = await p.evaluate(() => [
        ...MAT.EPS.pos.filter((c) => !NOMS[c.k] && !ADJS[c.k]).map((c) => c.k),
        ...MAT.EPS.neg.filter((c) => !NEG_PHRS[c.k]).map((c) => c.k),
      ]);
      assert.deepEqual(manque, []);
    });
  });
}

describe("Génération classique", () => {
  it("phrase accordée au féminin, ≤ 255 caractères", async () => {
    const p = await env.page("appreciations.html", { stockage: STOCK });
    await p.selectOption("#classe", "5e");
    await p.selectOption("#prenom-select", "Rayane");
    await p.evaluate(() => { sel.investi = "pos"; sel.serieux = "pos"; sel.bavard_e = "neg"; generer(); });
    const ph = await p.evaluate(() => phrase);
    assert.match(ph, /investie|sérieuse/);
    assert.ok(ph.length <= 255, ph.length + " caractères");
    assert.deepEqual(p.erreurs, []);
  });
});

describe("Génération IA (OpenRouter simulé, jamais appelé pour de vrai)", () => {
  const MODELES = json({ data: [{ id: "a/modele:free" }, { id: "b/gemma:free" }, { id: "c/deepseek-r1:free" }] });

  it("modèle en panne puis réponse vide : passe au suivant et rend une phrase propre", async () => {
    const appels = [];
    let n = 0;
    const p = await env.page("appreciations-ia.html", {
      stockage: STOCK,
      routes: {
        "/api/v1/models": MODELES,
        "/chat/completions": (route) => {
          appels.push(JSON.parse(route.request().postData()).model);
          n++;
          if (n === 1) return json({ error: { message: "Provider returned error" } }, 502)(route);
          if (n === 2) return json({ choices: [{ message: { content: "" } }] })(route);
          return json({ choices: [{ message: { content: "« Zitouni est investi — et sérieux ! »" } }] })(route);
        },
      },
    });
    const r = await p.evaluate(() => genererOpenRouter("sk-or-test", "x").then(humaniser));
    assert.equal(r, "Zitouni est investi, et sérieux.");
    assert.equal(appels.length, 3);
    assert.ok(!appels.some((m) => /r1/.test(m)), "un modèle à réflexion a été essayé : " + appels.join(", "));
  });
  it("tout en panne : message clair", async () => {
    const p = await env.page("appreciations-ia.html", {
      routes: { "/api/v1/models": MODELES, "/chat/completions": json({ error: { message: "Provider returned error" } }, 502) },
    });
    const msg = await p.evaluate(() => genererOpenRouter("sk-or-test", "x").then(() => "ok", (e) => e.message));
    assert.match(msg, /indisponibles pour le moment/);
  });
  it("humaniser : coupe proprement à 255 caractères", async () => {
    const p = await env.page("appreciations-ia.html");
    const r = await p.evaluate(() => humaniser("Phrase assez longue pour le test. ".repeat(15)));
    assert.ok(r.length <= 255 && r.endsWith("."));
  });
});
