// App principale : élèves et genres, synchro limitée aux données EPS, onglets intégrés.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrer, ANNEE } from "./outils.js";

let env, APP;
before(async () => { env = await demarrer(); APP = await env.sauvegardeApp(); });
after(async () => { await env.arreter(); });

describe("Données synchronisées", () => {
  it("seules les clés EPS partent dans le cloud (jamais celles d'ASMB / General Manager)", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    const r = await p.evaluate((a) => ["eps-v2", "notes-" + a, "eleves-" + a, "genres-" + a, "seances-motif-" + a, "cycle-clos-" + a, "asmb_licences", "gm-club", "eps_api_key", "eps_v3"].map((k) => k + ":" + isEpsKey(k)), ANNEE);
    assert.deepEqual(r.filter((x) => x.endsWith("true")).map((x) => x.split(":")[0]),
      ["eps-v2", "notes-" + ANNEE, "eleves-" + ANNEE, "genres-" + ANNEE, "seances-motif-" + ANNEE, "cycle-clos-" + ANNEE]);
  });
});

describe("Élèves", () => {
  it("« Prénom, F » / « Prénom, G » : la liste reste propre et le genre est mémorisé", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    await p.evaluate(() => { openElevesModal(); document.getElementById("el_4e").value = "Mina, F\nAdel, G\nSans Genre"; saveElevesModal(); });
    const [el, gen] = await p.evaluate((a) => [JSON.parse(localStorage.getItem("eleves-" + a)), JSON.parse(localStorage.getItem("genres-" + a))], ANNEE);
    assert.deepEqual(el["4e"], ["Mina", "Adel", "Sans Genre"]);
    assert.deepEqual(gen["4e"], { Mina: "F", Adel: "M" });
  });
  it("à la réouverture, le genre est réaffiché après le prénom", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP, ["eleves-" + ANNEE]: { "3e": ["Younes"] }, ["genres-" + ANNEE]: { "3e": { Younes: "M" } } } });
    await p.evaluate(() => openElevesModal());
    assert.equal(await p.inputValue("#el_3e"), "Younes, M");
  });
  it("pré-remplissage des genres : ne remplace jamais un genre déjà mis", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP, ["eleves-" + ANNEE]: { "6e": ["Shain", "Lina"] }, ["genres-" + ANNEE]: { "6e": { Lina: "M" } } } });
    const g = await p.evaluate((a) => JSON.parse(localStorage.getItem("genres-" + a))["6e"], ANNEE);
    assert.equal(g.Lina, "M");
    assert.equal(g.Shain, "M");
  });
  it("modifier la liste met à jour l'onglet Appréciations déjà ouvert", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP, ["eleves-" + ANNEE]: { "5e": ["Amina"] } } });
    await p.click(".nav-tab[onclick*=\"'appreciations'\"]");
    await p.waitForTimeout(800);
    const fr = p.frames().find((x) => x.url().includes("appreciations"));
    await fr.selectOption("#classe", "5e");
    await p.click(".nav-tab[onclick*=\"'aujourdhui'\"]");
    await p.evaluate(() => { openElevesModal(); document.getElementById("el_5e").value = "Amina, F\nNouvelle, F"; saveElevesModal(); });
    await p.click(".nav-tab[onclick*=\"'appreciations'\"]");
    await p.waitForTimeout(200);
    assert.deepEqual(await fr.$$eval("#prenom-select option", (o) => o.map((x) => x.value)), ["", "Amina", "Nouvelle", "__autre__"]);
  });
});

describe("Onglets intégrés", () => {
  it("Barèmes et Appréciations se chargent dans l'app sans erreur", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    await p.click(".nav-tab[onclick*=\"'baremes'\"]");
    await p.click(".nav-tab[onclick*=\"'appreciations'\"]");
    await p.waitForTimeout(1000);
    const urls = p.frames().map((f) => f.url()).join(" ");
    assert.match(urls, /baremes\.html/);
    assert.match(urls, /appreciations\.html/);
    assert.deepEqual(p.erreurs, []);
  });
});
