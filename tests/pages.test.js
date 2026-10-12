// Chaque page du site se charge sans erreur JavaScript.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrer } from "./outils.js";

let env;
before(async () => { env = await demarrer(); });
after(async () => { await env.arreter(); });

describe("Chargement des pages", () => {
  for (const f of ["index.html", "baremes.html", "appreciations.html", "appreciations-ia.html"]) {
    it(f + " : aucune erreur", async () => {
      const p = await env.page(f);
      assert.deepEqual(p.erreurs, []);
    });
  }
  it("index.html sur téléphone : aucune erreur", async () => {
    const p = await env.page("index.html", { largeur: 390 });
    assert.deepEqual(p.erreurs, []);
  });
});
